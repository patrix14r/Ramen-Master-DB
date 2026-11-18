// Migración idempotente: tabla Modificaciones_Detalle (no recrea la tabla si viene del .sql).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Modificaciones_Detalle')) return;

  await knex.schema.createTable('Modificaciones_Detalle', (t) => {
    t.specificType('id_modificacion', 'INT AUTO_INCREMENT').primary();
    t.integer('id_detalle').notNullable().references('id_detalle').inTable('Detalle_Pedidos').onDelete('CASCADE');
    t.string('opcion_elegida', 100).notNullable();
    t.decimal('precio_adicional', 10, 2).defaultTo(0);
  });
};

// Vacío a propósito: un rollback no debe borrar datos que pueden venir del .sql.
exports.down = async function () {};
