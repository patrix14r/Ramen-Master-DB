// ============================================================
// Buscador.jsx — Buscador en vivo del Header
// ============================================================
// Descarga el catálogo una vez (al enfocar) y filtra en el navegador
// mientras se escribe: sin esperas ni peticiones por cada tecla.
import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { listarProductos } from '../lib/api';
import { dinero, imgUrl } from '../lib/config';

// Quita tildes y mayúsculas: "Salmón" coincide con "salmon".
const normalizar = (s) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function Buscador({ className = '', autoFocus = false, alCerrar }) {
  const [texto, setTexto] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [productos, setProductos] = useState(null); // null = aún no cargado
  const [fallo, setFallo] = useState(false);
  const contenedor = useRef(null);

  // Carga el catálogo la primera vez que el usuario interactúa.
  function cargar() {
    if (productos) return;
    listarProductos().then(setProductos).catch(() => setFallo(true));
  }

  // Cierra el desplegable al hacer clic fuera.
  useEffect(() => {
    const fuera = (e) => {
      if (contenedor.current && !contenedor.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, []);

  const consulta = normalizar(texto.trim());
  const resultados =
    productos && consulta
      ? productos
          .filter((p) => normalizar(`${p.nombre} ${p.descripcion} ${p.categoria_nombre}`).includes(consulta))
          .slice(0, 6)
      : [];

  // Enter lleva al catálogo filtrado por el texto.
  function enviar(e) {
    e.preventDefault();
    if (texto.trim()) window.location.href = `/productos?q=${encodeURIComponent(texto.trim())}`;
  }

  return (
    <div ref={contenedor} className={`relative ${className}`}>
      <form onSubmit={enviar} role="search">
        <Search
          size={16}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50"
        />
        <input
          type="search"
          value={texto}
          autoFocus={autoFocus}
          onFocus={() => {
            cargar();
            setAbierto(true);
          }}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setAbierto(false);
              alCerrar?.();
            }
          }}
          placeholder="Buscar platos"
          aria-label="Buscar platos"
          className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-9 text-sm font-medium text-bone placeholder:font-light placeholder:text-white/40 focus:border-white/30 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
        />
        {texto && (
          <button
            type="button"
            onClick={() => setTexto('')}
            aria-label="Borrar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-white/50 hover:text-white"
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        )}
      </form>

      {/* Resultados en vivo */}
      {abierto && consulta && (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-white/10 bg-surface shadow-2xl shadow-black/60">
          {fallo && <p className="p-4 text-sm">No se pudo cargar la carta.</p>}
          {!fallo && !productos && <p className="p-4 text-sm font-light">Buscando...</p>}
          {productos && resultados.length === 0 && (
            <p className="p-4 text-sm font-light">Sin resultados para "{texto.trim()}".</p>
          )}
          {resultados.map((p) => (
            <a
              key={p.id_producto}
              href={`/producto/${p.id_producto}`}
              className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-white/5"
            >
              <img
                src={imgUrl(p.imagen)}
                alt=""
                className="h-11 w-11 shrink-0 rounded-lg object-cover"
                loading="lazy"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-bone">{p.nombre}</span>
                <span className="block text-xs font-light text-white/50">{p.categoria_nombre}</span>
              </span>
              <span className="text-sm font-medium text-bone">{dinero(p.precio)}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
