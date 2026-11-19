// Formularios de inicio de sesión y registro (JWT).
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { iniciarSesion, useAuth } from '../lib/store';
import BotonesSociales from './BotonesSociales.jsx';

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
        modo === 'login' ? await api.login(datos.email, datos.password) : await api.registro(datos);
      iniciarSesion(respuesta.token, respuesta.cliente);
      // Vuelve a la página de origen o va al perfil.
      window.location.href = destinoSeguro(next) || '/perfil';
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="neon neon-focus animate-entrada mx-auto w-full max-w-md [--neon-r:24px]">
      <span className="neon-glow" aria-hidden="true" />
      <span className="neon-borde" aria-hidden="true" />
      <div className="tarjeta-neon relative px-8 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-bone">
          {modo === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
        </h1>
        <p className="mt-1 text-sm font-light">
          {modo === 'login'
            ? 'Ingresa para ver tus pedidos y favoritos.'
            : 'Tu primer pedido incluye un descuento de bienvenida.'}
        </p>

        {/* key={modo} reinicia los campos al cambiar de modo */}
        <form key={modo} onSubmit={enviar} className="mt-7 space-y-5">
          {modo === 'registro' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="etiqueta" htmlFor="nombre">
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  required
                  maxLength={50}
                  autoComplete="given-name"
                  className="campo !bg-black/60"
                />
              </div>
              <div>
                <label className="etiqueta" htmlFor="apellido">
                  Apellido
                </label>
                <input
                  id="apellido"
                  name="apellido"
                  required
                  maxLength={50}
                  autoComplete="family-name"
                  className="campo !bg-black/60"
                />
              </div>
            </div>
          )}

          <div>
            <label className="etiqueta" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxLength={100}
              autoComplete="email"
              className="campo !bg-black/60"
            />
          </div>

          {modo === 'registro' && (
            <div>
              <label className="etiqueta" htmlFor="telefono">
                Teléfono (opcional)
              </label>
              <input
                id="telefono"
                name="telefono"
                type="tel"
                inputMode="numeric"
                pattern="\d{9}"
                title="9 dígitos"
                placeholder="987654321"
                autoComplete="tel-national"
                className="campo !bg-black/60"
              />
            </div>
          )}

          <div>
            <label className="etiqueta" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={modo === 'registro' ? 8 : undefined}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              className="campo !bg-black/60"
            />
            {modo === 'registro' && (
              <p className="mt-1 text-xs font-light text-white/40">Mínimo 8 caracteres.</p>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-bone">
              {error}
            </p>
          )}

          <button type="submit" disabled={enviando} className="btn-neon w-full">
            {enviando ? 'Un momento...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <BotonesSociales />

        {/* Cambio de modo como enlace inferior */}
        <p className="mt-5 text-center text-sm font-light">
          {modo === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            type="button"
            onClick={() => {
              setModo(modo === 'login' ? 'registro' : 'login');
              setError('');
            }}
            className="font-medium text-bone underline underline-offset-4 transition hover:text-white"
          >
            {modo === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}
