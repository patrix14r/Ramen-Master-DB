// Model de favoritos: consultas de la tabla Favoritos.
const db = require('../config/database');

// Productos favoritos del cliente, el más reciente primero.
const listar = (idCliente) =>
  db('Favoritos as f')
    .join('Productos as p', 'p.id_producto', 'f.id_producto')
    .join('Categorias as c', 'c.id_categoria', 'p.id_categoria')
    .where('f.id_cliente', idCliente)
    .orderBy('f.id_favorito', 'desc')
    .select(
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
      'p.disponible',
      'f.fecha_creacion'
    );

// INSERT IGNORE: repetir el favorito no falla ni duplica.
const agregar = (idCliente, idProducto) =>
  db('Favoritos').insert({ id_cliente: idCliente, id_producto: idProducto }).onConflict().ignore();

// Devuelve cuántas filas se borraron (0 si no era favorito).
const eliminar = (idCliente, idProducto) =>
  db('Favoritos').where({ id_cliente: idCliente, id_producto: idProducto }).del();

module.exports = { listar, agregar, eliminar };
