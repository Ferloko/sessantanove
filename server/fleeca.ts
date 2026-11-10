import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Cliente de la API v2 de Fleeca (banco de GTA World).
 *   POST /api/v2/payment          { amount, mode, description } → { payment_id, payment_link }
 *   GET  /api/v2/payments/{id}    → { status: "pending" | "payment_successful" | "payment_failed", amount, mode, … }
 *   Webhook: POST firmado con X-Fleeca-Signature: sha256=<HMAC-SHA256(cuerpo, API key)>
 * Las URLs de redirección y de webhook se configuran en el Merchant Center de Fleeca.
 */

export type PaymentStatus = "paid" | "pending" | "failed";

export interface FleecaConfig { apiKey: string; baseUrl: string; live: boolean; demo: boolean }

export function fleecaConfig(): FleecaConfig {
  const apiKey = (process.env.FLEECA_API_KEY ?? "").trim();
  return {
    apiKey,
    baseUrl: (process.env.FLEECA_BASE_URL || "https://banking-es.gta.world").replace(/\/+$/, ""),
    live: process.env.FLEECA_MODE === "1",
    demo: !apiKey,
  };
}

export class FleecaError extends Error {}

async function call(path: string, init?: RequestInit): Promise<any> {
  const { apiKey, baseUrl } = fleecaConfig();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) },
      signal: AbortSignal.timeout(12000),
    });
  } catch {
    throw new FleecaError("No se pudo conectar con Fleeca. Inténtalo de nuevo en unos instantes.");
  }
  if (response.status === 401) throw new FleecaError("Fleeca rechazó la clave del comercio (FLEECA_API_KEY).");
  if (response.status === 429) throw new FleecaError("Fleeca está recibiendo demasiadas solicitudes. Espera un minuto e inténtalo de nuevo.");
  if (!response.ok) {
    console.error("Fleeca", response.status, (await response.text().catch(() => "")).slice(0, 500));
    throw new FleecaError("Fleeca no pudo procesar la solicitud.");
  }
  return response.json().catch(() => { throw new FleecaError("Respuesta inesperada de Fleeca."); });
}

const SIM_PREFIX = "sim_";

export async function createPayment(amount: number, description: string, origin: string): Promise<{ paymentId: string; paymentUrl: string }> {
  const config = fleecaConfig();
  if (config.demo) {
    const paymentId = `${SIM_PREFIX}${amount}_${randomBytes(6).toString("hex")}`;
    return { paymentId, paymentUrl: `${origin}/pago/simulado?payment_id=${paymentId}` };
  }
  const json = await call("/api/v2/payment", { method: "POST", body: JSON.stringify({ amount, mode: config.live ? 1 : 0, description: description.slice(0, 255) }) });
  const data = json?.data ?? json;
  const paymentId = data?.payment_id ?? json?.payment_id;
  const paymentUrl = data?.payment_link ?? data?.payment_url ?? json?.payment_link;
  if (!paymentId || !paymentUrl) throw new FleecaError("Fleeca no devolvió un enlace de pago.");
  return { paymentId: String(paymentId), paymentUrl: String(paymentUrl) };
}

export async function getPayment(paymentId: string): Promise<{ status: PaymentStatus; amount: number | null; sandbox: boolean }> {
  const config = fleecaConfig();
  if (paymentId.startsWith(SIM_PREFIX)) {
    // Los pagos simulados solo valen cuando no hay clave configurada (modo demo).
    if (!config.demo) return { status: "failed", amount: null, sandbox: true };
    return { status: "paid", amount: Number(paymentId.split("_")[1]) || null, sandbox: true };
  }
  if (config.demo) return { status: "failed", amount: null, sandbox: true };
  const json = await call(`/api/v2/payments/${encodeURIComponent(paymentId)}`);
  const data = json?.data ?? json;
  const raw = String(data?.status ?? "");
  const status: PaymentStatus = raw === "payment_successful" ? "paid" : raw === "payment_failed" ? "failed" : "pending";
  const amount = data?.amount == null ? null : Number(data.amount);
  return { status, amount, sandbox: Number(data?.mode) !== 1 };
}

export function verifyWebhookSignature(rawBody: string, header: string | null): boolean {
  const { apiKey } = fleecaConfig();
  if (!apiKey || !header) return false;
  const provided = Buffer.from(header.replace(/^sha256=/i, "").trim(), "hex");
  const expected = createHmac("sha256", apiKey).update(rawBody).digest();
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}
