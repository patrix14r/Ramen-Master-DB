// Carta completa: filtros por categoría, orden por precio/popularidad y búsqueda (?q=).
import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, X } from 'lucide-react';
import ProductCard from './ProductCard.jsx';
import Esqueleto from './Esqueleto.jsx';
import { listarProductos } from '../lib/api';
import { etiquetaCategoria, precioVigente } from '../lib/config';

// Quita tildes y mayúsculas para comparar textos.
const normalizar = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Criterios de orden disponibles.
const ORDENES = [
  { id: 'popularidad', texto: 'Más populares' },
  { id: 'precio-asc', texto: 'Precio: menor a mayor' },
  { id: 'precio-desc', texto: 'Precio: mayor a menor' },
];

// Puntaje de popularidad: más vendidos primero, luego recomendados.
const popularidad = (p) => (p.es_mas_vendido ? 2 : 0) + (p.es_recomendado ? 1 : 0);

export default function CatalogView() {
  const [productos, setProductos] = useState(null);
  const [error, setError] = useState(false);
  const [categoria, setCategoria] = useState(null); // id de categoría o null = todas
  const [orden, setOrden] = useState('popularidad');
  const [texto, setTexto] = useState('');

  // Al montar: lee filtros de la URL y pide el catálogo.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = Number(params.get('categoria'));
    if (cat) setCategoria(cat);
    setTexto(params.get('q') || '');
    listarProductos().then(setProductos).catch(() => setError(true));
  }, []);

  // Actualiza la URL sin recargar para que el filtro sea compartible.
  function sincronizarUrl(cat, q) {
    const params = new URLSearchParams();
    if (cat) params.set('categoria', cat);
    if (q) params.set('q', q);
    const query = params.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  }
  const elegirCategoria = (id) => {
    setCategoria(id);
    sincronizarUrl(id, texto);
  };
  const limpiarTexto = () => {
    setTexto('');
    sincronizarUrl(categoria, '');
  };

  // Categorías únicas derivadas de los productos.
  const categorias = useMemo(() => {
    const mapa = new Map();
    (productos || []).forEach((p) => mapa.set(p.id_categoria, p.categoria_nombre));
    return [...mapa.entries()].map(([id, nombre]) => ({ id, nombre: etiquetaCategoria(nombre) }));
  }, [productos]);

  // Aplica categoría, búsqueda y orden.
  const visibles = useMemo(() => {
    const q = normalizar(texto.trim());
    const lista = (productos || []).filter(
      (p) =>
        (!categoria || p.id_categoria === categoria) &&
        (!q || normalizar(`${p.nombre} ${p.descripcion} ${p.categoria_nombre}`).includes(q))
    );
    const comparar = {
      popularidad: (a, b) => popularidad(b) - popularidad(a) || a.id_producto - b.id_producto,
      'precio-asc': (a, b) => precioVigente(a) - precioVigente(b),
      'precio-desc': (a, b) => precioVigente(b) - precioVigente(a),
    }[orden];
    return [...lista].sort(comparar);
  }, [productos, categoria, texto, orden]);

  if (error) return <p className="tarjeta p-6 text-sm">No se pudo cargar la carta. Revisa que el servidor esté activo.</p>;
  if (!productos) return <Esqueleto cantidad={8} />;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Filtros: el badge activo es el único elemento carmesí */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Categorías">
          {[{ id: null, nombre: 'Todo' }, ...categorias].map((c) => {
            const activo = categoria === c.id;
            return (
              <button
                key={c.id ?? 'todo'}
                type="button"
                onClick={() => elegirCategoria(c.id)}
                aria-pressed={activo}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium tracking-tight transition ${
                  activo ? 'border-crimson bg-crimson text-white' : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                {c.nombre}
              </button>
            );
          })}
          {texto && (
            <button type="button" onClick={limpiarTexto} className="btn-ghost !rounded-full !py-1.5">
              Búsqueda: {texto} <X size={14} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* Orden */}
        <label className="flex items-center gap-2 text-sm font-light">
          <ArrowUpDown size={16} strokeWidth={1.5} className="text-white/50" />
          <span className="sr-only">Ordenar por</span>
          <select value={orden} onChange={(e) => setOrden(e.target.value)} className="campo !w-auto !py-2">
            {ORDENES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.texto}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm font-light text-white/50" aria-live="polite">
        {visibles.length} {visibles.length === 1 ? 'plato' : 'platos'}
      </p>

      {visibles.length === 0 ? (
        <p className="tarjeta mt-4 p-6 text-sm font-light">No hay platos que coincidan con tu búsqueda.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibles.map((p) => (
            <ProductCard key={p.id_producto} producto={p} variante="carta" />
          ))}
        </div>
      )}
    </div>
  );
}
