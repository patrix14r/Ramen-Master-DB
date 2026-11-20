// Tarjeta de plato reutilizable (carruseles, carta, favoritos, similares).
import { Flame, Heart } from 'lucide-react';
import { dinero, etiquetaCategoria, imgUrl } from '../lib/config';
import { useFavoritos } from '../lib/favoritos';
import { Tarjeta } from './Anim.jsx';

// Insignia discreta sobre la imagen (fondo oscuro translúcido, nunca carmesí).
export function Insignia({ children }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#0B0B0E]/70 px-2.5 py-1 text-[11px] font-medium tracking-tight text-bone backdrop-blur-md">
      {children}
    </span>
  );
}

// Precio del plato: tachado + oferta cuando hay promoción.
export function Precio({ producto, grande = false }) {
  const tam = grande ? 'text-2xl' : 'text-base';
  if (!producto.en_oferta) {
    return <span className={`${tam} whitespace-nowrap font-bold tracking-tight text-bone`}>{dinero(producto.precio)}</span>;
  }
  return (
    <span className="flex items-baseline gap-2 whitespace-nowrap">
      <span className={`${tam} font-bold tracking-tight text-bone`}>{dinero(producto.precio_oferta)}</span>
      <span className="text-sm font-light text-white/40 line-through">{dinero(producto.precio)}</span>
    </span>
  );
}

export default function ProductCard({ producto, variante = 'normal' }) {
  const enCarta = variante === 'carta'; // cristal y menos texto
  const grande = variante === 'grande'; // slider: imagen más alta
  const { esFavorito, alternar } = useFavoritos();
  const activo = esFavorito(producto.id_producto);

  // Sin sesión: lleva al login y vuelve a esta página después.
  async function clicFavorito() {
    const hecho = await alternar(producto.id_producto);
    if (!hecho) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }
  }

  return (
    <Tarjeta
      className={`${enCarta ? 'vidrio' : 'tarjeta'} group flex h-full flex-col overflow-hidden [transition-property:border-color,box-shadow] hover:border-white/20`}
    >
      <div className={`relative overflow-hidden ${grande ? 'aspect-[4/4.2]' : 'aspect-[4/3]'}`}>
        <a href={`/producto/${producto.id_producto}`} tabIndex={-1} aria-hidden="true">
          <img
            src={imgUrl(producto.imagen)}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </a>

        {/* Insignias: más vendido y porcentaje de descuento */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {producto.es_mas_vendido && (
            <Insignia>
              <Flame size={12} strokeWidth={1.5} /> Más vendido
            </Insignia>
          )}
          {producto.en_oferta && <Insignia>-{producto.descuento_pct}%</Insignia>}
        </div>

        <button
          type="button"
          onClick={clicFavorito}
          aria-pressed={activo}
          aria-label={activo ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0B0B0E]/60 backdrop-blur-md transition hover:bg-[#0B0B0E]/80"
        >
          {/* Favorito activo: corazón rojo con resplandor neón */}
          <Heart size={17} strokeWidth={1.5} className={activo ? 'corazon-neon' : 'text-white'} />
        </button>
      </div>

      <div className={`flex flex-1 flex-col ${grande ? 'p-5' : 'p-4'}`}>
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">
          {etiquetaCategoria(producto.categoria_nombre)}
        </p>
        <h3 className={`mt-1 font-bold leading-snug tracking-tight text-bone ${grande ? 'text-xl' : 'text-lg'}`}>
          <a href={`/producto/${producto.id_producto}`} className="hover:underline">
            {producto.nombre}
          </a>
        </h3>
        {!enCarta && <p className="mt-1.5 line-clamp-2 text-sm font-light leading-relaxed">{producto.descripcion}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <Precio producto={producto} />
          <a href={`/producto/${producto.id_producto}`} className="btn-ghost">
            Ver plato
          </a>
        </div>
      </div>
    </Tarjeta>
  );
}
