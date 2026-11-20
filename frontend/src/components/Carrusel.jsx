// Slider Swiper reutilizable: tarjetas grandes, peek de la siguiente en móvil y botones propios.
import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, FreeMode } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/free-mode';

// Cuántas tarjetas se ven por ancho de pantalla (el decimal deja asomar la siguiente).
const VISTAS = {
  0: { slidesPerView: 1.22, spaceBetween: 14, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
  480: { slidesPerView: 1.6, spaceBetween: 16, slidesOffsetBefore: 24, slidesOffsetAfter: 24 },
  640: { slidesPerView: 2.15, spaceBetween: 18, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
  1024: { slidesPerView: 3.1, spaceBetween: 20, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
  1280: { slidesPerView: 4, spaceBetween: 20, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
};

export default function Carrusel({ items, renderItem, vistas = VISTAS }) {
  const [swiper, setSwiper] = useState(null); // instancia para los botones
  const [inicio, setInicio] = useState(true);
  const [fin, setFin] = useState(false);

  // Habilita o apaga cada botón según la posición del slider.
  const sincronizar = (s) => {
    setInicio(s.isBeginning);
    setFin(s.isEnd);
  };

  const botones = [
    { Icono: ChevronLeft, etiqueta: 'Anterior', accion: () => swiper?.slidePrev(), apagado: inicio },
    { Icono: ChevronRight, etiqueta: 'Siguiente', accion: () => swiper?.slideNext(), apagado: fin },
  ];

  return (
    <div>
      {/* Controles (solo desde sm: en móvil se desliza con el dedo) */}
      <div className="mb-4 hidden justify-end gap-2 sm:flex">
        {botones.map(({ Icono, etiqueta, accion, apagado }) => (
          <button
            key={etiqueta}
            type="button"
            onClick={accion}
            disabled={apagado}
            aria-label={etiqueta}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10 disabled:opacity-30"
          >
            <Icono size={18} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      {/* En móvil el slider sangra hasta los bordes de la pantalla (-mx-6) para que la siguiente tarjeta se asome */}
      <div className="-mx-6 sm:mx-0">
        <Swiper
          modules={[A11y, FreeMode]}
          onSwiper={(s) => {
            setSwiper(s);
            sincronizar(s);
          }}
          onSlideChange={sincronizar}
          onReachBeginning={sincronizar}
          onReachEnd={sincronizar}
          onBreakpoint={sincronizar}
          freeMode={{ enabled: true, sticky: true }}
          grabCursor
          breakpoints={vistas}
        >
          {items.map((item, i) => (
            <SwiperSlide key={item.id_producto ?? i} className="!h-auto">
              {renderItem(item, i)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
