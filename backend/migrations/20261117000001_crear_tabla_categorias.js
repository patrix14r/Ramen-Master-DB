// Migración idempotente: tabla Categorias (no recrea la tabla si ya existe).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Categorias')) return;

  await knex.schema.createTable('Categorias', (t) => {
    t.specificType('id_categoria', 'INT AUTO_INCREMENT').primary(); // PK con signo
    t.string('nombre_categoria', 50).notNullable();
  });
};

// Vacío a propósito: un rollback no borra datos (para reconstruir todo se usa npm run fresh).
exports.down = async function () {};
