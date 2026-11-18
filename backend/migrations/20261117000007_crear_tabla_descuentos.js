// Migración idempotente: tabla Descuentos (no recrea la tabla si viene del .sql).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Descuentos')) return;

  await knex.schema.createTable('Descuentos', (t) => {
    t.specificType('id_descuento', 'INT AUTO_INCREMENT').primary();
    t.string('nombre_descuento', 50).notNullable();
    t.decimal('porcentaje', 5, 2).notNullable();
    t.string('descripcion', 255);
  });
};

// Vacío a propósito: un rollback no debe borrar datos que pueden venir del .sql.
exports.down = async function () {};
