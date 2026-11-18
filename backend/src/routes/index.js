// Punto central de rutas: cada recurso se registra aquí con una línea.
const { Router } = require('express');

const router = Router();

// Catálogo de rutas publicadas en GET /api (mantenerlo al día al añadir endpoints).
const RUTAS = [
  { metodo: 'GET', ruta: '/api', descripcion: 'Estado de la API y lista de rutas', auth: false },
  { metodo: 'GET', ruta: '/api/health', descripcion: 'Salud del servidor y la base de datos', auth: false },
  { metodo: 'GET', ruta: '/api/productos', descripcion: 'Catálogo (filtros: categoria, mas_vendidos, recomendados, ofertas)', auth: false },
  { metodo: 'GET', ruta: '/api/productos/:id', descripcion: 'Detalle de un plato', auth: false },
  { metodo: 'GET', ruta: '/api/productos/:id/similares', descripcion: 'Platos similares de la misma categoría', auth: false },
  { metodo: 'POST', ruta: '/api/auth/registro', descripcion: 'Crear cuenta de cliente', auth: false },
  { metodo: 'POST', ruta: '/api/auth/login', descripcion: 'Iniciar sesión (devuelve JWT)', auth: false },
  { metodo: 'GET', ruta: '/api/auth/perfil', descripcion: 'Datos del cliente autenticado', auth: true },
  { metodo: 'PUT', ruta: '/api/auth/perfil', descripcion: 'Actualizar datos o contraseña', auth: true },
  { metodo: 'POST', ruta: '/api/pedidos', descripcion: 'Crear un pedido', auth: true },
  { metodo: 'GET', ruta: '/api/pedidos', descripcion: 'Historial de pedidos del cliente', auth: true },
  { metodo: 'GET', ruta: '/api/favoritos', descripcion: 'Favoritos del cliente', auth: true },
  { metodo: 'POST', ruta: '/api/favoritos', descripcion: 'Agregar un favorito', auth: true },
  { metodo: 'DELETE', ruta: '/api/favoritos/:id_producto', descripcion: 'Quitar un favorito', auth: true },
  { metodo: 'POST', ruta: '/api/contacto', descripcion: 'Enviar un mensaje desde Contáctanos', auth: false },
  { metodo: 'GET', ruta: '/imagenes/*', descripcion: 'Archivos estáticos de la carpeta imagenes/', auth: false },
];

// GET /api: JSON de estado para que /api nunca responda "Ruta no encontrada".
router.get('/', (req, res) => {
  res.json({
    nombre: 'Ramen Master API',
    estado: 'operativo',
    version: require('../../package.json').version,
    fecha: new Date().toISOString(),
    rutas: RUTAS,
  });
});

router.use('/health', require('./health.routes'));
router.use('/productos', require('./productos.routes'));
router.use('/auth', require('./auth.routes'));
router.use('/pedidos', require('./pedidos.routes'));
router.use('/favoritos', require('./favoritos.routes'));
router.use('/contacto', require('./contacto.routes'));

module.exports = router;
