// Migración: tabla Mensajes_Contacto (formulario de la página Contáctanos).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Mensajes_Contacto')) return;

  await knex.schema.createTable('Mensajes_Contacto', (t) => {
    t.specificType('id_mensaje', 'INT AUTO_INCREMENT').primary();
    t.string('nombre', 100).notNullable();
    t.string('correo', 100).notNullable();
    t.text('mensaje').notNullable();
    t.timestamp('fecha_creacion').notNullable().defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('Mensajes_Contacto');
};
