// Tarjeta visual: foto grande y alta con nombre y precio sobre degradado (para "Los más consumidos").
import { ArrowUpRight, Flame, Heart } from 'lucide-react';
import { dinero, etiquetaCategoria, precioVigente, imgUrl } from '../lib/config';
import { useFavoritos } from '../lib/favoritos';
import { Tarjeta } from './Anim.jsx';

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
    <Tarjeta className="group relative aspect-[7/10] overflow-hidden rounded-3xl border border-white/10 bg-surface sm:aspect-[3/4.2]">
      <img
        src={imgUrl(producto.imagen)}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition group-hover:from-black/95" />

      <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-bone backdrop-blur-md">
        <Flame size={12} strokeWidth={1.5} /> Más vendido
      </span>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/60">
          {etiquetaCategoria(producto.categoria_nombre)}
        </p>
        <h3 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight text-bone">{producto.nombre}</h3>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-bold text-bone">{dinero(precioVigente(producto))}</p>
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition group-hover:bg-white/20">
            <ArrowUpRight size={18} strokeWidth={1.5} className="text-bone" />
          </span>
        </div>
      </div>

      {/* Enlace que cubre toda la tarjeta; el corazón queda por encima */}
      <a href={`/producto/${producto.id_producto}`} aria-label={`Ver ${producto.nombre}`} className="absolute inset-0" />
      <button
        type="button"
        onClick={clicFavorito}
        aria-pressed={activo}
        aria-label={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        className="absolute right-3.5 top-3.5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-md transition hover:bg-black/70"
      >
        <Heart size={18} strokeWidth={1.5} className={activo ? 'corazon-neon' : 'text-white'} />
      </button>
    </Tarjeta>
  );
}
