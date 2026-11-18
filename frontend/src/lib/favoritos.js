// ============================================================
// favoritos.js — Estado de favoritos sincronizado con el backend
// ============================================================
// Guardamos solo los ids (lista ligera) para pintar el corazón y el
// contador. La lista completa de platos se pide aparte en el perfil.

import { useEffect } from 'react';
import { api } from './api';
import { authStore, useAuth, useStore, crearStore } from './store';

// Store en memoria (no se persiste: la fuente de verdad es el servidor).
export const favStore = crearStore(null, { ids: [], cargado: false });

let cargando = false;

// Descarga los favoritos del cliente logueado (una sola vez por sesión).
async function cargarFavoritos() {
  if (cargando || favStore.get().cargado || !authStore.get().token) return;
  cargando = true;
  try {
    const lista = await api.favoritos();
    favStore.set({ ids: lista.map((f) => f.id_producto), cargado: true });
  } catch {
    /* sin conexión: el contador queda en 0 */
  } finally {
    cargando = false;
  }
}

// Hook: devuelve { ids, esFavorito, alternar } y carga la lista al montarse.
export function useFavoritos() {
  const { token } = useAuth();
  const { ids } = useStore(favStore);

  useEffect(() => {
    if (token) cargarFavoritos();
    else if (favStore.get().cargado) favStore.set({ ids: [], cargado: false }); // al cerrar sesión se limpia
  }, [token]);

  // Agrega o quita un favorito. Devuelve false si no hay sesión
  // (el componente decide cómo pedir que inicie sesión).
  async function alternar(idProducto) {
    if (!authStore.get().token) return false;
    const era = favStore.get().ids.includes(idProducto);
    // Actualización optimista: la interfaz cambia al instante...
    favStore.set((f) => ({
      ...f,
      ids: era ? f.ids.filter((i) => i !== idProducto) : [...f.ids, idProducto],
    }));
    try {
      if (era) await api.quitarFavorito(idProducto);
      else await api.agregarFavorito(idProducto);
    } catch {
      // ...y se revierte si el servidor falla.
      favStore.set((f) => ({
        ...f,
        ids: era ? [...f.ids, idProducto] : f.ids.filter((i) => i !== idProducto),
      }));
    }
    return true;
  }

  return { ids, esFavorito: (id) => ids.includes(id), alternar };
}
