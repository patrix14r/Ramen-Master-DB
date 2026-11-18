// Migración idempotente: tabla Deliveries (no recrea la tabla si viene del .sql).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Deliveries')) return;

  await knex.schema.createTable('Deliveries', (t) => {
    t.specificType('id_delivery', 'INT AUTO_INCREMENT').primary();
    t.integer('id_repartidor').nullable().references('id_repartidor').inTable('Repartidores');
    t.string('direccion_entrega', 255);
    t.string('estado_envio', 50);
  });
};

// Vacío a propósito: un rollback no debe borrar datos que pueden venir del .sql.
exports.down = async function () {};
