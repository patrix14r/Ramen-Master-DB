// Carrito y checkout en 2 columnas: platos, entrega y pago (7) + resumen sticky con el botón (5).
import { useEffect, useState } from 'react';
import {
  Banknote,
  Bike,
  Check,
  CreditCard,
  MapPin,
  Minus,
  Pencil,
  Plus,
  ShoppingBag,
  Smartphone,
  Store,
  Trash2,
  X,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  COSTO_ENVIO,
  DESCUENTO_BIENVENIDA,
  EXTRAS,
  METODOS_PAGO,
  NIVELES_PICANTE,
  dinero,
  imgUrl,
} from '../lib/config';
import {
  actualizarCliente,
  cambiarCantidad,
  direccionesStore,
  editarItem,
  guardarDireccion,
  leerDirecciones,
  quitarDelCarrito,
  subtotalItem,
  useAuth,
  useCart,
  useStore,
  vaciarCarrito,
} from '../lib/store';

// Icono de cada método de pago (por el nombre guardado en config).
const ICONOS_PAGO = { CreditCard, Smartphone, Banknote };

// ---------- Editor de una línea del carrito ----------
// Trabaja sobre una copia (borrador) y solo aplica los cambios al pulsar "Guardar".
function EditorItem({ item, alGuardar, alCancelar }) {
  const [picante, setPicante] = useState(item.picante || NIVELES_PICANTE[0]);
  const [extras, setExtras] = useState(item.extras.map((e) => e.opcion));
  const [notas, setNotas] = useState(item.notas || '');

  const alternar = (opcion) =>
    setExtras((a) => (a.includes(opcion) ? a.filter((o) => o !== opcion) : [...a, opcion]));

  return (
    <div className="mt-3 space-y-4 rounded-xl border border-white/10 bg-ink p-4">
      {item.personalizable && (
        <>
          <fieldset>
            <legend className="etiqueta">Nivel de picante</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {NIVELES_PICANTE.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPicante(n)}
                  aria-pressed={picante === n}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                    picante === n
                      ? 'border-white/40 bg-white/10 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="etiqueta">Extras</legend>
            <div className="space-y-1.5">
              {EXTRAS.map((e) => (
                <label
                  key={e.opcion}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={extras.includes(e.opcion)}
                      onChange={() => alternar(e.opcion)}
                      className="h-4 w-4 accent-[#F4F4F6]"
                    />
                    <span className="font-medium text-bone">{e.opcion}</span>
                  </span>
                  <span>+ {dinero(e.precio_adicional)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      <div>
        <label className="etiqueta" htmlFor={`notas-${item.key}`}>
          Notas de cocina
        </label>
        <textarea
          id={`notas-${item.key}`}
          rows={2}
          maxLength={255}
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="campo resize-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={alCancelar} className="btn-ghost">
          Cancelar
        </button>
        <button
          type="button"
          onClick={() =>
            alGuardar({
              picante: item.personalizable ? picante : '',
              extras: item.personalizable ? EXTRAS.filter((e) => extras.includes(e.opcion)) : [],
              notas: notas.trim(),
            })
          }
          className="btn-ghost !border-white/30"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

// ---------- Componente principal ----------
export default function CheckoutManager() {
  const carrito = useCart();
  const { token, cliente } = useAuth();
  const direcciones = leerDirecciones(useStore(direccionesStore), cliente?.id);

  const [tipoEntrega, setTipoEntrega] = useState('Delivery');
  const [direccion, setDireccion] = useState('');
  const [recordarDireccion, setRecordarDireccion] = useState(true);
  const [metodo, setMetodo] = useState(METODOS_PAGO[0].id);
  const [editando, setEditando] = useState(null); // key de la línea en edición
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [pedido, setPedido] = useState(null); // datos del pedido confirmado
  const [montado, setMontado] = useState(false);

  // Evita mostrar "carrito vacío" por un instante antes de leer localStorage.
  useEffect(() => setMontado(true), []);

  // Refresca el perfil para saber si sigue siendo su primera compra
  // (y de paso valida que el token no haya caducado).
  useEffect(() => {
    if (!token) return;
    api
      .perfil()
      .then((r) => actualizarCliente(r.cliente))
      .catch(() => {});
  }, [token]);

  // ----- Cálculos del resumen -----
  const subtotal = Math.round(carrito.reduce((s, i) => s + subtotalItem(i), 0) * 100) / 100;
  const envio = tipoEntrega === 'Delivery' ? COSTO_ENVIO : 0;
  const aplicaDescuento = Boolean(token && cliente?.primera_compra);
  const descuento = aplicaDescuento ? Math.round(subtotal * DESCUENTO_BIENVENIDA) / 100 : 0;
  const total = Math.round((subtotal + envio - descuento) * 100) / 100;
  const unidades = carrito.reduce((s, i) => s + i.cantidad, 0);

  async function confirmar() {
    setError('');
    if (tipoEntrega === 'Delivery' && !direccion.trim()) {
      setError('Indica la dirección de entrega.');
      return;
    }
    setEnviando(true);
    try {
      const respuesta = await api.crearPedido({
        tipo_entrega: tipoEntrega,
        direccion_entrega: tipoEntrega === 'Delivery' ? direccion.trim() : undefined,
        id_metodo: metodo,
        items: carrito.map((i) => ({
          id_producto: i.id_producto,
          cantidad: i.cantidad,
          personalizacion: i.picante ? { picante: i.picante } : undefined,
          notas: i.notas || undefined,
          extras: i.extras,
        })),
      });
      if (tipoEntrega === 'Delivery' && recordarDireccion) guardarDireccion(cliente?.id, direccion);
      if (cliente) actualizarCliente({ ...cliente, primera_compra: false });
      vaciarCarrito();
      setPedido(respuesta);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  }

  // ----- Pedido confirmado -----
  if (pedido) {
    return (
      <div className="tarjeta mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Check size={22} strokeWidth={1.5} className="text-bone" />
        </span>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-bone">Pedido confirmado</h2>
        <p className="mt-1 text-sm font-light">
          Tu pedido <span className="font-bold text-bone">#{pedido.id_pedido}</span> ya está en cocina.
        </p>
        <p className="mt-4 text-3xl font-bold tracking-tight text-bone">{dinero(pedido.total_final)}</p>
        {pedido.monto_descuento > 0 && (
          <p className="mt-1 text-sm font-light">Incluye {dinero(pedido.monto_descuento)} de descuento de bienvenida.</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href="/perfil#pedidos" className="btn-ghost">
            Ver mis pedidos
          </a>
          <a href="/productos" className="btn-ghost">
            Volver a la carta
          </a>
        </div>
      </div>
    );
  }

  // ----- Carrito vacío -----
  if (montado && carrito.length === 0) {
    return (
      <div className="tarjeta mx-auto max-w-lg p-8 text-center">
        <ShoppingBag size={28} strokeWidth={1.5} className="mx-auto text-white/50" />
        <h2 className="mt-3 text-xl font-bold tracking-tight text-bone">Tu carrito está vacío</h2>
        <p className="mt-1 text-sm font-light">Agrega algún plato de la carta para empezar.</p>
        <a href="/productos" className="btn-cta mt-5">
          Ver la carta
        </a>
      </div>
    );
  }

  if (!montado) return <div className="tarjeta h-64 animate-pulse" aria-busy="true" />;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      {/* ================= Columna izquierda (7) ================= */}
      <div className="space-y-6 lg:col-span-7">
        {/* --- Platos --- */}
        <section className="tarjeta p-5" aria-labelledby="t-platos">
          <h2 id="t-platos" className="text-lg font-bold tracking-tight text-bone">
            Tu pedido
          </h2>
          <ul className="mt-2 divide-y divide-white/10">
            {carrito.map((item) => (
              <li key={item.key} className="py-4">
                <div className="flex gap-4">
                  <img
                    src={imgUrl(item.imagen)}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <a
                        href={`/producto/${item.id_producto}`}
                        className="text-base font-bold tracking-tight text-bone hover:underline"
                      >
                        {item.nombre}
                      </a>
                      <span className="shrink-0 text-base font-bold text-bone">{dinero(subtotalItem(item))}</span>
                    </div>

                    {/* Resumen de la personalización */}
                    <p className="mt-0.5 text-sm font-light">
                      {[item.picante, ...item.extras.map((e) => `${e.opcion} (+${dinero(e.precio_adicional)})`)]
                        .filter(Boolean)
                        .join(' · ') || 'Sin personalización'}
                    </p>
                    {item.notas && <p className="mt-0.5 text-sm font-light italic">"{item.notas}"</p>}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <div className="flex items-center rounded-lg border border-white/10 bg-white/5">
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.key, -1)}
                          disabled={item.cantidad <= 1}
                          aria-label={`Disminuir cantidad de ${item.nombre}`}
                          className="flex h-8 w-8 items-center justify-center hover:bg-white/10 disabled:opacity-40"
                        >
                          <Minus size={14} strokeWidth={1.5} />
                        </button>
                        <span className="w-7 text-center text-sm font-bold text-bone">{item.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => cambiarCantidad(item.key, 1)}
                          aria-label={`Aumentar cantidad de ${item.nombre}`}
                          className="flex h-8 w-8 items-center justify-center hover:bg-white/10"
                        >
                          <Plus size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditando(editando === item.key ? null : item.key)}
                        aria-expanded={editando === item.key}
                        className="btn-ghost !px-3 !py-1.5 !text-xs"
                      >
                        <Pencil size={13} strokeWidth={1.5} /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => quitarDelCarrito(item.key)}
                        aria-label={`Quitar ${item.nombre}`}
                        className="btn-ghost !px-3 !py-1.5 !text-xs"
                      >
                        <Trash2 size={13} strokeWidth={1.5} /> Quitar
                      </button>
                    </div>
                  </div>
                </div>

                {editando === item.key && (
                  <EditorItem
                    item={item}
                    alCancelar={() => setEditando(null)}
                    alGuardar={(cambios) => {
                      editarItem(item.key, cambios);
                      setEditando(null);
                    }}
                  />
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* --- Entrega --- */}
        <section className="tarjeta p-5" aria-labelledby="t-entrega">
          <h2 id="t-entrega" className="text-lg font-bold tracking-tight text-bone">
            Entrega
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              { valor: 'Delivery', titulo: 'Delivery', detalle: `Envío ${dinero(COSTO_ENVIO)}`, Icono: Bike },
              { valor: 'Retiro en tienda', titulo: 'Retiro en tienda', detalle: 'Sin costo de envío', Icono: Store },
            ].map(({ valor, titulo, detalle, Icono }) => (
              <button
                key={valor}
                type="button"
                onClick={() => setTipoEntrega(valor)}
                aria-pressed={tipoEntrega === valor}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                  tipoEntrega === valor
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <Icono size={22} strokeWidth={1.5} className="shrink-0 text-bone" />
                <span>
                  <span className="block text-sm font-bold text-bone">{titulo}</span>
                  <span className="block text-xs font-light">{detalle}</span>
                </span>
              </button>
            ))}
          </div>

          {tipoEntrega === 'Delivery' ? (
            <div className="mt-4">
              {/* Direcciones guardadas del cliente */}
              {direcciones.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {direcciones.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDireccion(d)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                        direccion === d
                          ? 'border-white/40 bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <MapPin size={12} strokeWidth={1.5} /> {d}
                    </button>
                  ))}
                </div>
              )}
              <label htmlFor="direccion" className="etiqueta">
                Dirección de entrega
              </label>
              <input
                id="direccion"
                type="text"
                value={direccion}
                maxLength={255}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Calle, número, distrito"
                className="campo"
              />
              {token && (
                <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-light">
                  <input
                    type="checkbox"
                    checked={recordarDireccion}
                    onChange={(e) => setRecordarDireccion(e.target.checked)}
                    className="h-4 w-4 accent-[#F4F4F6]"
                  />
                  Guardar esta dirección en mi perfil
                </label>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm font-light">
              Recoge tu pedido en cualquiera de nuestras sedes (Santa Anita o Miraflores) cuando esté listo.
            </p>
          )}
        </section>

        {/* --- Pago --- */}
        <section className="tarjeta p-5" aria-labelledby="t-pago">
          <h2 id="t-pago" className="text-lg font-bold tracking-tight text-bone">
            Método de pago
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {METODOS_PAGO.map((m) => {
              const Icono = ICONOS_PAGO[m.icono];
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetodo(m.id)}
                  aria-pressed={metodo === m.id}
                  className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                    metodo === m.id
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <Icono size={22} strokeWidth={1.5} className="text-bone" />
                  <span>
                    <span className="block text-sm font-bold text-bone">{m.nombre}</span>
                    <span className="block text-xs font-light">{m.detalle}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ================= Columna derecha (5): resumen fijo ================= */}
      <aside className="lg:col-span-5">
        <div className="tarjeta p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold tracking-tight text-bone">Resumen financiero</h2>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="font-light">
                Subtotal ({unidades} {unidades === 1 ? 'plato' : 'platos'})
              </dt>
              <dd className="font-medium text-bone">{dinero(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-light">Envío</dt>
              <dd className="font-medium text-bone">{envio ? dinero(envio) : 'Gratis'}</dd>
            </div>
            {aplicaDescuento && (
              <div className="flex justify-between gap-4">
                <dt className="font-light">Descuento primera compra ({DESCUENTO_BIENVENIDA}%)</dt>
                <dd className="font-medium text-bone">- {dinero(descuento)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-white/10 pt-4">
            <span className="text-sm font-medium uppercase tracking-wider text-white/50">Total</span>
            <span className="text-3xl font-bold tracking-tight text-bone">{dinero(total)}</span>
          </div>

          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-bone">
              <X size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" /> {error}
            </p>
          )}

          {/* El botón vive DENTRO de la tarjeta: nunca se superpone al contenido */}
          {token ? (
            <button
              type="button"
              onClick={confirmar}
              disabled={enviando || carrito.length === 0}
              className="btn-cta mt-5 w-full !py-3"
            >
              {enviando ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          ) : (
            <>
              <a href="/login?next=/carrito" className="btn-cta mt-5 w-full !py-3">
                Inicia sesión para confirmar
              </a>
              <p className="mt-2 text-center text-xs font-light">
                Tu carrito se conserva al iniciar sesión.
              </p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
