// Controller de contacto: valida y guarda el mensaje del formulario.
const contactoModel = require('../models/contacto.model');
const ApiError = require('../utils/ApiError');
const { texto, REGEX_EMAIL } = require('../utils/helpers');


// POST /api/contacto  body: { nombre, email, mensaje }
exports.enviar = async (req, res) => {
  const nombre = texto(req.body.nombre);
  const correo = texto(req.body.email).toLowerCase();
  const mensaje = texto(req.body.mensaje);

  if (!nombre || !correo || !mensaje) throw new ApiError(400, 'Nombre, correo y mensaje son obligatorios');
  if (nombre.length > 100 || correo.length > 100) throw new ApiError(400, 'Algún campo supera la longitud permitida');
  if (!REGEX_EMAIL.test(correo)) throw new ApiError(400, 'Correo inválido');
  if (mensaje.length > 2000) throw new ApiError(400, 'El mensaje supera 2000 caracteres');

  await contactoModel.crear({ nombre, correo, mensaje });
  res.status(201).json({ success: true });
};
