// Perfil del cliente con pestañas (la activa vive en el hash de la URL).
import { useEffect, useRef, useState } from 'react';
import { Heart, LogOut, MapPin, Receipt, Trash2, UserRound } from 'lucide-react';
import ProductCard from './ProductCard.jsx';
import { api } from '../lib/api';
import { dinero, imgUrl } from '../lib/config';
import {
  actualizarCliente,
  borrarDireccion,
  cerrarSesion,
  direccionesStore,
  guardarDireccion,
  leerDirecciones,
  useAuth,
  useStore,
} from '../lib/store';
import { useFavoritos } from '../lib/favoritos';

const PESTANAS = [
  { id: 'datos', texto: 'Datos personales', Icono: UserRound },
  { id: 'direcciones', texto: 'Direcciones', Icono: MapPin },
  { id: 'pedidos', texto: 'Pedidos', Icono: Receipt },
  { id: 'favoritos', texto: 'Favoritos', Icono: Heart },
];

// Mensaje de éxito/error reutilizable.
function Aviso({ aviso }) {
  if (!aviso) return null;
  return (
    <p role={aviso.error ? 'alert' : 'status'} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-bone">
      {aviso.texto}
    </p>
  );
}

// ---------- Pestaña: datos personales ----------
function PestanaDatos({ cliente }) {
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    setAviso(null);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    const cambios = { nombre: f.nombre, apellido: f.apellido, telefono: f.telefono };
    // Solo se cambia la contraseña si el cliente escribió una nueva.
    if (f.password_nueva) {
      cambios.password_actual = f.password_actual;
      cambios.password_nueva = f.password_nueva;
    }
    setEnviando(true);
    try {
      const r = await api.actualizarPerfil(cambios);
      actualizarCliente(r.cliente);
      setAviso({ texto: 'Datos actualizados.' });
      e.currentTarget.reset?.();
    } catch (err) {
      setAviso({ texto: err.message, error: true });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={guardar} className="tarjeta max-w-xl space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="p-nombre">Nombre</label>
          <input id="p-nombre" name="nombre" defaultValue={cliente.nombre} required maxLength={50} className="campo" />
        </div>
        <div>
          <label className="etiqueta" htmlFor="p-apellido">Apellido</label>
          <input id="p-apellido" name="apellido" defaultValue={cliente.apellido} required maxLength={50} className="campo" />
        </div>
      </div>
      <div>
        <label className="etiqueta" htmlFor="p-email">Correo electrónico</label>
        <input id="p-email" value={cliente.email} disabled className="campo opacity-60" />
      </div>
      <div>
        <label className="etiqueta" htmlFor="p-tel">Teléfono</label>
        <input
          id="p-tel"
          name="telefono"
          defaultValue={cliente.telefono || ''}
          inputMode="numeric"
          pattern="\d{9}|"
          title="9 dígitos"
          className="campo"
        />
      </div>

      <fieldset className="space-y-4 border-t border-white/10 pt-4">
        <legend className="etiqueta !mb-0 pr-2">Cambiar contraseña (opcional)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="etiqueta" htmlFor="p-actual">Actual</label>
            <input id="p-actual" name="password_actual" type="password" autoComplete="current-password" className="campo" />
          </div>
          <div>
            <label className="etiqueta" htmlFor="p-nueva">Nueva</label>
            <input id="p-nueva" name="password_nueva" type="password" minLength={8} autoComplete="new-password" className="campo" />
          </div>
        </div>
      </fieldset>

      <Aviso aviso={aviso} />
      <button type="submit" disabled={enviando} className="btn-cta">
        {enviando ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}

// ---------- Pestaña: direcciones guardadas ----------
function PestanaDirecciones({ cliente }) {
  const lista = leerDirecciones(useStore(direccionesStore), cliente.id);
  const [nueva, setNueva] = useState('');

  function agregar(e) {
    e.preventDefault();
    guardarDireccion(cliente.id, nueva);
    setNueva('');
  }

  return (
    <div className="max-w-xl space-y-4">
      <form onSubmit={agregar} className="tarjeta flex flex-col gap-3 p-5 sm:flex-row">
        <input
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          maxLength={255}
          placeholder="Calle, número, distrito"
          aria-label="Nueva dirección"
          className="campo flex-1"
        />
        <button type="submit" disabled={!nueva.trim()} className="btn-ghost">
          Agregar
        </button>
      </form>

      {lista.length === 0 ? (
        <p className="tarjeta p-5 text-sm font-light">Aún no guardaste direcciones.</p>
      ) : (
        <ul className="tarjeta divide-y divide-white/10">
          {lista.map((d) => (
            <li key={d} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <span className="flex items-center gap-3 text-sm font-medium text-bone">
                <MapPin size={16} strokeWidth={1.5} className="shrink-0 text-white/50" /> {d}
              </span>
              <button
                type="button"
                onClick={() => borrarDireccion(cliente.id, d)}
                aria-label={`Eliminar dirección ${d}`}
                className="btn-ghost !px-2.5 !py-1.5"
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs font-light text-white/40">Las direcciones se guardan en este navegador.</p>
    </div>
  );
}

// ---------- Pestaña: historial de pedidos ----------
function PestanaPedidos() {
  const [pedidos, setPedidos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.historial().then(setPedidos).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="tarjeta p-5 text-sm">{error}</p>;
  if (!pedidos) return <div className="tarjeta h-40 animate-pulse" aria-busy="true" />;
  if (pedidos.length === 0) {
    return (
      <div className="tarjeta p-6 text-sm font-light">
        Todavía no hiciste ningún pedido.{' '}
        <a href="/productos" className="font-medium text-bone underline underline-offset-4">Ver la carta</a>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {pedidos.map((p) => (
        <li key={p.id_pedido} className="tarjeta p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold tracking-tight text-bone">Pedido #{p.id_pedido}</h3>
              <p className="text-sm font-light">
                {p.tipo_entrega}
                {p.direccion_entrega ? ` · ${p.direccion_entrega}` : ''}
                {p.metodo_pago ? ` · ${p.metodo_pago}` : ''}
              </p>
            </div>
            {/* Estado en neutro: el carmesí se reserva para el CTA */}
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-bone">
              {p.estado_preparacion}
            </span>
          </div>

          <ul className="mt-3 divide-y divide-white/10 border-t border-white/10">
            {p.items.map((i) => (
              <li key={i.id_detalle} className="flex items-center gap-3 py-3">
                <img src={imgUrl(i.imagen)} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-bone">
                    {i.cantidad} x {i.nombre}
                  </p>
                  <p className="truncate text-xs font-light">
                    {[i.personalizacion?.picante, ...i.extras.map((e) => e.opcion), i.notas]
                      .filter(Boolean)
                      .join(' · ') || 'Sin personalización'}
                  </p>
                </div>
                <span className="text-sm font-medium text-bone">{dinero(i.subtotal)}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
            <span className="text-xs font-medium uppercase tracking-wider text-white/50">
              Total{p.monto_descuento > 0 ? ` (desc. ${dinero(p.monto_descuento)})` : ''}
            </span>
            <span className="text-lg font-bold tracking-tight text-bone">{dinero(p.total_final)}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------- Pestaña: favoritos ----------
function PestanaFavoritos() {
  const [lista, setLista] = useState(null);
  const [error, setError] = useState('');
  const { ids } = useFavoritos();

  useEffect(() => {
    api.favoritos().then(setLista).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="tarjeta p-5 text-sm">{error}</p>;
  if (!lista) return <div className="tarjeta h-40 animate-pulse" aria-busy="true" />;

  // Se filtra con el estado en vivo: al quitar un corazón, la tarjeta desaparece.
  const visibles = lista.filter((p) => ids.includes(p.id_producto));
  if (visibles.length === 0) {
    return (
      <div className="tarjeta p-6 text-sm font-light">
        No tienes platos favoritos todavía. Toca el corazón en cualquier plato de la{' '}
        <a href="/productos" className="font-medium text-bone underline underline-offset-4">carta</a>.
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {visibles.map((p) => (
        <ProductCard key={p.id_producto} producto={p} />
      ))}
    </div>
  );
}

// ---------- Componente principal ----------
export default function ProfileManager() {
  const { token, cliente } = useAuth();
  const [montado, setMontado] = useState(false);
  const saliendo = useRef(false); // evita redirigir al login mientras se cierra sesión
  const [pestana, setPestana] = useState('datos');

  useEffect(() => {
    setMontado(true);

    // Pestaña inicial según el hash, y reacción a cambios del hash.
    const leerHash = () => {
      const id = window.location.hash.replace('#', '');
      if (PESTANAS.some((p) => p.id === id)) setPestana(id);
    };
    leerHash();
    window.addEventListener('hashchange', leerHash);
    return () => window.removeEventListener('hashchange', leerHash);
  }, []);

  // Con sesión, refrescamos el perfil (valida el token y trae datos al día).
  useEffect(() => {
    if (!token) return;
    api.perfil().then((r) => actualizarCliente(r.cliente)).catch(() => {});
  }, [token]);

  function elegir(id) {
    setPestana(id);
    window.history.replaceState(null, '', `#${id}`);
  }

  // Sin sesión se envía al login y se vuelve aquí después.
  useEffect(() => {
    if (montado && !saliendo.current && (!token || !cliente)) {
      window.location.replace(`/login?next=${encodeURIComponent('/perfil' + window.location.hash)}`);
    }
  }, [montado, token, cliente]);

  // Mientras se lee la sesión guardada (o se redirige) se muestra un esqueleto.
  if (!montado || !token || !cliente) return <div className="tarjeta mx-auto h-72 max-w-md animate-pulse" aria-busy="true" />;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-bone">
            Hola, {cliente.nombre}
          </h1>
          <p className="text-sm font-light">{cliente.email}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            saliendo.current = true;
            cerrarSesion();
            window.location.href = '/';
          }}
          className="btn-ghost"
        >
          <LogOut size={16} strokeWidth={1.5} /> Cerrar sesión
        </button>
      </div>

      {/* Pestañas (el activo es un badge carmesí) */}
      <div role="tablist" aria-label="Secciones del perfil" className="mb-6 flex flex-wrap gap-2">
        {PESTANAS.map(({ id, texto, Icono }) => {
          const activa = pestana === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={activa}
              onClick={() => elegir(id)}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium tracking-tight transition ${
                activa
                  ? 'border-crimson bg-crimson text-white'
                  : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              <Icono size={16} strokeWidth={1.5} /> {texto}
            </button>
          );
        })}
      </div>

      <div role="tabpanel">
        {pestana === 'datos' && <PestanaDatos cliente={cliente} />}
        {pestana === 'direcciones' && <PestanaDirecciones cliente={cliente} />}
        {pestana === 'pedidos' && <PestanaPedidos />}
        {pestana === 'favoritos' && <PestanaFavoritos />}
      </div>
    </div>
  );
}
