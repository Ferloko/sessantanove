import { fleecaConfig, FleecaError, getPayment } from "../server/fleeca.js";
import { json, notifyDiscord, readJson } from "../server/http.js";
import { describeOrder, openOrder, OrderError } from "../server/orders.js";

/**
 * Confirma un pedido al volver de Fleeca. Nunca se confía en la redirección del navegador:
 * se comprueba la firma del pedido y se pregunta a Fleeca por el estado y el importe reales.
 */
export async function POST(request: Request): Promise<Response> {
  let body: any;
  try { body = await readJson(request); } catch { return json({ error: "Solicitud no válida." }, 400); }
  try {
    const order = openOrder(body?.order);
    const payment = await getPayment(order.paymentId);
    let status = payment.status;
    // Un pago solo cuenta si el importe coincide y, en modo real, no es de sandbox.
    if (status === "paid" && (payment.amount !== order.total || (fleecaConfig().live && payment.sandbox))) status = "failed";
    if (status === "paid" && body?.announce === true) {
      await notifyDiscord(`✅ **PAGADO**${payment.sandbox ? " (prueba / sandbox)" : ""}\n${describeOrder(order)}\nPago Fleeca: \`${order.paymentId}\``);
    }
    return json({ status, ref: order.ref, total: order.total, lines: order.lines, customer: { name: order.customer.name, delivery: order.customer.delivery }, sandbox: payment.sandbox });
  } catch (error) {
    if (error instanceof OrderError) return json({ error: error.message }, 400);
    if (error instanceof FleecaError) return json({ error: error.message }, 502);
    console.error(error);
    return json({ error: "No pudimos comprobar el pago." }, 500);
  }
}
