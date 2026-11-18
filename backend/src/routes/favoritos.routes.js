// ============================================================
// favoritos.routes.js — Favoritos del cliente autenticado
// ============================================================
const { Router } = require('express');
const controller = require('../controllers/favoritos.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();

// Todas las rutas de este archivo exigen token.
router.use(requireAuth);

router.get('/', controller.listar); // GET    /api/favoritos
router.post('/', controller.agregar); // POST   /api/favoritos
router.delete('/:id_producto', controller.eliminar); // DELETE /api/favoritos/3

module.exports = router;
