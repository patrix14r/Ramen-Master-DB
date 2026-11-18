// Rutas públicas del catálogo (sin login).
const { Router } = require('express');
const controller = require('../controllers/productos.controller');

const router = Router();

router.get('/', controller.listar); // GET /api/productos
router.get('/:id', controller.obtener); // GET /api/productos/5
router.get('/:id/similares', controller.similares); // GET /api/productos/5/similares

module.exports = router;
