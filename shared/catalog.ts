/**
 * CATÁLOGO DE SESSANTA NOVE
 * ─────────────────────────
 * Única fuente de verdad de la tienda: la usan la web y el servidor (que recalcula el total
 * antes de cobrar, así nadie puede manipular precios).
 *
 * PRODUCTOS (`products`)
 *  - `price`    → dólares del juego, entero.
 *  - `category` → slug de `categories`.   `line` → slug de `lines` (colección).
 *  - `gender`   → "mujer", "hombre" o "unisex" (unisex aparece en ambos).
 *  - `colors`   → al menos uno. Cada color puede llevar sus propias fotos:
 *                 { name: "Nero", hex: "#1b1917", images: ["/images/borsa-nero-1.jpg", "/images/borsa-nero-2.jpg"] }
 *                 Sin fotos se dibuja la ilustración `art` en ese color; `monogram: true` le estampa el monograma.
 *  - `sizes`    → opcional. Tallas.
 *  - `big`      → opcional. Ocupa 2×2 en la cuadrícula de su categoría.
 *
 * FOTOS: guárdalas en /public/images y usa la ruta "/images/archivo.jpg".
 */

export type ArtKind =
  | "bag" | "tote" | "wallet" | "sunglasses" | "watch" | "scarf" | "loafer" | "heel"
  | "perfume" | "belt" | "blazer" | "dress" | "ring" | "trunk";

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
  big?: boolean;
  description: string;
  details: string[];
  colors: ProductColor[];
  sizes?: string[];
}

/** Bloque editorial 2×2 que se intercala en la cuadrícula de una categoría (`position` = tras cuántas piezas). */
export interface Editorial { title: string; text?: string; image?: string; background: string; dark?: boolean; position: number }

export interface Category { slug: string; name: string; image?: string; editorial?: Editorial }

/** Colección (línea). Cada una tiene su bloque en la portada: hero + 4 piezas + botones Mujer/Hombre. */
export interface Line { slug: string; name: string; eyebrow: string; title: string; image?: string; background: string }

export const CURRENCY = "$";

/** PORTADA. `image` vacío → se muestra el monograma de la casa. */
export const hero = {
  image: "",
  eyebrow: "Nueva colección",
  title: "Collezione Autunno–Inverno: el Monogramma",
  cta: "Descubrir la colección",
  href: "/linea/monogramma",
};

export const lines: Line[] = [
  { slug: "monogramma", name: "Monogramma", eyebrow: "La lona de la casa", title: "Monogramma: la firma en cada pieza", background: "radial-gradient(120% 90% at 70% 25%, #4a3324 0%, #241812 60%, #140e0b 100%)" },
  { slug: "notte", name: "Notte", eyebrow: "Colección de noche", title: "Notte: negro, burdeos y oro", background: "radial-gradient(120% 90% at 30% 20%, #5a1e25 0%, #241013 60%, #0e0809 100%)" },
  { slug: "riviera", name: "Riviera", eyebrow: "Colección de verano", title: "Riviera: la luz de la costa", background: "radial-gradient(120% 90% at 60% 20%, #8fb0ba 0%, #557a87 60%, #2f4c57 100%)" },
];

export const categories: Category[] = [
  { slug: "bolsos", name: "Bolsos", editorial: { title: "Hecho a mano, pieza a pieza", text: "Cada bolso pasa por las manos de un solo artesano.", background: "linear-gradient(160deg, #cfe0ea, #eef4f7)", position: 3 } },
  { slug: "carteras", name: "Carteras", editorial: { title: "Pequeña marroquinería", text: "El Monogramma, en formato de bolsillo.", background: "linear-gradient(160deg, #4a3324, #1d1512)", dark: true, position: 3 } },
  { slug: "pret-a-porter", name: "Prêt-à-porter" },
  { slug: "calzado", name: "Calzado" },
  { slug: "accesorios", name: "Accesorios", editorial: { title: "El detalle que firma", background: "linear-gradient(160deg, #e9dfcd, #f6f1e7)", position: 2 } },
  { slug: "relojeria", name: "Relojería" },
  { slug: "joyeria", name: "Joyería" },
  { slug: "fragancias", name: "Fragancias" },
];

// ── Paleta de la casa ──
const NERO = { name: "Nero", hex: "#1b1917" };
const COGNAC = { name: "Cognac", hex: "#9a5b2e" };
const AVORIO = { name: "Avorio", hex: "#efe7d8" };
const BORDEAUX = { name: "Bordeaux", hex: "#5a1a20" };
const SABBIA = { name: "Sabbia", hex: "#d9c7a6" };
const BLU = { name: "Blu notte", hex: "#1f2a44" };
const SALVIA = { name: "Salvia", hex: "#9aa58a" };
const ROSA = { name: "Rosa", hex: "#e6c3c0" };
const ORO = { name: "Oro", hex: "#c9ab72" };
const ARGENTO = { name: "Argento", hex: "#c9c9c7" };
const MONO_EBANO = { name: "Monogramma Ebano", hex: "#3b2a20", monogram: true };
const MONO_AVORIO = { name: "Monogramma Avorio", hex: "#f3eee4", monogram: true };
const MONO_BLU = { name: "Monogramma Blu", hex: "#1f2a44", monogram: true };

const SHOES_M = ["39", "40", "41", "42", "43", "44", "45"];
const SHOES_W = ["35", "36", "37", "38", "39", "40", "41"];
const RINGS = ["48", "50", "52", "54", "56", "58"];

export const products: Product[] = [
  // ── Monogramma ──
  {
    id: "cabas-monogramma", name: "Cabas Monogramma", category: "bolsos", line: "monogramma", gender: "mujer", price: 14200, art: "tote", isNew: true, big: true,
    description: "Un cabas amplio y ligero en la lona Monogramma de la casa: la SN, el diamante, la estrella y la nudillera estampados en oro. Ribetes de piel natural que se patinan con el tiempo.",
    details: ["Lona Monogramma y piel vaquetilla", "Bolsillo interior con cremallera", "38 × 30 × 15 cm"],
    colors: [MONO_EBANO, MONO_AVORIO],
  },
  {
    id: "borsa-sessanta", name: "Borsa Sessanta", category: "bolsos", line: "monogramma", gender: "mujer", price: 19800, art: "bag", isNew: true,
    description: "Bolso de mano estructurado en lona Monogramma con asa rígida y cierre de latón pulido a mano.",
    details: ["Lona Monogramma", "Herrajes de latón bañado en oro", "Forro de ante", "28 × 20 × 11 cm"],
    colors: [MONO_EBANO, MONO_BLU, MONO_AVORIO],
  },
  {
    id: "malle-sessanta", name: "Malle Sessanta", category: "bolsos", line: "monogramma", gender: "unisex", price: 64000, art: "trunk",
    description: "Baúl de viaje construido por encargo. Estructura de álamo, cantoneras de latón y cerradura numerada.",
    details: ["Fabricación bajo pedido", "Cerradura con número de serie", "Interior acolchado en ante", "60 × 40 × 35 cm"],
    colors: [MONO_EBANO],
  },
  {
    id: "portafoglio-monogramma", name: "Portafoglio Monogramma", category: "carteras", line: "monogramma", gender: "mujer", price: 4600, art: "wallet", isNew: true, big: true,
    description: "Cartera continental en lona Monogramma con doce ranuras y monedero con cremallera.",
    details: ["Lona Monogramma", "12 ranuras para tarjetas", "19 × 10 cm"],
    colors: [MONO_EBANO, MONO_AVORIO, MONO_BLU],
  },
  {
    id: "portacarte-monogramma", name: "Portacarte Monogramma", category: "carteras", line: "monogramma", gender: "hombre", price: 2400, art: "wallet", isNew: true,
    description: "Tarjetero plano de seis ranuras en lona Monogramma.",
    details: ["Lona Monogramma", "6 ranuras", "11 × 8 cm"],
    colors: [MONO_EBANO, MONO_BLU],
  },
  {
    id: "cintura-sessanta", name: "Cintura Sessanta", category: "accesorios", line: "monogramma", gender: "hombre", price: 3400, art: "belt",
    description: "Cinturón reversible con hebilla SN en latón cepillado.",
    details: ["Lona Monogramma / piel lisa", "Hebilla de latón", "Ancho 35 mm"],
    colors: [MONO_EBANO, NERO], sizes: ["80", "85", "90", "95", "100"],
  },
  {
    id: "foulard-monogramma", name: "Foulard Monogramma", category: "accesorios", line: "monogramma", gender: "mujer", price: 2900, art: "scarf", isNew: true,
    description: "Carré de sarga de seda con el Monogramma estampado a mano y bordes enrollados.",
    details: ["100 % sarga de seda", "90 × 90 cm", "Bordes enrollados a mano"],
    colors: [MONO_AVORIO, MONO_BLU, MONO_EBANO],
  },
  // ── Notte ──
  {
    id: "borsa-notte", name: "Borsa Notte", category: "bolsos", line: "notte", gender: "mujer", price: 18500, art: "bag", isNew: true,
    description: "El bolso insignia de la Maison. Piel de becerro de grano fino, asa rígida y cierre de latón pulido a mano.",
    details: ["Piel de becerro italiana", "Herrajes de latón bañado en oro", "Forro de ante", "28 × 20 × 11 cm"],
    colors: [NERO, BORDEAUX, COGNAC],
  },
  {
    id: "portafoglio-uno", name: "Portafoglio Uno", category: "carteras", line: "notte", gender: "mujer", price: 4200, art: "wallet",
    description: "Cartera continental con doce ranuras, monedero con cremallera y la firma SN grabada en seco.",
    details: ["Piel de grano saffiano", "12 ranuras para tarjetas", "19 × 10 cm"],
    colors: [NERO, BORDEAUX, COGNAC],
  },
  {
    id: "giacca-milano", name: "Giacca Milano", category: "pret-a-porter", line: "notte", gender: "hombre", price: 22800, art: "blazer", isNew: true, big: true,
    description: "Americana cruzada de lana fría con hombro natural. Cortada y entretelada a mano en nuestro atelier.",
    details: ["100 % lana virgen", "Forro de cupro", "Botones de cuerno"],
    colors: [NERO, BLU], sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "abito-sera", name: "Abito Sera", category: "pret-a-porter", line: "notte", gender: "mujer", price: 31500, art: "dress",
    description: "Vestido de noche en satén de seda con caída al bies y espalda descubierta.",
    details: ["Satén de seda", "Corte al bies", "Cremallera invisible lateral"],
    colors: [NERO, BORDEAUX], sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "decollete-luna", name: "Décolleté Luna", category: "calzado", line: "notte", gender: "mujer", price: 9600, art: "heel", big: true,
    description: "Salón de punta afilada con tacón de aguja de 95 mm y plantilla acolchada.",
    details: ["Charol italiano", "Tacón de 95 mm", "Suela de cuero"],
    colors: [NERO, BORDEAUX, ROSA], sizes: SHOES_W,
  },
  {
    id: "orologio-tempo", name: "Orologio Tempo", category: "relojeria", line: "notte", gender: "hombre", price: 48000, art: "watch", big: true,
    description: "Reloj automático de caja fina en oro de 18 quilates, esfera lacada y correa de aligátor.",
    details: ["Movimiento automático", "Caja de 38 mm", "Edición numerada"],
    colors: [ORO, ARGENTO],
  },
  {
    id: "anello-promessa", name: "Anello Promessa", category: "joyeria", line: "notte", gender: "mujer", price: 27500, art: "ring", big: true,
    description: "Solitario con diamante talla brillante engastado a cuatro garras.",
    details: ["Oro de 18 qt", "Diamante talla brillante", "Grabado interior de cortesía"],
    colors: [{ name: "Oro bianco", hex: "#d8d8d6" }, ORO], sizes: RINGS,
  },
  {
    id: "extrait-notte-69", name: "Extrait Notte 69", category: "fragancias", line: "notte", gender: "unisex", price: 2600, art: "perfume", big: true,
    description: "Extracto de perfume. Iris, cuero y ámbar sobre un fondo de madera de oud.",
    details: ["Extrait de parfum", "100 ml", "Frasco recargable en boutique"],
    colors: [{ name: "Ambra", hex: "#b9762f" }],
  },
  // ── Riviera ──
  {
    id: "cabas-riviera", name: "Cabas Riviera", category: "bolsos", line: "riviera", gender: "mujer", price: 12600, art: "tote",
    description: "Un cabas de lona encerada para los días de costa, con ribetes de piel natural.",
    details: ["Lona encerada y piel vaquetilla", "Bolsillo interior con cremallera", "38 × 30 × 15 cm"],
    colors: [SABBIA, AVORIO, SALVIA],
  },
  {
    id: "portacarte-riviera", name: "Portacarte Riviera", category: "carteras", line: "riviera", gender: "hombre", price: 2100, art: "wallet",
    description: "Tarjetero de piel granulada en los tonos de la costa.",
    details: ["Piel de grano", "6 ranuras", "11 × 8 cm"],
    colors: [SABBIA, BLU, SALVIA],
  },
  {
    id: "giacca-riviera", name: "Giacca Riviera", category: "pret-a-porter", line: "riviera", gender: "mujer", price: 19400, art: "blazer",
    description: "Americana desestructurada de lino y seda, ligera como una camisa.",
    details: ["Lino y seda", "Sin forro", "Botones de nácar"],
    colors: [AVORIO, SALVIA, ROSA], sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "abito-riviera", name: "Abito Riviera", category: "pret-a-porter", line: "riviera", gender: "mujer", price: 16800, art: "dress", isNew: true,
    description: "Vestido de popelín de algodón con tirante fino y falda evasé.",
    details: ["Popelín de algodón", "Forro de voile", "Cremallera invisible"],
    colors: [AVORIO, ROSA, SABBIA], sizes: ["XS", "S", "M", "L"],
  },
  {
    id: "mocassino-conte", name: "Mocassino Conte", category: "calzado", line: "riviera", gender: "hombre", price: 8900, art: "loafer",
    description: "Mocasín de antifaz cosido a mano, suela de cuero y horma italiana.",
    details: ["Piel de becerro pulida", "Suela de cuero cosida Blake", "Hecho a mano"],
    colors: [COGNAC, NERO, SABBIA], sizes: SHOES_M,
  },
  {
    id: "occhiali-capri", name: "Occhiali Capri", category: "accesorios", line: "riviera", gender: "unisex", price: 3800, art: "sunglasses",
    description: "Gafas de sol de acetato pulido con lentes minerales y varillas con la firma grabada.",
    details: ["Acetato italiano", "Lentes minerales con protección UV", "Incluye estuche de piel"],
    colors: [{ name: "Havana", hex: "#6b4423" }, NERO],
  },
  {
    id: "orologio-riviera", name: "Orologio Riviera", category: "relojeria", line: "riviera", gender: "mujer", price: 36500, art: "watch", isNew: true,
    description: "Reloj de 32 mm con esfera de nácar y correa de piel intercambiable.",
    details: ["Movimiento de cuarzo", "Caja de 32 mm", "Esfera de nácar"],
    colors: [ORO, ROSA, ARGENTO],
  },
  {
    id: "anello-sigillo", name: "Anello Sigillo", category: "joyeria", line: "riviera", gender: "hombre", price: 9800, art: "ring",
    description: "Sello con la SN grabada a buril sobre oro macizo.",
    details: ["Oro de 18 qt", "Grabado a buril", "Personalizable por encargo"],
    colors: [ORO, ARGENTO], sizes: RINGS,
  },
  {
    id: "eau-riviera", name: "Eau Riviera", category: "fragancias", line: "riviera", gender: "unisex", price: 1900, art: "perfume", isNew: true,
    description: "Agua de perfume. Bergamota, sal marina y flor de azahar.",
    details: ["Eau de parfum", "100 ml", "Frasco recargable en boutique"],
    colors: [{ name: "Acqua", hex: "#bcd3d6" }, ROSA],
  },
];

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
