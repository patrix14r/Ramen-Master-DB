// Cabecera global con glassmorphism: logo, navegación, buscador, favoritos, carrito y perfil.
import { useEffect, useRef, useState } from 'react';
import {
  Heart,
  LogOut,
  Menu,
  Receipt,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import Buscador from './Buscador.jsx';
import { imgUrl } from '../lib/config';
import { cerrarSesion, useAuth, useCart } from '../lib/store';
import { useFavoritos } from '../lib/favoritos';

// Enlaces de navegación principal.
const ENLACES = [
  { href: '/', texto: 'Inicio' },
  { href: '/productos', texto: 'Carta' },
  { href: '/contactanos', texto: 'Contáctanos' },
];

// Insignia numérica pequeña (fondo hueso, NO carmesí: el acento se reserva al CTA).
function Contador({ valor }) {
  if (!valor) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bone px-1 text-[10px] font-bold text-ink">
      {valor > 99 ? '99+' : valor}
    </span>
  );
}

// Botón-icono con enlace (favoritos, carrito).
function IconoEnlace({ href, etiqueta, activo, children }) {
  return (
    <a
      href={href}
      aria-label={etiqueta}
      title={etiqueta}
      className={`relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 transition hover:bg-white/10 ${
        activo ? 'bg-white/10 text-white' : 'bg-white/5 text-white/80'
      }`}
    >
      {children}
    </a>
  );
}

export default function Header({ ruta = '/' }) {
  const { token, cliente } = useAuth();
  const carrito = useCart();
  const { ids: favoritos } = useFavoritos();

  const [menuMovil, setMenuMovil] = useState(false);
  const [buscarMovil, setBuscarMovil] = useState(false);
  const [menuPerfil, setMenuPerfil] = useState(false);
  const refPerfil = useRef(null);

  // Unidades totales en el carrito (suma de cantidades).
  const totalCarrito = carrito.reduce((s, i) => s + i.cantidad, 0);

  // Cierra el menú de perfil al hacer clic fuera.
  useEffect(() => {
    const fuera = (e) => {
      if (refPerfil.current && !refPerfil.current.contains(e.target)) setMenuPerfil(false);
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, []);

  // Marca el enlace de la página actual.
  const esActivo = (href) => (href === '/' ? ruta === '/' : ruta.startsWith(href));

  function salir() {
    cerrarSesion();
    setMenuPerfil(false);
    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B0B0E]/80 backdrop-blur-md">
      <div className="contenedor flex h-16 items-center gap-3">
        {/* Botón de menú (solo móvil) */}
        <button
          type="button"
          onClick={() => setMenuMovil((v) => !v)}
          aria-label={menuMovil ? 'Cerrar menú' : 'Abrir menú'}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 md:hidden"
        >
          {menuMovil ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
        </button>

        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-2.5">
          <img
            src={imgUrl('imagenes/logo/logo.png')}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="hidden text-base font-bold tracking-tight text-bone sm:block">
            Ramen Master
          </span>
        </a>

        {/* Navegación (escritorio) */}
        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Principal">
          {ENLACES.map((e) => (
            <a
              key={e.href}
              href={e.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition hover:text-white ${
                esActivo(e.href) ? 'text-white' : 'text-white/60'
              }`}
            >
              {e.texto}
            </a>
          ))}
        </nav>

        {/* Buscador (escritorio) */}
        <Buscador className="mx-auto hidden w-full max-w-sm md:block" />

        {/* Acciones */}
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={() => setBuscarMovil((v) => !v)}
            aria-label="Buscar"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 md:hidden"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>

          <IconoEnlace href="/perfil#favoritos" etiqueta="Favoritos" activo={false}>
            <Heart size={18} strokeWidth={1.5} />
            <Contador valor={favoritos.length} />
          </IconoEnlace>

          <IconoEnlace href="/carrito" etiqueta="Carrito" activo={ruta.startsWith('/carrito')}>
            <ShoppingBag size={18} strokeWidth={1.5} />
            <Contador valor={totalCarrito} />
          </IconoEnlace>

          {/* Menú de perfil */}
          <div ref={refPerfil} className="relative">
            <button
              type="button"
              onClick={() => (token ? setMenuPerfil((v) => !v) : (window.location.href = '/login'))}
              aria-label={token ? 'Menú de cuenta' : 'Iniciar sesión'}
              aria-expanded={menuPerfil}
              className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 transition hover:bg-white/10"
            >
              <UserRound size={18} strokeWidth={1.5} />
              <span className="hidden text-sm font-medium tracking-tight lg:block">
                {token && cliente ? cliente.nombre : 'Ingresar'}
              </span>
            </button>

            {menuPerfil && token && (
              <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-white/10 bg-surface shadow-2xl shadow-black/60">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="truncate text-sm font-medium text-bone">
                    {cliente?.nombre} {cliente?.apellido}
                  </p>
                  <p className="truncate text-xs font-light text-white/50">{cliente?.email}</p>
                </div>
                <a href="/perfil" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5">
                  <UserRound size={16} strokeWidth={1.5} /> Mi perfil
                </a>
                <a
                  href="/perfil#pedidos"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5"
                >
                  <Receipt size={16} strokeWidth={1.5} /> Mis pedidos
                </a>
                <a
                  href="/perfil#favoritos"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5"
                >
                  <Heart size={16} strokeWidth={1.5} /> Favoritos
                </a>
                <button
                  type="button"
                  onClick={salir}
                  className="flex w-full items-center gap-3 border-t border-white/10 px-4 py-2.5 text-left text-sm hover:bg-white/5"
                >
                  <LogOut size={16} strokeWidth={1.5} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buscador desplegable (móvil) */}
      {buscarMovil && (
        <div className="contenedor pb-3 md:hidden">
          <Buscador autoFocus alCerrar={() => setBuscarMovil(false)} />
        </div>
      )}

      {/* Navegación desplegable (móvil) */}
      {menuMovil && (
        <nav className="contenedor flex flex-col gap-1 pb-3 md:hidden" aria-label="Móvil">
          {ENLACES.map((e) => (
            <a
              key={e.href}
              href={e.href}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                esActivo(e.href) ? 'bg-white/10 text-white' : 'text-white/70'
              }`}
            >
              {e.texto}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
