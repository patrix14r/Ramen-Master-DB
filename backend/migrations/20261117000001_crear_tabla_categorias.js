// Migración idempotente: tabla Categorias (no recrea la tabla si viene del .sql).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Categorias')) return;

  await knex.schema.createTable('Categorias', (t) => {
    t.specificType('id_categoria', 'INT AUTO_INCREMENT').primary(); // PK con signo, igual que el .sql
    t.string('nombre_categoria', 50).notNullable();
  });
};

// Vacío a propósito: un rollback no debe borrar datos que pueden venir del .sql.
exports.down = async function () {};
