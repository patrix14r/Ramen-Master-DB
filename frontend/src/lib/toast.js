// Store de notificaciones flotantes (toast) compartido entre islas.
import { crearStore } from './store';

export const toastStore = crearStore(null, []); // solo en memoria
let contador = 0;

// Muestra un aviso; se elimina solo tras `duracion` ms.
export function notificar({ titulo, detalle, enlace, enlaceTexto }, duracion = 3000) {
  const id = ++contador;
  toastStore.set((lista) => [...lista.slice(-2), { id, titulo, detalle, enlace, enlaceTexto, saliendo: false }]);
  // Primero se marca "saliendo" para el fundido y luego se quita.
  setTimeout(() => toastStore.set((l) => l.map((t) => (t.id === id ? { ...t, saliendo: true } : t))), duracion);
  setTimeout(() => toastStore.set((l) => l.filter((t) => t.id !== id)), duracion + 350);
}
