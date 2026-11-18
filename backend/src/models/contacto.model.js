// Model de contacto: guarda los mensajes del formulario.
const db = require('../config/database');

// Inserta el mensaje y devuelve su id.
async function crear({ nombre, correo, mensaje }) {
  const [id] = await db('Mensajes_Contacto').insert({ nombre, correo, mensaje });
  return id;
}

module.exports = { crear };
