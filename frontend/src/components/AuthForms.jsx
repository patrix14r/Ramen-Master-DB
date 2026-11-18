// Formularios de inicio de sesión y registro (JWT).
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { iniciarSesion, useAuth } from '../lib/store';

// Solo aceptamos rutas internas ("/carrito") para evitar redirecciones a sitios externos.
function destinoSeguro(next) {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null;
}

export default function AuthForms() {
  const { token } = useAuth();
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [next, setNext] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Lee ?next= y ?modo= de la URL; si ya hay sesión, redirige al destino.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(params.get('next'));
    if (params.get('modo') === 'registro') setModo('registro');
    if (token) window.location.replace(destinoSeguro(params.get('next')) || '/perfil');
  }, [token]);

  // Envío de ambos formularios: llama al backend y guarda la sesión.
  async function enviar(e) {
    e.preventDefault();
    setError('');
    const datos = Object.fromEntries(new FormData(e.currentTarget));
    setEnviando(true);
    try {
      const respuesta =
        modo === 'login'
          ? await api.login(datos.email, datos.password)
          : await api.registro(datos);
      iniciarSesion(respuesta.token, respuesta.cliente);
      // Vuelve a la página de origen o va al perfil.
      window.location.href = destinoSeguro(next) || '/perfil';
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const pestana = (valor, texto) => (
    <button
      type="button"
      onClick={() => {
        setModo(valor);
        setError('');
      }}
      aria-pressed={modo === valor}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition ${
        modo === valor ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'
      }`}
    >
      {texto}
    </button>
  );

  return (
    <div className="tarjeta mx-auto w-full max-w-md p-6">
      <h1 className="text-2xl font-bold tracking-tight text-bone">
        {modo === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
      </h1>
      <p className="mt-1 text-sm font-light">
        {modo === 'login'
          ? 'Ingresa para ver tus pedidos y favoritos.'
          : 'Tu primer pedido incluye un descuento de bienvenida.'}
      </p>

      <div className="mt-5 flex gap-1 rounded-xl border border-white/10 bg-ink p-1">
        {pestana('login', 'Ingresar')}
        {pestana('registro', 'Registrarme')}
      </div>

      {/* key={modo} reinicia los campos al cambiar de pestaña */}
      <form key={modo} onSubmit={enviar} className="mt-5 space-y-4">
        {modo === 'registro' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="nombre">Nombre</label>
              <input id="nombre" name="nombre" required maxLength={50} autoComplete="given-name" className="campo" />
            </div>
            <div>
              <label className="etiqueta" htmlFor="apellido">Apellido</label>
              <input id="apellido" name="apellido" required maxLength={50} autoComplete="family-name" className="campo" />
            </div>
          </div>
        )}

        <div>
          <label className="etiqueta" htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" required maxLength={100} autoComplete="email" className="campo" />
        </div>

        {modo === 'registro' && (
          <div>
            <label className="etiqueta" htmlFor="telefono">Teléfono (opcional)</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              inputMode="numeric"
              pattern="\d{9}"
              title="9 dígitos"
              placeholder="987654321"
              autoComplete="tel-national"
              className="campo"
            />
          </div>
        )}

        <div>
          <label className="etiqueta" htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={modo === 'registro' ? 8 : undefined}
            autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            className="campo"
          />
          {modo === 'registro' && <p className="mt-1 text-xs font-light text-white/40">Mínimo 8 caracteres.</p>}
        </div>

        {error && (
          <p role="alert" className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-bone">
            {error}
          </p>
        )}

        <button type="submit" disabled={enviando} className="btn-cta w-full !py-3">
          {enviando ? 'Un momento...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
        </button>
      </form>
    </div>
  );
}
