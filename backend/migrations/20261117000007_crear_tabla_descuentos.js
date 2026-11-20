// Migración idempotente: tabla Descuentos (no recrea la tabla si ya existe).
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

// Vacío a propósito: un rollback no borra datos (para reconstruir todo se usa npm run fresh).
exports.down = async function () {};
