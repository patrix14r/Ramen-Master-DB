// Constantes compartidas del frontend.

// URL base del backend (en desarrollo: http://localhost:3000).
export const API_URL = (import.meta.env.PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '');

// Convierte la ruta guardada en la BD ("imagenes/ramen/x.jpg") en URL servida por el backend.
export function imgUrl(ruta) {
  if (!ruta) return '';
  return `${API_URL}/${String(ruta).replace(/^\//, '')}`;
}

// Formatea dinero en soles: 32 -> "S/ 32.00".
export function dinero(valor) {
  return `S/ ${Number(valor || 0).toFixed(2)}`;
}

// Precio vigente de un plato: la oferta si existe, si no el precio normal.
export const precioVigente = (p) => p.precio_final ?? p.precio;

// Costo fijo de delivery (igual que en el backend).
export const COSTO_ENVIO = 5.0;

// Porcentaje del descuento de bienvenida (solo estimación visual: el servidor calcula el real).
export const DESCUENTO_BIENVENIDA = 15;

// Métodos de pago: los ids coinciden con la tabla Metodos_Pago.
export const METODOS_PAGO = [
  { id: 1, nombre: 'Tarjeta', detalle: 'Crédito o débito', icono: 'CreditCard' },
  { id: 2, nombre: 'Yape / Plin', detalle: 'Pago desde el celular', icono: 'Smartphone' },
  { id: 3, nombre: 'Efectivo', detalle: 'Pagas al recibir', icono: 'Banknote' },
];

// Etiqueta visible de cada categoría de la BD.
export const ETIQUETA_CATEGORIA = {
  Ramen: 'Ramen',
  Sushi: 'Sushi / Makis',
  'Arroz Frito': 'Wok & Arroz',
  Omelets: 'Omelets',
  Combos: 'Combos',
};
export const etiquetaCategoria = (nombre) => ETIQUETA_CATEGORIA[nombre] || nombre;

// Niveles de picante de un plato.
export const NIVELES_PICANTE = ['Sin picante', 'Rocoto Nikkei suave', 'Picante extremo'];

// Extras con costo (el backend los guarda en Modificaciones_Detalle).
export const EXTRAS = [
  { opcion: 'Chashu extra', precio_adicional: 8 },
  { opcion: 'Huevo Ajitsuke', precio_adicional: 3 },
  { opcion: 'Palta', precio_adicional: 4 },
  { opcion: 'Nori extra', precio_adicional: 2 },
];
