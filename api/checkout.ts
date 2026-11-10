import { createPayment, fleecaConfig, FleecaError } from "../server/fleeca.js";
import { json, notifyDiscord, readJson, siteOrigin } from "../server/http.js";
import { describeOrder, newOrderRef, OrderError, priceOrder, sealOrder, syncCatalog, validateCustomer, type Order } from "../server/orders.js";

/** Crea el pedido: recalcula el total con el catálogo, abre el pago en Fleeca y devuelve el enlace. */
export async function POST(request: Request): Promise<Response> {
  let body: any;
  try { body = await readJson(request); } catch { return json({ error: "Solicitud no válida." }, 400); }
  try {
    await syncCatalog();
    const { lines, total } = priceOrder(body?.items);
    const customer = validateCustomer(body?.customer);
    const ref = newOrderRef();
    const { paymentId, paymentUrl } = await createPayment(total, `Sessanta Nove · Pedido ${ref}`, siteOrigin(request));
    const order: Order = { ref, paymentId, total, lines, customer, createdAt: Date.now() };
    await notifyDiscord(`🕓 Pago iniciado (pendiente)\n${describeOrder(order)}\nPago Fleeca: \`${paymentId}\``);
    return json({ ref, total, paymentId, paymentUrl, order: sealOrder(order), demo: fleecaConfig().demo });
  } catch (error) {
    if (error instanceof OrderError) return json({ error: error.message }, 400);
    if (error instanceof FleecaError) return json({ error: error.message }, 502);
    console.error(error);
    return json({ error: "No pudimos iniciar el pago. Inténtalo de nuevo." }, 500);
  }
}
