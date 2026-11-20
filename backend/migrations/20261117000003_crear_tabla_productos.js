// Migración idempotente: tabla Productos (no recrea la tabla si ya existe).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Productos')) return;

  await knex.schema.createTable('Productos', (t) => {
    t.specificType('id_producto', 'INT AUTO_INCREMENT').primary();
    t.string('nombre_producto', 100).notNullable();
    t.text('descripcion');
    t.decimal('precio', 10, 2).notNullable(); // dinero siempre en decimal
    t.integer('id_categoria').notNullable().references('id_categoria').inTable('Categorias');
    t.string('imagen', 255);
    t.boolean('disponible').defaultTo(true);
  });
};

// Vacío a propósito: un rollback no borra datos (para reconstruir todo se usa npm run fresh).
exports.down = async function () {};
