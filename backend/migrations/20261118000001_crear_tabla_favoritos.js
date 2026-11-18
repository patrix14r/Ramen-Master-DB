// Migración: tabla Favoritos (relación muchos a muchos Clientes - Productos).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Favoritos')) return;

  await knex.schema.createTable('Favoritos', (t) => {
    t.specificType('id_favorito', 'INT AUTO_INCREMENT').primary();
    // Claves foráneas sin unsigned y con CASCADE: no quedan favoritos huérfanos.
    t.integer('id_cliente').notNullable().references('id_cliente').inTable('Clientes').onDelete('CASCADE');
    t.integer('id_producto').notNullable().references('id_producto').inTable('Productos').onDelete('CASCADE');
    t.timestamp('fecha_creacion').notNullable().defaultTo(knex.fn.now());
    t.unique(['id_cliente', 'id_producto']); // un producto no se repite por cliente
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('Favoritos');
};
