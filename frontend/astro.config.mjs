// ============================================================
// astro.config.mjs — Configuración principal de Astro
// ============================================================
import { defineConfig } from 'astro/config';
import react from '@astrojs/react'; // islas interactivas en React
import node from '@astrojs/node'; // permite páginas renderizadas en el servidor
import tailwindcss from '@tailwindcss/vite'; // Tailwind CSS v4 como plugin de Vite

export default defineConfig({
  // Las páginas son estáticas por defecto; solo producto/[id] se renderiza
  // en el servidor (prerender = false) porque el catálogo cambia en la BD.
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: { port: 4321 },
});
