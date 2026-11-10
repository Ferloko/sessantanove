import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { applyContent, DELIVERY_METHODS, fetchPublishedContent, formatPrice, getProduct, type CustomerInput, type DeliveryMethod } from "../shared/catalog.js";
import { fleecaConfig } from "./fleeca.js";

export interface OrderLine { id: string; name: string; color: string; size?: string; qty: number; unit: number }
export interface Order {
  ref: string;
  paymentId: string;
  total: number;
  lines: OrderLine[];
  customer: CustomerInput;
  createdAt: number;
}

export class OrderError extends Error {}

let syncedAt = 0;
/** Carga en el servidor el catálogo publicado desde el modo Creador (con 20 s de caché) para cobrar los precios vigentes. */
export async function syncCatalog(): Promise<void> {
  if (Date.now() - syncedAt < 20_000) return;
  const published = await fetchPublishedContent();
  if (published) applyContent(published);
  syncedAt = Date.now();
}

const MAX_QTY = 10;
const MAX_LINES = 30;
const clean = (value: unknown, max: number) => (typeof value === "string" ? value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "");

/** Valida el carrito y recalcula precios desde el catálogo: nunca se confía en los importes del navegador. */
export function priceOrder(rawItems: unknown): { lines: OrderLine[]; total: number } {
  if (!Array.isArray(rawItems) || rawItems.length === 0) throw new OrderError("Tu bolsa está vacía.");
  if (rawItems.length > MAX_LINES) throw new OrderError("Demasiados artículos en un solo pedido.");
  const lines: OrderLine[] = rawItems.map((item) => {
    const product = getProduct(clean(item?.id, 80));
    if (!product) throw new OrderError("Uno de los artículos ya no está disponible.");
    const qty = Number(item?.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) throw new OrderError(`Cantidad no válida para ${product.name}.`);
    const color = clean(item?.color, 40);
    if (!product.colors.some((option) => option.name === color)) throw new OrderError(`Elige color para ${product.name}.`);
    let size: string | undefined;
    if (product.sizes) {
      size = clean(item?.size, 20);
      if (!product.sizes.includes(size)) throw new OrderError(`Elige talla para ${product.name}.`);
    }
    return { id: product.id, name: product.name, color, size, qty, unit: product.price };
  });
  const total = lines.reduce((sum, line) => sum + line.unit * line.qty, 0);
  if (total < 1 || total > 99_999_999) throw new OrderError("El importe del pedido supera el límite de la pasarela.");
  return { lines, total };
}

export function validateCustomer(raw: any): CustomerInput {
  const name = clean(raw?.name, 60);
  const phone = clean(raw?.phone, 20);
  const delivery = clean(raw?.delivery, 20) as DeliveryMethod;
  const address = clean(raw?.address, 120);
  const notes = clean(raw?.notes, 300);
  if (name.length < 3) throw new OrderError("Indica el nombre y apellido de tu personaje.");
  if (!/^[0-9+\-\s]{3,20}$/.test(phone)) throw new OrderError("Indica un número de teléfono válido.");
  if (!DELIVERY_METHODS.some((method) => method.id === delivery)) throw new OrderError("Elige un método de entrega.");
  if (delivery === "domicilio" && address.length < 4) throw new OrderError("Indica la dirección de entrega.");
  return { name, phone, delivery, address: delivery === "domicilio" ? address : undefined, notes: notes || undefined };
}

export const newOrderRef = () => `SN-${randomBytes(4).toString("hex").toUpperCase()}`;

function secret(): string {
  const configured = (process.env.ORDER_SECRET ?? "").trim();
  if (configured) return configured;
  const { apiKey, demo } = fleecaConfig();
  if (demo) return "sessanta-nove-demo-secret";
  return `order:${apiKey}`;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

/** El pedido viaja firmado en el navegador (no hay base de datos); el servidor comprueba la firma al volver. */
export function sealOrder(order: Order): string {
  const payload = Buffer.from(JSON.stringify(order)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function openOrder(token: unknown): Order {
  if (typeof token !== "string" || token.length > 20000) throw new OrderError("Pedido no válido.");
  const [payload, signature] = token.split(".");
  if (!payload || !signature) throw new OrderError("Pedido no válido.");
  const expected = Buffer.from(sign(payload));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) throw new OrderError("Pedido no válido.");
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Order;
}

export function describeOrder(order: Pick<Order, "lines" | "total" | "customer" | "ref">): string {
  const delivery = DELIVERY_METHODS.find((method) => method.id === order.customer.delivery)?.label ?? order.customer.delivery;
  return [
    `**Pedido ${order.ref}** — ${formatPrice(order.total)}`,
    ...order.lines.map((line) => `• ${line.qty} × ${line.name} (${[line.color, line.size && `talla ${line.size}`].filter(Boolean).join(", ")}) — ${formatPrice(line.unit * line.qty)}`),
    `Cliente: ${order.customer.name} · Tel. ${order.customer.phone}`,
    `Entrega: ${delivery}${order.customer.address ? ` — ${order.customer.address}` : ""}`,
    ...(order.customer.notes ? [`Notas: ${order.customer.notes}`] : []),
  ].join("\n");
}
