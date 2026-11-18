// Migración aditiva: personalización (JSON) y notas en Detalle_Pedidos.
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  // Solo añade lo que falta, así se puede repetir sin error.
  if (!(await knex.schema.hasColumn('Detalle_Pedidos', 'personalizacion'))) {
    await knex.schema.alterTable('Detalle_Pedidos', (t) => t.json('personalizacion').nullable());
  }
  if (!(await knex.schema.hasColumn('Detalle_Pedidos', 'notas'))) {
    await knex.schema.alterTable('Detalle_Pedidos', (t) => t.string('notas', 255).nullable());
  }
};

exports.down = function (knex) {
  return knex.schema.alterTable('Detalle_Pedidos', (t) => {
    t.dropColumn('personalizacion');
    t.dropColumn('notas');
  });
};
