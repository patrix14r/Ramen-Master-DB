// ============================================================
// auth.middleware.js — Protege rutas: exige un token válido
// ============================================================
// Un "middleware" es una función que se ejecuta ANTES del controller.
// Si el token es válido deja pasar (next()); si no, corta con 401.
// Reemplaza al `if (!isset($_SESSION['id_cliente']))` de PHP.

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

function requireAuth(req, res, next) {
  // El frontend envía:  Authorization: Bearer <token>
  const cabecera = req.headers.authorization || '';
  const [tipo, token] = cabecera.split(' ');

  if (tipo !== 'Bearer' || !token) {
    throw new ApiError(401, 'No autenticado');
  }

  try {
    // jwt.verify comprueba la firma y la caducidad del token.
    const payload = jwt.verify(token, env.jwt.secret);
    // Dejamos el id del cliente disponible para el controller.
    req.idCliente = payload.id_cliente;
    next();
  } catch {
    throw new ApiError(401, 'Sesión inválida o expirada');
  }
}

module.exports = { requireAuth };
