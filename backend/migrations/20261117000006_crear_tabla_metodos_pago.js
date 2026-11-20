// Migración idempotente: tabla Metodos_Pago (no recrea la tabla si ya existe).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Metodos_Pago')) return;

  await knex.schema.createTable('Metodos_Pago', (t) => {
    t.specificType('id_metodo', 'INT AUTO_INCREMENT').primary();
    t.string('nombre_metodo', 30).notNullable();
  });
};

// Vacío a propósito: un rollback no borra datos (para reconstruir todo se usa npm run fresh).
exports.down = async function () {};
