// ============================================================
// env.js — Carga las variables de entorno UNA sola vez
// ============================================================
// Las "variables de entorno" son valores de configuración (puerto,
// contraseña de la BD...) que NO se escriben dentro del código.
// Así no subes contraseñas a Git y puedes cambiar de configuración
// (tu PC, servidor de producción) sin tocar el código.

// path: utilidad de Node para construir rutas de archivos sin errores.
const path = require('path');

// dotenv lee el archivo ".env" y copia cada línea a process.env.
// Indicamos la ruta exacta (backend/.env) para que funcione aunque
// ejecutes el comando desde otra carpeta.
// __dirname = carpeta de ESTE archivo (backend/src/config)
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Sin clave JWT no se pueden firmar sesiones de forma segura:
// preferimos que el servidor NO arranque a que arranque inseguro.
if (!process.env.JWT_SECRET) {
  throw new Error('Falta JWT_SECRET en backend/.env (ver .env.example)');
}

// Exportamos un objeto ordenado. El resto del proyecto importa ESTE
// archivo en vez de leer process.env por todas partes.
module.exports = {
  port: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4321', // origen permitido del frontend // Number(): process.env siempre es texto
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD, // sin valor por defecto: debe venir del .env
    database: process.env.DB_NAME || 'ramen_master_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    // Duración del token. 30d replica la sesión de 30 días que tenía PHP.
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  },
};
