// ============================================================
// database.js — Conexión a MySQL que usará TU APLICACIÓN
// ============================================================
// Reemplaza a api/conexion.php. Se crea UNA sola instancia y todo el
// proyecto la reutiliza: require('./config/database')

// Importamos la librería Knex (query builder: escribe SQL con JavaScript).
const knex = require('knex');

// Reutilizamos la MISMA configuración del knexfile, así la app y las
// migraciones nunca apuntan a bases de datos distintas por error.
const knexfile = require('../../knexfile');

// knex(config) crea un "pool" de conexiones: en vez de abrir y cerrar
// una conexión por cada petición (como hacía PHP con new mysqli), mantiene
// varias abiertas y las presta. Es mucho más rápido.
const db = knex({
  ...knexfile, // copia client, connection y migrations
  pool: {
    min: 0, // mínimo de conexiones abiertas cuando no hay tráfico
    max: 10, // máximo de conexiones simultáneas
  },
});

// Exportamos 'db' para usarlo así en cualquier archivo:
//   const productos = await db('Productos').where({ disponible: 1 });
// Esto ejecuta: SELECT * FROM Productos WHERE disponible = 1
module.exports = db;
