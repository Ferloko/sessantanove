# Sessanta Nove — Boutique en línea

Tienda de lujo de la Maison **Sessanta Nove** (servidor de roleplay). Catálogo, bolsa, checkout y cobro
real con la **API v2 de Fleeca Bank** (banco de GTA World).

React + Vite en el cliente y tres funciones de servidor en `/api` (formato Vercel).

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:3000
```

Sin `FLEECA_API_KEY` la tienda arranca en **modo demo**: el pago pasa por una pasarela simulada y no se
mueve dinero. Sirve para probar todo el recorrido de compra.

## Activar el cobro con Fleeca

1. Entra en el **Merchant Center de Fleeca** con el personaje dueño del negocio y copia la clave de API.
2. En el Merchant Center configura:
   - **Redirect URL** → `https://TU-DOMINIO/pago/resultado`
   - **Callback URL (webhook)** → `https://TU-DOMINIO/api/fleeca-webhook`
3. Define las variables de entorno (en Vercel: *Settings → Environment Variables*):

| Variable | Para qué sirve |
| --- | --- |
| `FLEECA_API_KEY` | Clave Bearer del comercio. **Nunca** va en el código ni en el navegador. |
| `FLEECA_MODE` | `0` sandbox (pruebas), `1` cobro real. |
| `FLEECA_BASE_URL` | `https://banking-es.gta.world` (servidor español) o `https://banking.gta.world`. |
| `ORDER_SECRET` | Texto largo y aleatorio con el que se firman los pedidos. |
| `DISCORD_WEBHOOK_URL` | Opcional. Canal de Discord donde llegan los pedidos. |
| `SITE_URL` | Opcional. URL pública de la web. |

Prueba primero con `FLEECA_MODE=0` y pasa a `1` cuando todo funcione.

### Cómo funciona el cobro

1. `POST /api/checkout` — el servidor **recalcula el total con el catálogo** (el navegador no decide precios),
   crea el pago en Fleeca (`POST /api/v2/payment`) y devuelve el enlace de pago y el pedido firmado.
2. El cliente autoriza el pago en Fleeca y vuelve a `/pago/resultado`.
3. `POST /api/order-status` — el servidor comprueba la firma del pedido y pregunta a Fleeca
   (`GET /api/v2/payments/{id}`) por el estado y el importe reales. Solo entonces se confirma.
4. `POST /api/fleeca-webhook` — Fleeca avisa del pago con firma HMAC; queda registrado en Discord aunque el
   cliente cierre el navegador.

No hay base de datos: los pedidos llegan al canal de Discord (pendiente → pagado) con cliente, artículos y
número de pedido `SN-XXXXXXXX`.

## Editar el catálogo

Todo está en [`shared/catalog.ts`](shared/catalog.ts): categorías, productos, precios, colores y tallas.
Para usar fotos (por ejemplo capturas del juego), guárdalas en `public/images/` y añade
`image: "/images/mi-foto.jpg"` al producto; si no hay foto se muestra la ilustración de la casa.

## Despliegue

Pensado para **Vercel**: importa el repositorio, añade las variables de entorno y despliega.
`vercel.json` ya incluye la configuración.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (web + API) |
| `npm run build` | Build de producción en `dist/` |
| `npm run check` | Comprobación de tipos |
