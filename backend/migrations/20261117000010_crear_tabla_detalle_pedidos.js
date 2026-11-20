// Migración idempotente: tabla Detalle_Pedidos (no recrea la tabla si ya existe).
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

// Vacío a propósito: un rollback no borra datos (para reconstruir todo se usa npm run fresh).
exports.down = async function () {};
