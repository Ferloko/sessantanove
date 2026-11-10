export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function readJson(request: Request): Promise<any> {
  const text = await request.text();
  if (text.length > 30000) throw new Error("too large");
  return JSON.parse(text || "{}");
}

export function siteOrigin(request: Request): string {
  const configured = (process.env.SITE_URL ?? "").trim().replace(/\/+$/, "");
  if (configured) return configured;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? new URL(request.url).host;
  const proto = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto.split(",")[0]}://${host}`;
}

/** Aviso a Discord (opcional). Nunca rompe el flujo de compra si falla. */
export async function notifyDiscord(content: string): Promise<void> {
  const url = (process.env.DISCORD_WEBHOOK_URL ?? "").trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "Sessanta Nove · Boutique", content: content.slice(0, 1900), allowed_mentions: { parse: [] } }),
      signal: AbortSignal.timeout(6000),
    });
  } catch (error) {
    console.error("Discord", error);
  }
}
