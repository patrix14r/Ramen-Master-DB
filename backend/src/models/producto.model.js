// Model de productos: todas las consultas Knex de la tabla Productos.
const db = require('../config/database');

// Columnas del listado (alias iguales a los que consume el frontend).
const COLUMNAS = [
  'p.id_producto',
  'p.nombre_producto as nombre',
  'p.descripcion',
  'p.precio',
  'p.precio_oferta',
  'p.es_mas_vendido',
  'p.es_recomendado',
  'p.id_categoria',
  'c.nombre_categoria as categoria_nombre',
  'p.imagen',
];

// Convierte los tinyint de MySQL en booleanos y calcula el precio vigente.
function formatear(p) {
  if (!p) return p;
  const enOferta = p.precio_oferta !== null && p.precio_oferta < p.precio;
  return {
    ...p,
    es_mas_vendido: Boolean(p.es_mas_vendido),
    es_recomendado: Boolean(p.es_recomendado),
    en_oferta: enOferta,
    precio_final: enOferta ? p.precio_oferta : p.precio,
    descuento_pct: enOferta ? Math.round((1 - p.precio_oferta / p.precio) * 100) : 0,
  };
}

// Consulta base: productos disponibles con el nombre de su categoría.
const base = () =>
  db('Productos as p')
    .join('Categorias as c', 'p.id_categoria', 'c.id_categoria')
    .where('p.disponible', 1);

// Lista productos con filtros opcionales (categoria por id o nombre, destacados, ofertas).
async function listar({ categoria, masVendidos, recomendados, ofertas } = {}) {
  const consulta = base().select(COLUMNAS).orderBy([{ column: 'p.id_categoria' }, { column: 'p.id_producto' }]);

  if (typeof categoria === 'string' && categoria.trim() !== '') {
    if (/^\d+$/.test(categoria)) consulta.where('p.id_categoria', Number(categoria));
    else consulta.where('c.nombre_categoria', categoria.trim());
  }
  if (masVendidos) consulta.where('p.es_mas_vendido', 1);
  if (recomendados) consulta.where('p.es_recomendado', 1);
  if (ofertas) consulta.whereNotNull('p.precio_oferta');

  return (await consulta).map(formatear);
}

// Detalle de un plato, con historia e ingredientes para su ficha.
async function obtener(id) {
  const producto = await base()
    .where('p.id_producto', id)
    .select([...COLUMNAS, 'p.historia', 'p.ingredientes'])
    .first();
  return formatear(producto);
}

// Platos similares: misma categoría, sin el propio plato.
async function similares(id, limite = 4) {
  const actual = await db('Productos').where({ id_producto: id }).first('id_categoria');
  if (!actual) return [];
  const filas = await base()
    .where('p.id_categoria', actual.id_categoria)
    .whereNot('p.id_producto', id)
    .select(COLUMNAS)
    .orderBy('p.es_mas_vendido', 'desc')
    .orderBy('p.id_producto')
    .limit(limite);
  return filas.map(formatear);
}

// Precio vigente (oferta o normal) de varios productos disponibles, dentro de una transacción.
async function preciosVigentes(trx, ids) {
  const filas = await trx('Productos')
    .whereIn('id_producto', ids)
    .where('disponible', 1)
    .select('id_producto', 'precio', 'precio_oferta');
  return new Map(filas.map((f) => [f.id_producto, f.precio_oferta !== null ? f.precio_oferta : f.precio]));
}

module.exports = { listar, obtener, similares, preciosVigentes };
