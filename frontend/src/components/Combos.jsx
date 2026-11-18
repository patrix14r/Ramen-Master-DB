// Sección "Promociones y Combos Nikkei": combos con precio tachado y descuento.
import { useEffect, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Insignia, Precio } from './ProductCard.jsx';
import Esqueleto from './Esqueleto.jsx';
import { listarProductos } from '../lib/api';
import { dinero, imgUrl } from '../lib/config';

export default function Combos() {
  const [combos, setCombos] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listarProductos()
      .then((lista) => setCombos(lista.filter((p) => p.en_oferta)))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="tarjeta p-6 text-sm">No se pudieron cargar las promociones.</p>;
  if (!combos) return <Esqueleto cantidad={4} alto="h-48" columnas="lg:grid-cols-2" />;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {combos.map((c) => (
        <article key={c.id_producto} className="tarjeta group flex overflow-hidden">
          <div className="relative w-2/5 shrink-0 overflow-hidden">
            <img
              src={imgUrl(c.imagen)}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute left-3 top-3">
              <Insignia>-{c.descuento_pct}%</Insignia>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
            <h3 className="text-lg font-bold leading-snug tracking-tight text-bone">{c.nombre}</h3>
            <p className="mt-1 line-clamp-2 text-sm font-light leading-relaxed">{c.descripcion}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-light text-white/50">
              <Check size={13} strokeWidth={1.5} className="shrink-0" /> Ahorras {dinero(c.precio - c.precio_oferta)}
            </p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
              <Precio producto={c} grande />
              <a href={`/producto/${c.id_producto}`} className="btn-ghost">
                Pedir combo <ArrowRight size={15} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
