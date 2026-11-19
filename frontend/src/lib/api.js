// ============================================================
// api.js — Cliente HTTP para el backend (Express, puerto 3000)
// ============================================================
import { API_URL } from './config';
import { authStore, cerrarSesion } from './store';

// Error con el código HTTP, para que la interfaz decida qué mostrar.
class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Función base: hace la petición, adjunta el token si hay sesión y
// convierte los errores del backend ({ error: "..." }) en excepciones.
async function pedir(ruta, { method = 'GET', body } = {}) {
  const { token } = authStore.get();
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}/api${ruta}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }

  const datos = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    // Token vencido o inválido: se cierra la sesión local (no aplica al login).
    if (respuesta.status === 401 && token && !ruta.startsWith('/auth/login')) cerrarSesion();
    throw new ApiError(respuesta.status, datos?.error || 'Error inesperado del servidor');
  }
  return datos;
}

// El catálogo se pide una sola vez por carga de página y se reutiliza
// (buscador, carrusel y catálogo comparten la misma lista).
let cacheProductos = null;
export function listarProductos() {
  if (!cacheProductos) {
    cacheProductos = pedir('/productos').catch((e) => {
      cacheProductos = null; // si falla, permitimos reintentar
      throw e;
    });
  }
  return cacheProductos;
}

export const api = {
  // Catálogo
  similares: (id) => pedir(`/productos/${id}/similares`),
  // Contacto
  enviarContacto: (datos) => pedir('/contacto', { method: 'POST', body: datos }),
  // Auth
  login: (email, password) => pedir('/auth/login', { method: 'POST', body: { email, password } }),
  registro: (datos) => pedir('/auth/registro', { method: 'POST', body: datos }),
  perfil: () => pedir('/auth/perfil'),
  actualizarPerfil: (datos) => pedir('/auth/perfil', { method: 'PUT', body: datos }),
  // Pedidos
  crearPedido: (datos) => pedir('/pedidos', { method: 'POST', body: datos }),
  historial: () => pedir('/pedidos'),
  // Favoritos
  favoritos: () => pedir('/favoritos'),
  agregarFavorito: (id) => pedir('/favoritos', { method: 'POST', body: { id_producto: id } }),
  quitarFavorito: (id) => pedir(`/favoritos/${id}`, { method: 'DELETE' }),
};
