// ============================================================
// store.js — Estado global compartido entre las islas de React
// ============================================================
// Cada isla (Header, carrito, perfil...) es una app React independiente,
// así que no pueden compartir estado con Context. Este mini-store vive en
// el módulo (una sola instancia) y se guarda en localStorage para
// sobrevivir al cambiar de página.

import { useSyncExternalStore } from 'react';

// Crea un store: guarda un valor, avisa a quien lo escucha y lo persiste.
// Con clave = null el valor vive solo en memoria (no se guarda en localStorage).
export function crearStore(clave, inicial) {
  let estado = inicial;
  const oyentes = new Set();
  const enNavegador = typeof window !== 'undefined';

  // Lee el valor guardado la primera vez (solo existe localStorage en el navegador).
  function leerGuardado() {
    if (!enNavegador || !clave) return;
    try {
      const guardado = localStorage.getItem(clave);
      if (guardado) estado = JSON.parse(guardado);
    } catch {
      /* localStorage bloqueado o JSON dañado: se usa el valor inicial */
    }
  }
  leerGuardado();

  const emitir = () => oyentes.forEach((fn) => fn());

  // Si otra pestaña modifica el valor, lo sincronizamos aquí.
  if (enNavegador && clave) {
    window.addEventListener('storage', (e) => {
      if (e.key === clave) {
        leerGuardado();
        emitir();
      }
    });
  }

  return {
    get: () => estado,
    getServer: () => inicial, // el servidor siempre renderiza el valor inicial
    subscribe(fn) {
      oyentes.add(fn);
      return () => oyentes.delete(fn);
    },
    set(nuevo) {
      estado = typeof nuevo === 'function' ? nuevo(estado) : nuevo;
      if (enNavegador && clave) {
        try {
          localStorage.setItem(clave, JSON.stringify(estado));
        } catch {
          /* sin espacio o bloqueado: seguimos solo en memoria */
        }
      }
      emitir();
    },
  };
}

// Hook genérico: re-renderiza el componente cuando cambia el store.
export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

// ---------- Sesión ----------
export const authStore = crearStore('rm_auth', { token: null, cliente: null });
export const useAuth = () => useStore(authStore);

export function iniciarSesion(token, cliente) {
  authStore.set({ token, cliente });
}
export function actualizarCliente(cliente) {
  authStore.set((a) => ({ ...a, cliente }));
}
export function cerrarSesion() {
  authStore.set({ token: null, cliente: null });
}

// ---------- Carrito ----------
// Cada item: { key, id_producto, nombre, imagen, precio, cantidad,
//              picante, extras: [{opcion, precio_adicional}], notas, personalizable }
const cartStore = crearStore('rm_cart', []);
export const useCart = () => useStore(cartStore);

// Precio de UNA unidad con sus extras.
export const precioUnidad = (item) =>
  item.precio + item.extras.reduce((s, e) => s + e.precio_adicional, 0);

// Subtotal de una línea (precio con extras x cantidad), redondeado a 2 decimales.
export const subtotalItem = (item) => Math.round(precioUnidad(item) * item.cantidad * 100) / 100;

// Dos líneas son "la misma" si tienen igual producto y personalización.
function claveItem(item) {
  const extras = item.extras.map((e) => e.opcion).sort().join('+');
  return [item.id_producto, item.picante || '', extras, (item.notas || '').trim()].join('|');
}

// Agrega al carrito; si ya existe esa misma configuración, suma cantidad.
export function agregarAlCarrito(nuevo) {
  const item = { ...nuevo, key: claveItem(nuevo) };
  cartStore.set((lista) => {
    const existente = lista.find((i) => i.key === item.key);
    if (existente) {
      return lista.map((i) =>
        i.key === item.key ? { ...i, cantidad: Math.min(50, i.cantidad + item.cantidad) } : i
      );
    }
    return [...lista, item];
  });
}

export function cambiarCantidad(key, delta) {
  cartStore.set((lista) =>
    lista.map((i) =>
      i.key === key ? { ...i, cantidad: Math.max(1, Math.min(50, i.cantidad + delta)) } : i
    )
  );
}

export function quitarDelCarrito(key) {
  cartStore.set((lista) => lista.filter((i) => i.key !== key));
}

// Edita picante/extras/notas de una línea. Si el resultado coincide con otra
// línea existente, se fusionan sumando cantidades.
export function editarItem(key, cambios) {
  cartStore.set((lista) => {
    const original = lista.find((i) => i.key === key);
    if (!original) return lista;
    const editado = { ...original, ...cambios };
    editado.key = claveItem(editado);
    const resto = lista.filter((i) => i.key !== key);
    const igual = resto.find((i) => i.key === editado.key);
    if (igual) {
      return resto.map((i) =>
        i.key === editado.key ? { ...i, cantidad: Math.min(50, i.cantidad + editado.cantidad) } : i
      );
    }
    return lista.map((i) => (i.key === key ? editado : i));
  });
}

export function vaciarCarrito() {
  cartStore.set([]);
}

// ---------- Direcciones guardadas ----------
// El backend no tiene tabla de direcciones, así que se guardan en este
// navegador, separadas por cliente: { "<id_cliente>": ["dirección", ...] }
export const direccionesStore = crearStore('rm_direcciones', {});

export function leerDirecciones(mapa, idCliente) {
  return (idCliente && mapa[idCliente]) || [];
}
export function guardarDireccion(idCliente, direccion) {
  const limpia = direccion.trim();
  if (!idCliente || !limpia) return;
  direccionesStore.set((m) => {
    const actuales = m[idCliente] || [];
    if (actuales.includes(limpia)) return m; // sin duplicados
    return { ...m, [idCliente]: [...actuales, limpia] };
  });
}
export function borrarDireccion(idCliente, direccion) {
  direccionesStore.set((m) => ({
    ...m,
    [idCliente]: (m[idCliente] || []).filter((d) => d !== direccion),
  }));
}
