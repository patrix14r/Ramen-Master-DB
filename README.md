# Ramen Master 2.0

Tienda en línea de cocina nikkei (fusión japonesa y peruana): ramen, sushi, arroz frito, omelets y combos. Carta con filtros y favoritos, personalización de platos con precio en vivo, carrito con delivery o retiro en tienda, cuentas de cliente e historial de pedidos.

## Tecnologías

- **Frontend:** Astro 7, React 19 (islas), Tailwind CSS v4, Swiper y Lucide.
- **Backend:** Node.js, Express 5, Knex y MySQL, con arquitectura MVC.
- **Seguridad:** JWT, contraseñas con bcrypt, helmet, límite de intentos en login y precios siempre leídos de la base de datos.

```bash
npm run install:all
npm run db:setup
npm run dev
```

- Tienda: http://localhost:4321
- API: http://localhost:3000/api
- Cliente de prueba: `cliente@ramenmaster.pe` / `******`

## Estructura

| Carpeta     | Contenido                                               |
| ----------- | ------------------------------------------------------- |
| `backend/`  | API REST, migraciones y seeders Knex                    |
| `frontend/` | Tienda web (páginas, componentes, estilos)              |
| `imagenes/` | Fotos de los platos, servidas por la API en `/imagenes` |

## Equipo

Patrix A, Jair N y Michael A.

Ese ultimo nose pa que esta :v
    