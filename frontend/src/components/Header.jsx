// Cabecera global con glassmorphism: logo, navegación, buscador, favoritos, carrito y perfil.
import { useEffect, useRef, useState } from 'react';
import { Heart, LogOut, Menu, Receipt, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import Buscador from './Buscador.jsx';
import MenuLateral from './MenuLateral.jsx';
import { imgUrl } from '../lib/config';
import { cerrarSesion, useAuth, useCart } from '../lib/store';
import { useFavoritos } from '../lib/favoritos';
import { AnimatePresence, motion, useReducedMotion } from './Anim.jsx';

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
  const [buscando, setBuscando] = useState(false); // barra de búsqueda neón desplegada
  const [menuPerfil, setMenuPerfil] = useState(false);
  const refPerfil = useRef(null);
  const reducir = useReducedMotion(); // respeta prefers-reduced-motion

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
      {/* Móvil: flex con extremos (izquierda [menú + logo], derecha [acciones]); desde md: rejilla de 3 columnas */}
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Botón de menú (solo móvil) */}
          <button
            type="button"
            onClick={() => setMenuMovil((v) => !v)}
            aria-label="Abrir menú"
            aria-expanded={menuMovil}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 md:hidden"
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>

          {/* Logo */}
          <a href="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src={imgUrl('imagenes/logo/logo.png')}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
            <span className="hidden text-base font-bold tracking-tight text-bone sm:block">Ramen Master</span>
          </a>
        </div>

        {/* Navegación (escritorio) */}
        <nav
          className={`hidden items-center gap-1 transition-all duration-300 md:flex ${
            buscando ? 'pointer-events-none scale-95 opacity-0' : 'opacity-100'
          }`}
          aria-label="Principal"
          aria-hidden={buscando}
        >
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

        {/* Acciones */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setBuscando((v) => !v)}
            aria-label={buscando ? 'Cerrar búsqueda' : 'Buscar platos'}
            aria-expanded={buscando}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
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
              className="flex h-10 min-w-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10 lg:px-3"
            >
              <UserRound size={18} strokeWidth={1.5} />
              <span className="hidden text-sm font-medium tracking-tight lg:block">
                {token && cliente ? cliente.nombre : 'Ingresar'}
              </span>
            </button>

            <AnimatePresence>
            {menuPerfil && token && (
              <motion.div
                initial={reducir ? false : { opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reducir ? undefined : { opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{ transformOrigin: 'top right' }}
                className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-white/10 bg-surface shadow-2xl shadow-black/60"
              >
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
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Búsqueda dentro del navbar: ocupa el centro (en móvil, toda la fila) */}
      {buscando && (
        <div className="animate-entrada absolute inset-x-0 top-0 flex h-16 items-center gap-2 bg-[#0B0B0E] px-4 sm:px-6 lg:inset-x-auto lg:left-1/2 lg:w-[30rem] lg:-translate-x-1/2 lg:bg-transparent lg:px-0">
          <Buscador autoFocus alCerrar={() => setBuscando(false)} className="w-full" />
          <button
            type="button"
            onClick={() => setBuscando(false)}
            aria-label="Cerrar búsqueda"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:bg-white/10"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}

      <MenuLateral
        abierto={menuMovil}
        cerrar={() => setMenuMovil(false)}
        ruta={ruta}
        favoritos={favoritos.length}
        carrito={totalCarrito}
        token={token}
        cliente={cliente}
        salir={salir}
      />
    </header>
  );
}
