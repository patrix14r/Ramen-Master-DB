// Tarjeta visual: foto grande con nombre y precio sobre degradado (para "Los más consumidos").
import { Flame, Heart } from 'lucide-react';
import { dinero, precioVigente, imgUrl } from '../lib/config';
import { useFavoritos } from '../lib/favoritos';

export default function TarjetaVisual({ producto }) {
  const { esFavorito, alternar } = useFavoritos();
  const activo = esFavorito(producto.id_producto);

  // Sin sesión lleva al login y vuelve a la página actual.
  async function clicFavorito() {
    if (!(await alternar(producto.id_producto))) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  return (
    <article className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-surface">
      <img
        src={imgUrl(producto.imagen)}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent transition group-hover:from-black/90" />

      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-bone backdrop-blur-md">
        <Flame size={12} strokeWidth={1.5} /> Más vendido
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-lg font-bold leading-snug tracking-tight text-bone">{producto.nombre}</h3>
        <p className="mt-0.5 text-sm font-medium text-white/80">{dinero(precioVigente(producto))}</p>
      </div>

      {/* Enlace que cubre toda la tarjeta; el corazón queda por encima */}
      <a href={`/producto/${producto.id_producto}`} aria-label={`Ver ${producto.nombre}`} className="absolute inset-0" />
      <button
        type="button"
        onClick={clicFavorito}
        aria-pressed={activo}
        aria-label={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-md transition hover:bg-black/70"
      >
        <Heart size={17} strokeWidth={1.5} className={activo ? 'corazon-neon' : 'text-white'} />
      </button>
    </article>
  );
}
