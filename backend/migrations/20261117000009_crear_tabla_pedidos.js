// Migración idempotente: tabla Pedidos (no recrea la tabla si viene del .sql).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Pedidos')) return;

  await knex.schema.createTable('Pedidos', (t) => {
    t.specificType('id_pedido', 'INT AUTO_INCREMENT').primary();
    t.integer('id_cliente').notNullable().references('id_cliente').inTable('Clientes');
    t.integer('id_delivery').nullable().unique().references('id_delivery').inTable('Deliveries');
    t.string('estado_preparacion', 50);
    t.string('tipo_entrega', 50); // 'Delivery' o 'Retiro en tienda'
  });
};

// Vacío a propósito: un rollback no debe borrar datos que pueden venir del .sql.
exports.down = async function () {};
