// Slider Swiper de "Los más consumidos" (platos con es_mas_vendido).
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, FreeMode } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/free-mode';
import TarjetaVisual from './TarjetaVisual.jsx';
import Esqueleto from './Esqueleto.jsx';
import { listarProductos } from '../lib/api';

export default function BestSellers() {
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState(false);
  const [swiper, setSwiper] = useState(null); // instancia para los botones propios

  useEffect(() => {
    listarProductos()
      .then((lista) => setProductos(lista.filter((p) => p.es_mas_vendido)))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="tarjeta p-6 text-sm">No se pudo cargar la carta. Revisa que el servidor esté activo.</p>;
  if (!productos) return <Esqueleto />;

  return (
    <div>
      {/* Controles del slider */}
      <div className="mb-4 flex justify-end gap-2">
        {[
          { Icono: ChevronLeft, etiqueta: 'Anterior', accion: () => swiper?.slidePrev() },
          { Icono: ChevronRight, etiqueta: 'Siguiente', accion: () => swiper?.slideNext() },
        ].map(({ Icono, etiqueta, accion }) => (
          <button
            key={etiqueta}
            type="button"
            onClick={accion}
            aria-label={etiqueta}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <Icono size={18} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      <Swiper
        modules={[A11y, FreeMode]}
        onSwiper={setSwiper}
        freeMode={{ enabled: true, sticky: true }}
        grabCursor
        spaceBetween={16}
        slidesPerView={1.15} // se asoma la siguiente tarjeta
        breakpoints={{ 560: { slidesPerView: 2.1 }, 900: { slidesPerView: 3.1 }, 1200: { slidesPerView: 4 } }}
      >
        {productos.map((p) => (
          <SwiperSlide key={p.id_producto} className="!h-auto">
            <TarjetaVisual producto={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
