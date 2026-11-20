// Sección "Promociones y Combos Nikkei": slider de combos con precio tachado y descuento.
import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import Carrusel from './Carrusel.jsx';
import { Insignia, Precio } from './ProductCard.jsx';
import Esqueleto from './Esqueleto.jsx';
import { Revelar, Tarjeta } from './Anim.jsx';
import { listarProductos } from '../lib/api';
import { dinero, imgUrl } from '../lib/config';

// Combos: en pantallas grandes se ven 2 a la vez con la siguiente asomando.
const VISTAS_COMBOS = {
  0: { slidesPerView: 1.12, spaceBetween: 14, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
  480: { slidesPerView: 1.4, spaceBetween: 16, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
  640: { slidesPerView: 2.05, spaceBetween: 18, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
  1024: { slidesPerView: 2.2, spaceBetween: 20, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
};

function TarjetaCombo({ c }) {
  return (
    <Tarjeta className="tarjeta group flex h-full flex-col overflow-hidden [transition-property:border-color,box-shadow]">
      <div className="relative aspect-[16/11] overflow-hidden">
        <img
          src={imgUrl(c.imagen)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <Insignia>-{c.descuento_pct}%</Insignia>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-bold leading-snug tracking-tight text-bone">{c.nombre}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm font-light leading-relaxed">{c.descripcion}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-light text-white/50">
          <Check size={13} strokeWidth={1.5} className="shrink-0" /> Ahorras {dinero(c.precio - c.precio_oferta)}
        </p>
        <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Precio producto={c} grande />
          <a href={`/producto/${c.id_producto}`} className="btn-ghost !py-3 sm:!px-4 sm:!py-2.5">
            Pedir combo <ArrowRight size={15} strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </Tarjeta>
  );
}

export default function Combos() {
  const [combos, setCombos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listarProductos()
      .then((lista) => setCombos(lista.filter((p) => p.en_oferta)))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="tarjeta p-6 text-sm">No se pudieron cargar las promociones.</p>;
  if (!combos) return <Esqueleto cantidad={2} alto="h-96" columnas="sm:grid-cols-2" />;

  return (
    <Revelar>
      <Carrusel items={combos} vistas={VISTAS_COMBOS} renderItem={(c) => <TarjetaCombo c={c} />} />
    </Revelar>
  );
}
