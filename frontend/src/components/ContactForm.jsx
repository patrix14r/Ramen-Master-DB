// Formulario de contacto: envía el mensaje al backend (POST /api/contacto).
import { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { api } from '../lib/api';

export default function ContactForm() {
  const [estado, setEstado] = useState('inicial'); // inicial | enviando | enviado
  const [error, setError] = useState('');

  async function enviar(e) {
    e.preventDefault();
    setError('');
    const formulario = e.currentTarget;
    setEstado('enviando');
    try {
      await api.enviarContacto(Object.fromEntries(new FormData(formulario)));
      formulario.reset();
      setEstado('enviado');
    } catch (err) {
      setError(err.message);
      setEstado('inicial');
    }
  }

  // Confirmación tras el envío.
  if (estado === 'enviado') {
    return (
      <div className="vidrio p-8 text-center" role="status">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
          <Check size={22} strokeWidth={1.5} className="text-bone" />
        </span>
        <h3 className="mt-4 text-xl font-bold tracking-tight text-bone">Mensaje enviado</h3>
        <p className="mt-1 text-sm font-light">Gracias por escribirnos. Te responderemos a la brevedad.</p>
        <button type="button" onClick={() => setEstado('inicial')} className="btn-ghost mt-5">
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="vidrio space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="c-nombre">
            Tu nombre
          </label>
          <input
            id="c-nombre"
            name="nombre"
            required
            maxLength={100}
            autoComplete="name"
            className="campo !border-0 !border-b !border-white/30 !rounded-none !bg-transparent !px-0"
          />
        </div>
        <div>
          <label className="etiqueta" htmlFor="c-email">
            Correo electrónico
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            maxLength={100}
            autoComplete="email"
            className="campo !border-0 !border-b !border-white/30 !rounded-none !bg-transparent !px-0"
          />
        </div>
      </div>
      <div>
        <label className="etiqueta" htmlFor="c-mensaje">
          Mensaje
        </label>
        <textarea
          id="c-mensaje"
          name="mensaje"
          rows={5}
          required
          maxLength={2000}
          placeholder="¿En qué podemos ayudarte?"
          className="campo resize-none !border-0 !border-b !border-white/30 !rounded-none !bg-transparent !px-0"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-bone">
          {error}
        </p>
      )}

      <button type="submit" disabled={estado === 'enviando'} className="btn-degradado w-full !py-3">
        <Send size={16} strokeWidth={1.5} /> {estado === 'enviando' ? 'Enviando...' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
