// Ruta pública del formulario de contacto.
const { Router } = require('express');
const controller = require('../controllers/contacto.controller');

const router = Router();

router.post('/', controller.enviar); // POST /api/contacto

module.exports = router;
