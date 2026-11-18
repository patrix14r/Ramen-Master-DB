// Configuración que lee la herramienta de línea de comandos de Knex.
const env = require('./src/config/env');

module.exports = {
  client: 'mysql2', // driver oficial de MySQL para Node
  connection: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
    charset: 'utf8mb4',
    decimalNumbers: true, // DECIMAL llega como número, no como texto
  },
  // Migraciones: se ejecutan en orden alfabético del nombre de archivo.
  migrations: { directory: './migrations', tableName: 'knex_migrations' },
  // Seeders: se ejecutan en orden alfabético (00, 01, 02, 03).
  seeds: { directory: './seeds' },
};
