# Ramen Master 2.0

Tienda de cocina nikkei (ramen, sushi, arroz frito y omelets). Backend en Express + Knex + MySQL y frontend en Astro + React + Tailwind.

## Puesta en marcha

1. Crea la base `ramen_master_db` en MySQL y copia `backend/.env.example` a `backend/.env` con tus valores.
2. Desde la raíz:

```bash
npm run install:all
npm run db:setup
npm run dev
```

- Frontend: http://localhost:4321
- API: http://localhost:3000/api (lista de rutas)
- Cliente de prueba: `cliente@ramenmaster.pe` / `123456`

## Estructura

- `backend/`: API REST (MVC: routes, controllers, models), migraciones y seeders Knex.
- `frontend/`: tienda web (Astro, islas React, Tailwind, Swiper).
- `database/`: script SQL base del esquema.
- `imagenes/`: fotos de los platos, servidas por el backend en `/imagenes`.
