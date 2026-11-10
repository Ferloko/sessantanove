/**
 * CATÁLOGO DE SESSANTA NOVE
 * ─────────────────────────
 * Tipos, contenido «en vivo» y utilidades. Lo usan la web y el servidor (que recalcula el total antes
 * de cobrar, así nadie puede manipular precios).
 *
 * El contenido inicial está en `seed.ts`. Lo que se publique desde el modo Creador (/atelier) se guarda
 * en Supabase y sustituye a ese contenido inicial mediante `applyContent`.
 */
import { CONTENT_ROW, SUPABASE_KEY, SUPABASE_URL } from "./config.js";
import { seed } from "./seed.js";

export const ART_KINDS = [
  "bag", "tote", "clutch", "trunk", "wallet", "cardholder", "blazer", "coat", "shirt", "dress",
  "loafer", "heel", "boot", "sneaker", "belt", "scarf", "sunglasses", "watch", "ring", "necklace",
  "bracelet", "earrings", "perfume", "candle",
] as const;
export type ArtKind = (typeof ART_KINDS)[number];

export type Gender = "mujer" | "hombre" | "unisex";

export interface ProductColor { name: string; hex: string; monogram?: boolean; images?: string[] }

export interface Product {
  id: string;
  name: string;
  category: string;
  line: string;
  gender: Gender;
  price: number;
  art: ArtKind;
  isNew?: boolean;
  /** Ocupa 2×2 en la cuadrícula de su categoría. */
  big?: boolean;
  description: string;
  details: string[];
  /** Al menos uno. Un color con `images` muestra fotos; sin ellas, la ilustración `art` en ese color. */
  colors: ProductColor[];
  sizes?: string[];
}

/** Bloque editorial 2×2 intercalado en la cuadrícula de una categoría (`position` = tras cuántas piezas). */
export interface Editorial { title: string; text?: string; image?: string; background: string; dark?: boolean; position: number }
export interface Category { slug: string; name: string; image?: string; editorials?: Editorial[] }
/** Colección. Cada una tiene su bloque en la portada: hero + 4 piezas + botones Mujer/Hombre. */
export interface Line { slug: string; name: string; eyebrow: string; title: string; image?: string; background: string }
export interface Hero { image: string; eyebrow: string; title: string; cta: string; href: string }
export interface Content { hero: Hero; lines: Line[]; categories: Category[]; products: Product[] }

export const CURRENCY = "$";

// ── Contenido en vivo (se muta en el sitio para que todos los módulos vean lo mismo) ──
export const hero: Hero = { ...seed.hero };
export const lines: Line[] = [...seed.lines];
export const categories: Category[] = [...seed.categories];
export const products: Product[] = [...seed.products];

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const slug = (value: unknown) => text(value, 60).toLowerCase().replace(/[^a-z0-9-]/g, "");
const url = (value: unknown) => { const clean = text(value, 600); return /^(https:\/\/|\/)[^\s"'<>]*$/.test(clean) ? clean : ""; };
const css = (value: unknown, fallback: string) => { const clean = text(value, 300); return clean && !/[;{}<>]|url\(/i.test(clean) ? clean : fallback; };
const list = <T,>(value: unknown, max: number, map: (item: any) => T | null): T[] =>
  (Array.isArray(value) ? value.slice(0, max).map(map).filter((item): item is T => item !== null) : []);

/** Valida y limpia contenido externo (Supabase, borradores). Devuelve null si no es utilizable. */
export function normalizeContent(raw: any): Content | null {
  if (!raw || typeof raw !== "object") return null;
  const cleanLines = list<Line>(raw.lines, 12, (item) => {
    const id = slug(item?.slug); const name = text(item?.name, 40);
    return id && name ? { slug: id, name, eyebrow: text(item.eyebrow, 60), title: text(item.title, 90) || name, image: url(item.image) || undefined, background: css(item.background, "#1d1512") } : null;
  });
  const cleanCategories = list<Category>(raw.categories, 16, (item) => {
    const id = slug(item?.slug); const name = text(item?.name, 40);
    if (!id || !name) return null;
    const editorials = list<Editorial>(item.editorials, 6, (block) => {
      const title = text(block?.title, 80);
      return title ? { title, text: text(block.text, 160) || undefined, image: url(block.image) || undefined, background: css(block.background, "#ece5d8"), dark: Boolean(block.dark) || undefined, position: Math.max(0, Math.min(200, Math.round(Number(block.position)) || 0)) } : null;
    });
    return { slug: id, name, image: url(item.image) || undefined, editorials: editorials.length ? editorials : undefined };
  });
  const seen = new Set<string>();
  const cleanProducts = list<Product>(raw.products, 600, (item) => {
    const id = slug(item?.id); const name = text(item?.name, 60); const price = Math.round(Number(item?.price));
    if (!id || seen.has(id) || !name || !Number.isFinite(price) || price < 1 || price > 9_999_999) return null;
    const colors = list<ProductColor>(item.colors, 12, (color) => {
      const colorName = text(color?.name, 40); const hex = text(color?.hex, 7);
      if (!colorName || !/^#[0-9a-f]{6}$/i.test(hex)) return null;
      const images = list<string>(color.images, 8, (image) => url(image) || null);
      return { name: colorName, hex, monogram: Boolean(color.monogram) || undefined, images: images.length ? images : undefined };
    }).filter((color, index, all) => all.findIndex((other) => other.name === color.name) === index);
    if (!colors.length || !cleanCategories.some((category) => category.slug === item.category)) return null;
    seen.add(id);
    const sizes = [...new Set(list<string>(item.sizes, 20, (size) => text(size, 12) || null))];
    return {
      id, name, price, colors,
      category: item.category,
      line: cleanLines.some((line) => line.slug === item.line) ? item.line : "",
      gender: item.gender === "mujer" || item.gender === "hombre" ? item.gender : "unisex",
      art: (ART_KINDS as readonly string[]).includes(item.art) ? item.art : "bag",
      isNew: Boolean(item.isNew) || undefined,
      big: Boolean(item.big) || undefined,
      description: text(item.description, 600),
      details: list<string>(item.details, 10, (detail) => text(detail, 120) || null),
      sizes: sizes.length ? sizes : undefined,
    };
  });
  if (!cleanCategories.length) return null;
  const href = text(raw.hero?.href, 200);
  return {
    hero: { image: url(raw.hero?.image), eyebrow: text(raw.hero?.eyebrow, 60), title: text(raw.hero?.title, 120) || "Sessanta Nove", cta: text(raw.hero?.cta, 60) || "Descubrir la colección", href: href.startsWith("/") ? href : "/coleccion" },
    lines: cleanLines, categories: cleanCategories, products: cleanProducts,
  };
}

/** Sustituye el contenido en vivo. Devuelve false si los datos no son válidos (y no cambia nada). */
export function applyContent(raw: unknown): boolean {
  const content = normalizeContent(raw);
  if (!content) return false;
  Object.assign(hero, content.hero);
  lines.splice(0, lines.length, ...content.lines);
  categories.splice(0, categories.length, ...content.categories);
  products.splice(0, products.length, ...content.products);
  return true;
}

export const currentContent = (): Content => JSON.parse(JSON.stringify({ hero, lines, categories, products }));

/** Lee el contenido publicado en Supabase. null si no hay nada publicado o no se puede leer. */
export async function fetchPublishedContent(): Promise<unknown | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/sn_content?id=eq.${CONTENT_ROW}&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;
    const rows = await response.json();
    return Array.isArray(rows) && rows[0]?.data ? rows[0].data : null;
  } catch {
    return null;
  }
}

export const getProduct = (id: string) => products.find((product) => product.id === id);
export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);
export const getLine = (slug: string) => lines.find((line) => line.slug === slug);
export const getColor = (product: Product, name?: string | null) => product.colors.find((color) => color.name === name) ?? product.colors[0];
export const matchesGender = (product: Product, gender: Gender) => product.gender === gender || product.gender === "unisex";
/** Referencia tipo «SN0A12» derivada de la posición en el catálogo. */
export const skuOf = (product: Product) => `SN0A${String(products.indexOf(product) + 1).padStart(2, "0")}`;

/** $18.500 — separador de miles con punto, sin decimales. */
export function formatPrice(amount: number): string {
  return `${CURRENCY}${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export const DELIVERY_METHODS = [
  { id: "boutique", label: "Recogida en boutique", note: "Te avisamos cuando tu pedido esté preparado." },
  { id: "domicilio", label: "Entrega a domicilio", note: "Un asesor concertará la entrega contigo." },
] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]["id"];

export interface CustomerInput { name: string; phone: string; delivery: DeliveryMethod; address?: string; notes?: string }
