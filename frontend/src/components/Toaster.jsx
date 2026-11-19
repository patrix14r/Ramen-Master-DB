// Contenedor de toasts: cristal oscuro con acento rojo, esquina inferior derecha.
import { Check } from 'lucide-react';
import { useStore } from '../lib/store';
import { toastStore } from '../lib/toast';

export default function Toaster() {
  const toasts = useStore(toastStore);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex items-center gap-3 rounded-xl border border-white/10 border-l-crimson border-l-4 bg-black/70 p-3.5 shadow-2xl shadow-black/60 backdrop-blur-md transition-all duration-300 ${
            t.saliendo ? 'translate-y-2 opacity-0' : 'animate-entrada opacity-100'
          }`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-crimson/20 text-crimson">
            <Check size={16} strokeWidth={1.5} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-bone">{t.titulo}</p>
            {t.detalle && <p className="truncate text-xs font-light">{t.detalle}</p>}
          </div>
          {t.enlace && (
            <a href={t.enlace} className="shrink-0 text-xs font-medium text-bone underline underline-offset-4 hover:text-white">
              {t.enlaceTexto}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
