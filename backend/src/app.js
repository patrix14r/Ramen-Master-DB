// Construye la aplicación Express (sin encenderla, para poder probarla).
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const routes = require('./routes');

const app = express();

// Cabeceras de seguridad; las imágenes deben poder cargarse desde el frontend (otro origen).
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigin })); // solo el frontend configurado puede llamar a la API
app.use(express.json()); // lee el body JSON en req.body

// Imágenes: la carpeta imagenes/ de la raíz se sirve en /imagenes/...
app.use('/imagenes', express.static(path.join(__dirname, '..', '..', 'imagenes')));

// Todas las rutas de la API cuelgan de /api.
app.use('/api', routes);

// 404 para cualquier ruta no registrada.
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador global de errores (se reconoce por sus 4 parámetros).
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido' });

  // Errores esperados (ApiError): se responden con su propio código.
  if (err.status && err.status < 500) return res.status(err.status).json({ error: err.message });

  // Error inesperado: se registra y no se filtra el detalle.
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
