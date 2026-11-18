// Seeder 03: cliente de prueba con su historial de pedidos de ejemplo.
const bcrypt = require('bcryptjs');

const CORREO = 'cliente@ramenmaster.pe';
const CLAVE = '123456'; // solo para desarrollo; en la BD queda su hash bcrypt

/** @param {import('knex').Knex} knex */
exports.seed = async function (knex) {
  // Cliente de prueba: se crea o se actualiza su hash por correo.
  const password_hash = await bcrypt.hash(CLAVE, 10);
  const existente = await knex('Clientes').where({ correo: CORREO }).first();
  let idCliente;
  if (existente) {
    idCliente = existente.id_cliente;
    await knex('Clientes').where({ id_cliente: idCliente }).update({ password_hash });
  } else {
    [idCliente] = await knex('Clientes').insert({
      nombre: 'Cliente',
      apellido: 'Prueba',
      correo: CORREO,
      password_hash,
      telefono: '987654321',
    });
  }

  // Si ya tiene pedidos no se duplican los de ejemplo.
  const [{ total }] = await knex('Pedidos').where({ id_cliente: idCliente }).count({ total: '*' });
  if (Number(total) > 0) return;

  // Pedido 1: delivery entregado, con descuento de bienvenida del 15%.
  const [idDelivery] = await knex('Deliveries').insert({
    id_repartidor: 1,
    direccion_entrega: 'Av. Los Ficus 456, Santa Anita',
    estado_envio: 'Entregado',
  });
  const [pedido1] = await knex('Pedidos').insert({
    id_cliente: idCliente,
    id_delivery: idDelivery,
    estado_preparacion: 'Entregado',
    tipo_entrega: 'Delivery',
  });
  const [detalle1] = await knex('Detalle_Pedidos').insert({
    id_pedido: pedido1,
    id_producto: 1,
    cantidad: 1,
    precio_unitario: 32,
    subtotal: 35,
    personalizacion: JSON.stringify({ picante: 'Rocoto Nikkei suave' }),
    notas: 'Caldo bien caliente',
  });
  await knex('Modificaciones_Detalle').insert({ id_detalle: detalle1, opcion_elegida: 'Huevo Ajitsuke', precio_adicional: 3 });
  await knex('Detalle_Pedidos').insert({
    id_pedido: pedido1,
    id_producto: 6,
    cantidad: 1,
    precio_unitario: 28,
    subtotal: 28,
    personalizacion: JSON.stringify({ picante: 'Sin picante' }),
  });
  // 63.00 de platos - 9.45 (15%) + 5.00 de envío = 58.55
  await knex('Checkout_Ordenes').insert({
    id_pedido: pedido1,
    id_metodo: 2,
    id_descuento: 1,
    monto_descuento: 9.45,
    total_final: 58.55,
    estado_pago: 'Pagado',
  });

  // Pedido 2: retiro en tienda, aún en cocina, con un combo en oferta.
  const [pedido2] = await knex('Pedidos').insert({
    id_cliente: idCliente,
    id_delivery: null,
    estado_preparacion: 'En cocina',
    tipo_entrega: 'Retiro en tienda',
  });
  await knex('Detalle_Pedidos').insert({
    id_pedido: pedido2,
    id_producto: 23,
    cantidad: 1,
    precio_unitario: 46,
    subtotal: 46,
    notas: 'Sin cebollita china',
  });
  const [detalle2] = await knex('Detalle_Pedidos').insert({
    id_pedido: pedido2,
    id_producto: 3,
    cantidad: 1,
    precio_unitario: 31,
    subtotal: 33,
    personalizacion: JSON.stringify({ picante: 'Sin picante' }),
  });
  await knex('Modificaciones_Detalle').insert({ id_detalle: detalle2, opcion_elegida: 'Nori extra', precio_adicional: 2 });
  await knex('Checkout_Ordenes').insert({
    id_pedido: pedido2,
    id_metodo: 1,
    id_descuento: null,
    monto_descuento: 0,
    total_final: 79,
    estado_pago: 'Pagado',
  });
};
