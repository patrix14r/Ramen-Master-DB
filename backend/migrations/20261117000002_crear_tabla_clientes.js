// Migración idempotente: tabla Clientes (no recrea la tabla si ya existe).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Clientes')) return;

  await knex.schema.createTable('Clientes', (t) => {
    t.specificType('id_cliente', 'INT AUTO_INCREMENT').primary();
    t.string('nombre', 50).notNullable();
    t.string('apellido', 50).notNullable();
    t.string('correo', 100).notNullable().unique();
    t.string('password_hash', 255).notNullable(); // solo el hash bcrypt, nunca la clave
    t.string('telefono', 9);
  });
};

// Vacío a propósito: un rollback no borra datos (para reconstruir todo se usa npm run fresh).
exports.down = async function () {};
