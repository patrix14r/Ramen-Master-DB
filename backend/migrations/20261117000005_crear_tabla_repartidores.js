// Migración idempotente: tabla Repartidores (no recrea la tabla si viene del .sql).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Repartidores')) return;

  await knex.schema.createTable('Repartidores', (t) => {
    t.specificType('id_repartidor', 'INT AUTO_INCREMENT').primary();
    t.string('nombre', 50).notNullable();
    t.string('apellido', 50).notNullable();
    t.string('correo', 100).notNullable().unique();
    t.string('telefono', 15);
    t.integer('id_sede').notNullable().references('id_sede').inTable('Sedes'); // FK sin unsigned
  });
};

// Vacío a propósito: un rollback no debe borrar datos que pueden venir del .sql.
exports.down = async function () {};
