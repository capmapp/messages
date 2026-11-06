# Mensajes para papá

API de Node.js con Express y una interfaz React, ambas en TypeScript. Los mensajes se leen de `data/messages.json` en cada petición, sin base de datos.

## Desarrollo

Requiere Node.js 22.17 o superior y npm. Desde la raíz del proyecto:

```sh
npm install
npm run dev
```

Abre http://127.0.0.1:5173. La API usa http://127.0.0.1:3001; Vite redirige las peticiones `/api` a ese puerto. Si el puerto web está ocupado, Vite indica otro disponible.

## API

- `GET /api/messages`: devuelve `{ "messages": [{ "id": 1, "message": "..." }] }`.
- `GET /api/messages/random`: devuelve un mensaje aleatorio `{ "id": 1, "message": "..." }`.
- `GET /api/messages/random?exclude=1`: evita ese mensaje si hay alternativas.

Un archivo ausente, inválido o sin mensajes devuelve HTTP 500 con `{ "error": "..." }`. Conserva la estructura del JSON y usa identificadores numéricos positivos únicos.

## Verificación y producción

```sh
npm test
npm run build
npm start
```

En producción Express sirve la interfaz compilada y la API en http://127.0.0.1:3001. Puedes cambiar el puerto con la variable `PORT`. Ejecuta los comandos desde la raíz y conserva la carpeta `data` junto a `dist`.

La fotografía (Unsplash) y las fuentes (Google Fonts) requieren conexión a Internet. La lectura de mensajes funciona localmente.
