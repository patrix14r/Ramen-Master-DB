// npm run fresh: borra TODAS las tablas, migra desde cero y siembra (equivalente a migrate:fresh --seed de Laravel).
const db = require('../src/config/database');

async function fresh() {
  // Protección: nunca se ejecuta contra una base de producción.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('npm run fresh está bloqueado cuando NODE_ENV=production');
  }
  const base = db.client.config.connection.database;
  console.log(`Reconstruyendo la base "${base}"...`);

  // 1) Elimina todas las tablas (sin comprobar claves foráneas para no depender del orden).
  const [filas] = await db.raw(
    'SELECT TABLE_NAME AS tabla FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = ?',
    [base, 'BASE TABLE']
  );
  await db.raw('SET FOREIGN_KEY_CHECKS = 0');
  for (const { tabla } of filas) await db.schema.dropTableIfExists(tabla);
  await db.raw('SET FOREIGN_KEY_CHECKS = 1');
  console.log(`  - ${filas.length} tablas eliminadas`);

  // 2) Migraciones: construyen todo el esquema (no se necesita ningún .sql).
  const [, migradas] = await db.migrate.latest();
  console.log(`  - ${migradas.length} migraciones aplicadas`);

  // 3) Seeders: catálogos, categorías, productos y cliente de prueba.
  const [sembrados] = await db.seed.run();
  console.log(`  - ${sembrados.length} seeders ejecutados`);
  console.log('Listo: base de datos reconstruida.');
}

fresh()
  .catch((error) => {
    console.error('Falló npm run fresh:', error.message);
    process.exitCode = 1;
  })
  .finally(() => db.destroy());
