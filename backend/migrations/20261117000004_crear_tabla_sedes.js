// Migración idempotente: tabla Sedes (no recrea la tabla si viene del .sql).
/** @param {import('knex').Knex} knex */
exports.up = async function (knex) {
  if (await knex.schema.hasTable('Sedes')) return;

  await knex.schema.createTable('Sedes', (t) => {
    t.specificType('id_sede', 'INT AUTO_INCREMENT').primary(); // PK con signo, igual que el .sql
    t.string('nombre_sede', 50).notNullable();
    t.string('direccion', 150).notNullable();
    t.string('telefono_sede', 15);
  });
};

// Vacío a propósito: un rollback no debe borrar datos que pueden venir del .sql.
exports.down = async function () {};
