// ============================================================
// auth.routes.js — Registro, login y perfil
// ============================================================
const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

// Límite de intentos por IP contra fuerza bruta en login y registro.
const limitarIntentos = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos, vuelve a probar en unos minutos' },
});

const router = Router();

// Públicas: aún no hay token.
router.post('/registro', limitarIntentos, controller.registro); // POST /api/auth/registro
router.post('/login', limitarIntentos, controller.login); // POST /api/auth/login

// Privadas: requireAuth se ejecuta antes del controller.
router.get('/perfil', requireAuth, controller.obtenerPerfil); // GET /api/auth/perfil
router.put('/perfil', requireAuth, controller.actualizarPerfil); // PUT /api/auth/perfil

module.exports = router;
