// Migración aditiva: destacados, precio de oferta, historia e ingredientes en Productos.
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  const columnas = {
    es_mas_vendido: (t) => t.boolean('es_mas_vendido').notNullable().defaultTo(false),
    es_recomendado: (t) => t.boolean('es_recomendado').notNullable().defaultTo(false),
    precio_oferta: (t) => t.decimal('precio_oferta', 10, 2).nullable(), // NULL = sin promoción
    historia: (t) => t.text('historia').nullable(), // relato del plato para su ficha
    ingredientes: (t) => t.json('ingredientes').nullable(), // lista JSON de ingredientes
  };
  // Cada columna se crea solo si no existe todavía.
  for (const [nombre, definir] of Object.entries(columnas)) {
    if (!(await knex.schema.hasColumn('Productos', nombre))) {
      await knex.schema.alterTable('Productos', definir);
    }
  }
};

exports.down = function (knex) {
  return knex.schema.alterTable('Productos', (t) => {
    t.dropColumn('es_mas_vendido');
    t.dropColumn('es_recomendado');
    t.dropColumn('precio_oferta');
    t.dropColumn('historia');
    t.dropColumn('ingredientes');
  });
};
