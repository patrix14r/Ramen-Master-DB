// ============================================================
// auth.routes.js — Registro, login y perfil
// ============================================================
const { Router } = require('express');
const controller = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();

// Públicas: aún no hay token.
router.post('/registro', controller.registro); // POST /api/auth/registro
router.post('/login', controller.login); // POST /api/auth/login

// Privadas: requireAuth se ejecuta antes del controller.
router.get('/perfil', requireAuth, controller.obtenerPerfil); // GET /api/auth/perfil
router.put('/perfil', requireAuth, controller.actualizarPerfil); // PUT /api/auth/perfil

module.exports = router;
