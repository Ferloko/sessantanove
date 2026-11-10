import { verifyWebhookSignature } from "../server/fleeca.js";
import { json, notifyDiscord } from "../server/http.js";

/**
 * Webhook de Fleeca (configura esta URL como "Callback URL" en el Merchant Center):
 *   https://TU-DOMINIO/api/fleeca-webhook
 * Verifica la firma HMAC y deja constancia del pago en Discord aunque el cliente cierre el navegador.
 */
export async function POST(request: Request): Promise<Response> {
  const raw = await request.text();
  if (!verifyWebhookSignature(raw, request.headers.get("x-fleeca-signature"))) return json({ error: "Firma no válida." }, 401);
  let event: any = {};
  try { event = JSON.parse(raw); } catch { /* cuerpo no JSON: se registra igualmente */ }
  const data = event?.data ?? event;
  const field = (value: unknown) => String(value ?? "—").replace(/[`@]/g, "").slice(0, 200);
  await notifyDiscord(
    `🏦 Aviso de Fleeca — estado: **${field(data?.status)}**\nPago: \`${field(data?.payment_id)}\` · Importe: ${field(data?.amount)}\n${field(data?.description)}`,
  );
  return json({ ok: true });
}
