// Ruta de salud: comprueba que el servidor y la base de datos responden.
const { Router } = require('express');
const db = require('../config/database');

const router = Router();

// GET /api/health
router.get('/', async (req, res, next) => {
  try {
    await db.raw('SELECT 1'); // consulta mínima para probar la conexión
    res.json({ ok: true, database: 'conectada' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
