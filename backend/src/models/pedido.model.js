// Model de pedidos: creación transaccional e historial del cliente.
const db = require('../config/database');
const ApiError = require('../utils/ApiError');
const productoModel = require('./producto.model');

const COSTO_ENVIO = 5.0; // costo fijo de delivery
const DESCUENTO_BIENVENIDA = 'BIENVENIDA_RAMEN'; // nombre en la tabla Descuentos

// Redondea a 2 decimales para evitar errores de coma flotante.
const redondear = (n) => Math.round(n * 100) / 100;

// Crea el pedido completo en una transacción: si algo falla no se guarda nada.
async function crear({ idCliente, tipoEntrega, direccion, idMetodo, items }) {
  return db.transaction(async (trx) => {
    // Método de pago existente.
    if (!(await trx('Metodos_Pago').where({ id_metodo: idMetodo }).first())) {
      throw new ApiError(400, 'Método de pago no válido');
    }

    // Precios reales desde la BD (oferta incluida); el cliente nunca los envía.
    const ids = [...new Set(items.map((i) => i.idProducto))];
    const precios = await productoModel.preciosVigentes(trx, ids);
    if (precios.size !== ids.length) throw new ApiError(400, 'Algún producto no existe o no está disponible');

    // La primera compra se cuenta antes de insertar el pedido nuevo.
    const [{ total }] = await trx('Pedidos').where({ id_cliente: idCliente }).count({ total: '*' });
    const primeraCompra = Number(total) === 0;

    // Delivery solo si aplica.
    let idDelivery = null;
    if (tipoEntrega === 'Delivery') {
      [idDelivery] = await trx('Deliveries').insert({ direccion_entrega: direccion, estado_envio: 'En preparación' });
    }

    const [idPedido] = await trx('Pedidos').insert({
      id_cliente: idCliente,
      id_delivery: idDelivery,
      estado_preparacion: 'Pendiente',
      tipo_entrega: tipoEntrega,
    });

    // Detalle de cada plato y sus extras con precio.
    let sumaProductos = 0;
    for (const item of items) {
      const precioUnitario = precios.get(item.idProducto);
      const totalExtras = item.extras.reduce((s, e) => s + e.precio_adicional, 0);
      const subtotal = redondear((precioUnitario + totalExtras) * item.cantidad);
      sumaProductos += subtotal;

      const [idDetalle] = await trx('Detalle_Pedidos').insert({
        id_pedido: idPedido,
        id_producto: item.idProducto,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario,
        subtotal,
        personalizacion: item.personalizacion ? JSON.stringify(item.personalizacion) : null,
        notas: item.notas,
      });

      if (item.extras.length > 0) {
        await trx('Modificaciones_Detalle').insert(
          item.extras.map((e) => ({
            id_detalle: idDetalle,
            opcion_elegida: e.opcion,
            precio_adicional: e.precio_adicional,
          }))
        );
      }
    }
    sumaProductos = redondear(sumaProductos);

    // Descuento de bienvenida: porcentaje leído de la tabla Descuentos.
    let montoDescuento = 0;
    let idDescuento = null;
    if (primeraCompra) {
      const descuento = await trx('Descuentos').where({ nombre_descuento: DESCUENTO_BIENVENIDA }).first();
      if (descuento) {
        idDescuento = descuento.id_descuento;
        montoDescuento = redondear((sumaProductos * descuento.porcentaje) / 100);
      }
    }

    // Totales y registro de checkout.
    const costoEnvio = tipoEntrega === 'Delivery' ? COSTO_ENVIO : 0;
    const totalFinal = redondear(sumaProductos + costoEnvio - montoDescuento);

    await trx('Checkout_Ordenes').insert({
      id_pedido: idPedido,
      id_metodo: idMetodo,
      id_descuento: idDescuento,
      monto_descuento: montoDescuento,
      total_final: totalFinal,
      estado_pago: 'Pendiente',
    });

    return {
      id_pedido: idPedido,
      subtotal: sumaProductos,
      costo_envio: costoEnvio,
      monto_descuento: montoDescuento,
      total_final: totalFinal,
    };
  });
}

// Historial del cliente: pedidos -> detalles -> extras, con 3 consultas en total.
async function historial(idCliente) {
  const pedidos = await db('Pedidos as p')
    .leftJoin('Checkout_Ordenes as co', 'co.id_pedido', 'p.id_pedido')
    .leftJoin('Deliveries as d', 'd.id_delivery', 'p.id_delivery')
    .leftJoin('Metodos_Pago as m', 'm.id_metodo', 'co.id_metodo')
    .where('p.id_cliente', idCliente)
    .orderBy('p.id_pedido', 'desc')
    .select(
      'p.id_pedido',
      'p.estado_preparacion',
      'p.tipo_entrega',
      'd.direccion_entrega',
      'd.estado_envio',
      'm.nombre_metodo as metodo_pago',
      'co.monto_descuento',
      'co.total_final',
      'co.estado_pago'
    );
  if (pedidos.length === 0) return [];

  const detalles = await db('Detalle_Pedidos as dp')
    .join('Productos as pr', 'pr.id_producto', 'dp.id_producto')
    .whereIn('dp.id_pedido', pedidos.map((p) => p.id_pedido))
    .orderBy('dp.id_detalle')
    .select(
      'dp.id_detalle',
      'dp.id_pedido',
      'dp.id_producto',
      'pr.nombre_producto as nombre',
      'pr.imagen',
      'dp.cantidad',
      'dp.precio_unitario',
      'dp.subtotal',
      'dp.personalizacion',
      'dp.notas'
    );

  const extras = detalles.length
    ? await db('Modificaciones_Detalle')
        .whereIn('id_detalle', detalles.map((d) => d.id_detalle))
        .select('id_detalle', 'opcion_elegida as opcion', 'precio_adicional')
    : [];

  // Agrupa extras por detalle y detalles por pedido.
  const extrasPorDetalle = new Map();
  for (const e of extras) {
    if (!extrasPorDetalle.has(e.id_detalle)) extrasPorDetalle.set(e.id_detalle, []);
    extrasPorDetalle.get(e.id_detalle).push({ opcion: e.opcion, precio_adicional: e.precio_adicional });
  }
  const detallesPorPedido = new Map();
  for (const d of detalles) {
    if (!detallesPorPedido.has(d.id_pedido)) detallesPorPedido.set(d.id_pedido, []);
    detallesPorPedido.get(d.id_pedido).push({ ...d, extras: extrasPorDetalle.get(d.id_detalle) || [] });
  }

  return pedidos.map((p) => ({ ...p, items: detallesPorPedido.get(p.id_pedido) || [] }));
}

module.exports = { crear, historial };
