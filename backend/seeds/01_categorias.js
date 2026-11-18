// Seeder 01: categorías de la carta (las 4 del .sql más los combos en promoción).
/** @param {import('knex').Knex} knex */
exports.seed = async function (knex) {
  await knex('Categorias')
    .insert([
      { id_categoria: 1, nombre_categoria: 'Ramen' },
      { id_categoria: 2, nombre_categoria: 'Sushi' },
      { id_categoria: 3, nombre_categoria: 'Arroz Frito' },
      { id_categoria: 4, nombre_categoria: 'Omelets' },
      { id_categoria: 5, nombre_categoria: 'Combos' },
    ])
    .onConflict('id_categoria')
    .merge();
};
