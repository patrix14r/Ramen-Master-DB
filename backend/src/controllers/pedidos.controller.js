// Controller de pedidos: valida el body y delega la lógica al model.
const pedidoModel = require('../models/pedido.model');
const ApiError = require('../utils/ApiError');
const { EXTRAS } = require('../config/extras');

const TIPOS_ENTREGA = ['Delivery', 'Retiro en tienda'];

// Valida y normaliza la lista de items; lanza ApiError(400) si algo es inválido.
function normalizarItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw new ApiError(400, 'El pedido no tiene productos');
  if (items.length > 50) throw new ApiError(400, 'Demasiados productos en el pedido');

  return items.map((item) => {
    const idProducto = Number(item?.id_producto);
    const cantidad = Number(item?.cantidad);
    if (!Number.isInteger(idProducto) || idProducto <= 0) throw new ApiError(400, 'id_producto inválido');
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 50) {
      throw new ApiError(400, 'La cantidad debe ser un entero entre 1 y 50');
    }

    // Notas libres para cocina (máximo 255, como la columna).
    const notas = typeof item.notas === 'string' ? item.notas.trim() : '';
    if (notas.length > 255) throw new ApiError(400, 'Las notas superan 255 caracteres');

    // Personalización estructurada: debe ser un objeto JSON.
    let personalizacion = null;
    if (item.personalizacion !== undefined && item.personalizacion !== null) {
      if (typeof item.personalizacion !== 'object' || Array.isArray(item.personalizacion)) {
        throw new ApiError(400, 'personalizacion debe ser un objeto');
      }
      personalizacion = item.personalizacion;
    }

    // Extras: solo se acepta el nombre; el precio sale SIEMPRE de la lista del servidor.
    const extrasEntrada = item.extras ?? [];
    if (!Array.isArray(extrasEntrada) || extrasEntrada.length > 20) throw new ApiError(400, 'extras inválidos');
    const extras = extrasEntrada.map((extra) => {
      const opcion = typeof extra?.opcion === 'string' ? extra.opcion.trim() : '';
      if (!Object.hasOwn(EXTRAS, opcion)) throw new ApiError(400, `Extra no disponible: ${opcion || 'vacío'}`);
      return { opcion, precio_adicional: EXTRAS[opcion] };
    });

    return { idProducto, cantidad, notas: notas || null, personalizacion, extras };
  });
}

// POST /api/pedidos (requiere token)
exports.crear = async (req, res) => {
  const { tipo_entrega: tipoEntrega, direccion_entrega, id_metodo } = req.body;

  // Validar la cabecera del pedido.
  if (!TIPOS_ENTREGA.includes(tipoEntrega)) {
    throw new ApiError(400, `tipo_entrega debe ser: ${TIPOS_ENTREGA.join(' o ')}`);
  }
  const direccion = typeof direccion_entrega === 'string' ? direccion_entrega.trim() : '';
  if (tipoEntrega === 'Delivery' && (!direccion || direccion.length > 255)) {
    throw new ApiError(400, 'La dirección de entrega es obligatoria para Delivery');
  }
  const idMetodo = Number(id_metodo);
  if (!Number.isInteger(idMetodo) || idMetodo <= 0) throw new ApiError(400, 'id_metodo inválido');

  const resultado = await pedidoModel.crear({
    idCliente: req.idCliente,
    tipoEntrega,
    direccion,
    idMetodo,
    items: normalizarItems(req.body.items),
  });
  res.status(201).json({ success: true, ...resultado });
};

// GET /api/pedidos (requiere token)
exports.historial = async (req, res) => {
  res.json(await pedidoModel.historial(req.idCliente));
};
