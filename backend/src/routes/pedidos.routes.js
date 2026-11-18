// ============================================================
// pedidos.routes.js — Pedidos del cliente autenticado
// ============================================================
const { Router } = require('express');
const controller = require('../controllers/pedidos.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();

// Todas las rutas de este archivo exigen token.
router.use(requireAuth);

router.post('/', controller.crear); // POST /api/pedidos
router.get('/', controller.historial); // GET  /api/pedidos

module.exports = router;
