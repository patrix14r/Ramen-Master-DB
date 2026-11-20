// Migración idempotente: tabla Checkout_Ordenes (no recrea la tabla si ya existe).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Checkout_Ordenes')) return;

  await knex.schema.createTable('Checkout_Ordenes', (t) => {
    t.specificType('id_checkout', 'INT AUTO_INCREMENT').primary();
    t.integer('id_pedido').notNullable().unique().references('id_pedido').inTable('Pedidos').onDelete('CASCADE');
    t.integer('id_metodo').notNullable().references('id_metodo').inTable('Metodos_Pago');
    t.integer('id_descuento').nullable().references('id_descuento').inTable('Descuentos');
    t.decimal('monto_descuento', 10, 2).defaultTo(0);
    t.decimal('total_final', 10, 2).notNullable();
    t.string('estado_pago', 20).defaultTo('Pagado');
  });
};

// Vacío a propósito: un rollback no borra datos (para reconstruir todo se usa npm run fresh).
exports.down = async function () {};
