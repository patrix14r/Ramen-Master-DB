// Contenido del Hero (isla): texto, botones, datos clave y fotos, con entrada escalonada.
import { ArrowRight, Bike, Clock, Store } from 'lucide-react';
import { Escalonado, Item } from './Anim.jsx';
import { COSTO_ENVIO, dinero, imgUrl } from '../lib/config';

// Datos clave bajo los botones.
const DATOS = [
  { Icono: Bike, texto: `Delivery ${dinero(COSTO_ENVIO)}` },
  { Icono: Store, texto: 'Retiro en tienda' },
  { Icono: Clock, texto: 'Lun-Dom 12pm - 11pm' },
];

// Fotos del hero (panel de cristal en escritorio, tira en móvil).
const FOTOS = [
  { src: 'imagenes/hero/hero-sushi.jpeg', alt: 'Plato de sushi' },
  { src: 'imagenes/hero/hero-arroz.jpeg', alt: 'Plato de arroz frito' },
  { src: 'imagenes/hero/hero-omelet.jpeg', alt: 'Omelet japonés' },
];

export default function HeroContenido() {
  return (
    <div className="contenedor grid items-center gap-8 py-12 lg:grid-cols-12 lg:py-20">
      <Escalonado inmediato className="lg:col-span-7">
        <Item>
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-white/70">
            <span className="h-px w-8 bg-white/40" aria-hidden="true" />
            Cocina nikkei en Lima
          </p>
        </Item>
        <Item>
          <h1 className="mt-4 text-[2.9rem] font-extrabold leading-[1.02] tracking-tight text-bone sm:text-6xl lg:text-7xl">
            Sabores que <span className="text-crimson">Fusionan</span>
          </h1>
        </Item>
        <Item>
          <p className="mt-5 max-w-md text-base font-medium leading-relaxed text-white/80 sm:text-lg">
            Descubre la perfecta armonía entre la tradición japonesa y los sabores peruanos en cada plato.
          </p>
        </Item>
        <Item>
          {/* Botones a todo el ancho en móvil (alto táctil de 48px) */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="/productos" className="btn-cta !py-3.5 sm:!px-7">
              Pedir ahora <ArrowRight size={16} strokeWidth={1.5} />
            </a>
            <a href="/productos" className="btn-outline-rojo !py-3.5 sm:!px-7">
              Delivery
            </a>
          </div>
        </Item>
        <Item>
          <ul className="mt-7 flex flex-wrap gap-2">
            {DATOS.map(({ Icono, texto }) => (
              <li
                key={texto}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md"
              >
                <Icono size={14} strokeWidth={1.5} /> {texto}
              </li>
            ))}
          </ul>
        </Item>
      </Escalonado>

      {/* Móvil y tablet: tira de 3 fotos */}
      <Escalonado inmediato paso={0.12} className="grid grid-cols-3 gap-2.5 lg:hidden">
        {FOTOS.map((f) => (
          <Item key={f.src} y={30}>
            <img
              src={imgUrl(f.src)}
              alt={f.alt}
              className="aspect-[3/4] w-full rounded-2xl border border-white/10 object-cover"
              loading="eager"
            />
          </Item>
        ))}
      </Escalonado>

      {/* Escritorio: columna de platos en un panel de cristal */}
      <div className="hidden lg:col-span-5 lg:flex lg:justify-end">
        <Escalonado inmediato paso={0.12} className="vidrio flex w-60 flex-col gap-2 p-2">
          {FOTOS.map((f) => (
            <Item key={f.src} y={30}>
              <img src={imgUrl(f.src)} alt={f.alt} className="h-32 w-full rounded-xl object-cover" loading="eager" />
            </Item>
          ))}
        </Escalonado>
      </div>
    </div>
  );
}
