// Controller de productos: valida la petición y delega las consultas al model.
const productoModel = require('../models/producto.model');
const ApiError = require('../utils/ApiError');

// Valida que el id de la URL sea un entero positivo.
function leerId(valor) {
  if (!/^\d+$/.test(valor)) throw new ApiError(400, 'Id de producto inválido');
  return Number(valor);
}

// GET /api/productos?categoria=&mas_vendidos=1&recomendados=1&ofertas=1
exports.listar = async (req, res) => {
  const { categoria, mas_vendidos, recomendados, ofertas } = req.query;
  res.json(
    await productoModel.listar({
      categoria,
      masVendidos: mas_vendidos === '1',
      recomendados: recomendados === '1',
      ofertas: ofertas === '1',
    })
  );
};

// GET /api/productos/:id
exports.obtener = async (req, res) => {
  const producto = await productoModel.obtener(leerId(req.params.id));
  if (!producto) throw new ApiError(404, 'Producto no encontrado');
  res.json(producto);
};

// GET /api/productos/:id/similares
exports.similares = async (req, res) => {
  res.json(await productoModel.similares(leerId(req.params.id)));
};
