// Controller de autenticación: registro, login y perfil del cliente (JWT sin sesiones).
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clienteModel = require('../models/cliente.model');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const { texto, REGEX_EMAIL } = require('../utils/helpers');

const REGEX_TELEFONO = /^\d{9}$/; // Clientes.telefono es VARCHAR(9)
const MIN_PASSWORD = 8;

// Crea el token firmado con el id del cliente dentro.
const firmarToken = (idCliente) =>
  jwt.sign({ id_cliente: idCliente }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

// Forma pública del cliente: nunca incluye password_hash.
async function formatearCliente(c) {
  return {
    id: c.id_cliente,
    nombre: c.nombre,
    apellido: c.apellido,
    email: c.correo,
    telefono: c.telefono,
    primera_compra: await clienteModel.esPrimeraCompra(c.id_cliente),
  };
}

// POST /api/auth/registro
exports.registro = async (req, res) => {
  const nombre = texto(req.body.nombre);
  const apellido = texto(req.body.apellido);
  const email = texto(req.body.email).toLowerCase();
  const telefono = texto(req.body.telefono);
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  // Validar datos de entrada.
  if (!nombre || !apellido || !email || !password) {
    throw new ApiError(400, 'Nombre, apellido, email y contraseña son obligatorios');
  }
  if (nombre.length > 50 || apellido.length > 50 || email.length > 100) {
    throw new ApiError(400, 'Algún campo supera la longitud permitida');
  }
  if (!REGEX_EMAIL.test(email)) throw new ApiError(400, 'Correo inválido');
  if (telefono && !REGEX_TELEFONO.test(telefono)) throw new ApiError(400, 'El teléfono debe tener 9 dígitos');
  if (password.length < MIN_PASSWORD) {
    throw new ApiError(400, `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`);
  }

  // Correo único.
  if (await clienteModel.porCorreo(email)) throw new ApiError(409, 'Ya existe una cuenta con ese correo');

  // Guardar con la contraseña convertida en hash bcrypt.
  let idNuevo;
  try {
    idNuevo = await clienteModel.crear({
      nombre,
      apellido,
      correo: email,
      telefono: telefono || null,
      password_hash: await bcrypt.hash(password, 10),
    });
  } catch (error) {
    // La restricción UNIQUE cubre dos registros simultáneos.
    if (error.code === 'ER_DUP_ENTRY') throw new ApiError(409, 'Ya existe una cuenta con ese correo');
    throw error;
  }

  // Auto-login: devolvemos el token junto al cliente.
  const cliente = await clienteModel.porId(idNuevo);
  res.status(201).json({ success: true, token: firmarToken(idNuevo), cliente: await formatearCliente(cliente) });
};

// POST /api/auth/login
exports.login = async (req, res) => {
  const email = texto(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!email || !password) throw new ApiError(400, 'Email y contraseña son obligatorios');

  // Mismo mensaje si falla el correo o la clave: no revela qué correos existen.
  const cliente = await clienteModel.porCorreo(email);
  const valido = cliente && (await bcrypt.compare(password, cliente.password_hash));
  if (!valido) throw new ApiError(401, 'Correo o contraseña incorrectos');

  res.json({ success: true, token: firmarToken(cliente.id_cliente), cliente: await formatearCliente(cliente) });
};

// GET /api/auth/perfil (requiere token)
exports.obtenerPerfil = async (req, res) => {
  const cliente = await clienteModel.porId(req.idCliente);
  if (!cliente) throw new ApiError(404, 'Cliente no encontrado');
  res.json({ success: true, cliente: await formatearCliente(cliente) });
};

// PUT /api/auth/perfil (requiere token): nombre, apellido, telefono y cambio de contraseña.
exports.actualizarPerfil = async (req, res) => {
  const cliente = await clienteModel.porId(req.idCliente);
  if (!cliente) throw new ApiError(404, 'Cliente no encontrado');

  // Solo se actualiza lo que el cliente envió.
  const cambios = {};

  if (req.body.nombre !== undefined) {
    const nombre = texto(req.body.nombre);
    if (!nombre || nombre.length > 50) throw new ApiError(400, 'Nombre inválido');
    cambios.nombre = nombre;
  }
  if (req.body.apellido !== undefined) {
    const apellido = texto(req.body.apellido);
    if (!apellido || apellido.length > 50) throw new ApiError(400, 'Apellido inválido');
    cambios.apellido = apellido;
  }
  if (req.body.telefono !== undefined) {
    const telefono = texto(req.body.telefono);
    if (telefono && !REGEX_TELEFONO.test(telefono)) throw new ApiError(400, 'El teléfono debe tener 9 dígitos');
    cambios.telefono = telefono || null; // vacío = borrar teléfono
  }

  // Cambiar la clave exige la actual: un token robado no basta.
  if (req.body.password_nueva !== undefined) {
    const actual = typeof req.body.password_actual === 'string' ? req.body.password_actual : '';
    const nueva = typeof req.body.password_nueva === 'string' ? req.body.password_nueva : '';
    if (!(await bcrypt.compare(actual, cliente.password_hash))) {
      throw new ApiError(401, 'La contraseña actual es incorrecta');
    }
    if (nueva.length < MIN_PASSWORD) {
      throw new ApiError(400, `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`);
    }
    cambios.password_hash = await bcrypt.hash(nueva, 10);
  }

  if (Object.keys(cambios).length === 0) throw new ApiError(400, 'No se envió ningún dato para actualizar');

  await clienteModel.actualizar(req.idCliente, cambios);
  res.json({ success: true, cliente: await formatearCliente(await clienteModel.porId(req.idCliente)) });
};
