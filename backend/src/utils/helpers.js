// Helpers compartidos por controllers y models.

// Texto limpio: devuelve '' si el valor no es string.
const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

// Redondea a 2 decimales para evitar errores de coma flotante.
const redondear = (n) => Math.round(n * 100) / 100;

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = { texto, redondear, REGEX_EMAIL };
