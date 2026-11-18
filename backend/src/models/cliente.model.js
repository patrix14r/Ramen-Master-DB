// Model de clientes: consultas de la tabla Clientes.
const db = require('../config/database');

const porCorreo = (correo) => db('Clientes').where({ correo }).first();
const porId = (id) => db('Clientes').where({ id_cliente: id }).first();

// Inserta un cliente y devuelve su id nuevo.
async function crear(datos) {
  const [id] = await db('Clientes').insert(datos);
  return id;
}

const actualizar = (id, cambios) => db('Clientes').where({ id_cliente: id }).update(cambios);

// Primera compra = el cliente aún no tiene pedidos.
async function esPrimeraCompra(id) {
  const [{ total }] = await db('Pedidos').where({ id_cliente: id }).count({ total: '*' });
  return Number(total) === 0;
}

module.exports = { porCorreo, porId, crear, actualizar, esPrimeraCompra };
