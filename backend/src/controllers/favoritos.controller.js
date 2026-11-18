// Controller de favoritos del cliente autenticado (req.idCliente lo pone requireAuth).
const productoModel = require('../models/producto.model');
const favoritoModel = require('../models/favorito.model');
const ApiError = require('../utils/ApiError');

// Valida que el id sea un entero positivo.
function leerIdProducto(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new ApiError(400, 'Id de producto inválido');
  return id;
}

// GET /api/favoritos
exports.listar = async (req, res) => {
  const filas = await favoritoModel.listar(req.idCliente);
  res.json(filas.map((f) => ({ ...f, es_mas_vendido: Boolean(f.es_mas_vendido), es_recomendado: Boolean(f.es_recomendado) })));
};

// POST /api/favoritos  body: { id_producto }
exports.agregar = async (req, res) => {
  const idProducto = leerIdProducto(req.body.id_producto);
  if (!(await productoModel.obtener(idProducto))) throw new ApiError(404, 'Producto no encontrado');
  await favoritoModel.agregar(req.idCliente, idProducto);
  res.status(201).json({ success: true, id_producto: idProducto });
};

// DELETE /api/favoritos/:id_producto
exports.eliminar = async (req, res) => {
  const borrados = await favoritoModel.eliminar(req.idCliente, leerIdProducto(req.params.id_producto));
  if (borrados === 0) throw new ApiError(404, 'El producto no estaba en favoritos');
  res.json({ success: true });
};
