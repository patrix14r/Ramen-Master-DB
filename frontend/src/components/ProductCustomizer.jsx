// Detalle y personalización de un plato con precio recalculado en tiempo real.
import { useState } from 'react';
import { Check, Heart, Minus, Plus, ShoppingBag } from 'lucide-react';
import { EXTRAS, NIVELES_PICANTE, dinero, etiquetaCategoria, imgUrl, precioVigente } from '../lib/config';
import { Insignia, Precio } from './ProductCard.jsx';
import { agregarAlCarrito } from '../lib/store';
import { useFavoritos } from '../lib/favoritos';
import { notificar } from '../lib/toast';

const MAX_NOTAS = 255; // mismo límite que la columna Detalle_Pedidos.notas

export default function ProductCustomizer({ producto }) {
  // Estado de la personalización.
  const [picante, setPicante] = useState(NIVELES_PICANTE[0]);
  const [extras, setExtras] = useState([]); // nombres de los extras elegidos
  const [notas, setNotas] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  const { esFavorito, alternar } = useFavoritos();
  const favorito = esFavorito(producto.id_producto);

  // Extras elegidos con su precio, y subtotal en vivo.
  const extrasElegidos = EXTRAS.filter((e) => extras.includes(e.opcion));
  const precioUnidad = precioVigente(producto) + extrasElegidos.reduce((s, e) => s + e.precio_adicional, 0);
  const subtotal = Math.round(precioUnidad * cantidad * 100) / 100;

  function alternarExtra(opcion) {
    setAgregado(false);
    setExtras((actual) =>
      actual.includes(opcion) ? actual.filter((o) => o !== opcion) : [...actual, opcion],
    );
  }

  function agregar() {
    agregarAlCarrito({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      imagen: producto.imagen,
      precio: precioVigente(producto),
      cantidad,
      personalizable: true,
      picante,
      extras: extrasElegidos,
      notas: notas.trim(),
    });
    setAgregado(true);
    notificar({ titulo: producto.nombre, detalle: cantidad > 1 ? `${cantidad} unidades agregadas` : 'Agregado al carrito', enlace: '/carrito', enlaceTexto: 'Ver carrito' });
  }

  async function clicFavorito() {
    const hecho = await alternar(producto.id_producto);
    if (!hecho) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* ===== Imagen ===== */}
      <div className="lg:col-span-5">
        <div className="tarjeta overflow-hidden p-2 lg:sticky lg:top-24">
          <img
            src={imgUrl(producto.imagen)}
            alt={producto.nombre}
            className="aspect-square w-full rounded-xl object-cover"
          />
        </div>
      </div>

      {/* ===== Datos y personalización ===== */}
      <div className="lg:col-span-7">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">
            {etiquetaCategoria(producto.categoria_nombre)}
          </p>
          {producto.en_oferta && <Insignia>-{producto.descuento_pct}%</Insignia>}
        </div>
        <div className="mt-1 flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-bone md:text-4xl">{producto.nombre}</h1>
          <button
            type="button"
            onClick={clicFavorito}
            aria-pressed={favorito}
            aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            className="btn-ghost !h-10 !w-10 shrink-0 !p-0"
          >
            <Heart size={18} strokeWidth={1.5} className={favorito ? 'corazon-neon' : ''} />
          </button>
        </div>
        <p className="mt-3 max-w-xl text-base font-light leading-relaxed">{producto.descripcion}</p>
        <div className="mt-4">
          <Precio producto={producto} grande />
        </div>

        <div className="mt-6 space-y-6">
          {/* --- Nivel de picante --- */}
          <fieldset>
            <legend className="etiqueta">Nivel de picante</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {NIVELES_PICANTE.map((nivel) => {
                const activo = picante === nivel;
                return (
                  <button
                    key={nivel}
                    type="button"
                    onClick={() => {
                      setPicante(nivel);
                      setAgregado(false);
                    }}
                    aria-pressed={activo}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium tracking-tight transition ${
                      activo
                        ? 'border-white/40 bg-white/10 text-white'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {nivel}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* --- Extras con costo --- */}
          <fieldset>
            <legend className="etiqueta">Extras</legend>
            <div className="space-y-2">
              {EXTRAS.map((extra) => {
                const activo = extras.includes(extra.opcion);
                return (
                  <label
                    key={extra.opcion}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                      activo ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {/* Casilla propia (el input real queda oculto pero accesible) */}
                      <input
                        type="checkbox"
                        checked={activo}
                        onChange={() => alternarExtra(extra.opcion)}
                        className="peer sr-only"
                      />
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-md border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white/60 ${
                          activo ? 'border-bone bg-bone text-ink' : 'border-white/30'
                        }`}
                      >
                        {activo && <Check size={14} strokeWidth={2} />}
                      </span>
                      <span className="text-sm font-medium text-bone">{extra.opcion}</span>
                    </span>
                    <span className="text-sm font-medium">+ {dinero(extra.precio_adicional)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* --- Notas de cocina --- */}
          <div>
            <label htmlFor="notas" className="etiqueta">
              Notas de cocina
            </label>
            <textarea
              id="notas"
              rows={3}
              maxLength={MAX_NOTAS}
              value={notas}
              onChange={(e) => {
                setNotas(e.target.value);
                setAgregado(false);
              }}
              placeholder="Ej.: sin cebollita china, caldo bien caliente"
              className="campo resize-none"
            />
            <p className="mt-1 text-right text-xs font-light text-white/40">
              {notas.length}/{MAX_NOTAS}
            </p>
          </div>
        </div>

        {/* ===== Barra de compra: cantidad, subtotal y CTA ===== */}
        <div className="tarjeta mt-6 flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              disabled={cantidad <= 1}
              aria-label="Disminuir cantidad"
              className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10 disabled:opacity-40"
            >
              <Minus size={16} strokeWidth={1.5} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-bone" aria-live="polite">
              {cantidad}
            </span>
            <button
              type="button"
              onClick={() => setCantidad((c) => Math.min(50, c + 1))}
              disabled={cantidad >= 50}
              aria-label="Aumentar cantidad"
              className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-white/10 disabled:opacity-40"
            >
              <Plus size={16} strokeWidth={1.5} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-white/40">Subtotal</p>
            <p className="text-xl font-bold tracking-tight text-bone" aria-live="polite">
              {dinero(subtotal)}
            </p>
          </div>

          {/* CTA principal (carmesí) */}
          <button type="button" onClick={agregar} className="btn-cta w-full sm:w-auto">
            <ShoppingBag size={16} strokeWidth={1.5} /> Agregar al carrito
          </button>
        </div>

        {/* Confirmación tras agregar */}
        {agregado && (
          <p
            role="status"
            className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium text-bone"
          >
            <span className="flex items-center gap-2">
              <Check size={16} strokeWidth={1.5} /> Agregado al carrito.
            </span>
            <a href="/carrito" className="underline underline-offset-4 hover:text-white">
              Ver carrito
            </a>
            <a href="/productos" className="font-light underline underline-offset-4 hover:text-white">
              Seguir pidiendo
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
