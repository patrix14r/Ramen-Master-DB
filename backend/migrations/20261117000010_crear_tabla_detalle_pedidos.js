// Migración idempotente: tabla Detalle_Pedidos (no recrea la tabla si viene del .sql).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Detalle_Pedidos')) return;

  await knex.schema.createTable('Detalle_Pedidos', (t) => {
    t.specificType('id_detalle', 'INT AUTO_INCREMENT').primary();
    t.integer('id_pedido').notNullable().references('id_pedido').inTable('Pedidos').onDelete('CASCADE');
    t.integer('id_producto').notNullable().references('id_producto').inTable('Productos');
    t.integer('cantidad').notNullable();
    t.decimal('precio_unitario', 10, 2).notNullable();
    t.decimal('subtotal', 10, 2).notNullable();
  });
};

// Vacío a propósito: un rollback no debe borrar datos que pueden venir del .sql.
exports.down = async function () {};
