// Seeder 00: datos de referencia (sedes, repartidores, métodos de pago, descuentos).
/** @param {import('knex').Knex} knex */
exports.seed = async function (knex) {
  // Upsert con id fijo: se puede ejecutar varias veces sin duplicar ni borrar nada.
  const upsert = (tabla, clave, filas) => knex(tabla).insert(filas).onConflict(clave).merge();

  await upsert('Sedes', 'id_sede', [
    { id_sede: 1, nombre_sede: 'Sede Santa Anita', direccion: 'Av. Cascanueces 2221, Santa Anita', telefono_sede: '+51 942 888 275' },
    { id_sede: 2, nombre_sede: 'Sede Miraflores', direccion: 'Av. Larco 123, Miraflores', telefono_sede: '+51 999 888 777' },
  ]);

  await upsert('Repartidores', 'id_repartidor', [
    { id_repartidor: 1, nombre: 'Frank', apellido: 'Chambergo', correo: 'fchambergo@ramenmaster.com', telefono: '987333444', id_sede: 1 },
    { id_repartidor: 2, nombre: 'Jair', apellido: 'Nolasco', correo: 'jnolasco@ramenmaster.com', telefono: '987111222', id_sede: 1 },
  ]);

  // Los ids de pago coinciden con METODOS_PAGO del frontend.
  await upsert('Metodos_Pago', 'id_metodo', [
    { id_metodo: 1, nombre_metodo: 'Tarjeta Credito/Debito' },
    { id_metodo: 2, nombre_metodo: 'Yape/Plin' },
    { id_metodo: 3, nombre_metodo: 'Efectivo' },
  ]);

  await upsert('Descuentos', 'id_descuento', [
    { id_descuento: 1, nombre_descuento: 'BIENVENIDA_RAMEN', porcentaje: 15, descripcion: '15% de descuento automático en tu primera compra' },
    { id_descuento: 2, nombre_descuento: 'PROMO_ESTUDIANTE', porcentaje: 10, descripcion: '10% de descuento con carné universitario' },
    { id_descuento: 3, nombre_descuento: 'FIDELIDAD_RAMEN', porcentaje: 20, descripcion: '20% de descuento para clientes frecuentes' },
  ]);
};
