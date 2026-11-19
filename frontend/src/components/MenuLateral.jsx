// Cajón lateral (drawer) de cristal para móvil: navegación, favoritos, carrito y cuenta.
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Home, LogIn, LogOut, Mail, ShoppingBag, UserRound, UtensilsCrossed, X } from 'lucide-react';
import { imgUrl } from '../lib/config';

export default function MenuLateral({ abierto, cerrar, ruta, favoritos, carrito, token, cliente, salir }) {
  // Escape cierra el cajón y se bloquea el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!abierto) return;
    const tecla = (e) => e.key === 'Escape' && cerrar();
    document.addEventListener('keydown', tecla);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', tecla);
      document.body.style.overflow = '';
    };
  }, [abierto, cerrar]);

  if (!abierto) return null;

  // Enlaces del cajón; "cuenta" cambia según haya sesión.
  const enlaces = [
    { href: '/', texto: 'Inicio', Icono: Home },
    { href: '/productos', texto: 'Carta', Icono: UtensilsCrossed },
    { href: '/contactanos', texto: 'Contáctanos', Icono: Mail },
    { href: '/perfil#favoritos', texto: 'Favoritos', Icono: Heart, cuenta: favoritos },
    { href: '/carrito', texto: 'Carrito', Icono: ShoppingBag, cuenta: carrito },
    token
      ? { href: '/perfil', texto: cliente?.nombre ? `Perfil (${cliente.nombre})` : 'Perfil', Icono: UserRound }
      : { href: '/login', texto: 'Ingresar', Icono: LogIn },
  ];
  const activo = (href) => (href === '/' ? ruta === '/' : href.length > 1 && ruta.startsWith(href.split('#')[0]));

  // Portal al body: el backdrop-filter del header rompería el position: fixed.
  return createPortal(
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menú">
      {/* Fondo oscuro que cierra al tocar */}
      <button type="button" aria-label="Cerrar menú" onClick={cerrar} className="animate-entrada absolute inset-0 bg-black/60" />

      <aside
        className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-white/15 bg-black/70 shadow-2xl shadow-black backdrop-blur-xl"
        style={{ animation: 'entrada-lateral 0.3s ease-out' }}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <span className="flex items-center gap-2.5 text-base font-bold tracking-tight text-bone">
            <img src={imgUrl('imagenes/logo/logo.png')} alt="" className="h-8 w-8 rounded-full object-cover" />
            Ramen Master
          </span>
          <button type="button" onClick={cerrar} aria-label="Cerrar menú" className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Móvil">
          {enlaces.map(({ href, texto, Icono, cuenta }) => (
            <a
              key={texto}
              href={href}
              onClick={cerrar}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                activo(href) ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/5'
              }`}
            >
              <Icono size={18} strokeWidth={1.5} />
              <span className="flex-1">{texto}</span>
              {cuenta > 0 && <span className="rounded-full bg-crimson px-2 py-0.5 text-[11px] font-bold text-white">{cuenta}</span>}
            </a>
          ))}
        </nav>

        {token && (
          <button type="button" onClick={salir} className="m-3 flex items-center gap-3 rounded-xl border border-white/10 px-3 py-3 text-sm text-white/75 hover:bg-white/5">
            <LogOut size={18} strokeWidth={1.5} /> Cerrar sesión
          </button>
        )}
      </aside>
    </div>,
    document.body
  );
}