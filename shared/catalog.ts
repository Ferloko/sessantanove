/**
 * CATÁLOGO DE SESSANTA NOVE
 * ─────────────────────────
 * Este archivo es la única fuente de verdad de productos y precios: lo usan la web
 * y el servidor (que recalcula el total antes de cobrar, así nadie puede manipular precios).
 *
 * Para añadir un producto, copia un bloque de `products` y cambia los datos.
 *  - `price`  → dólares del juego, entero, sin decimales.
 *  - `image`  → opcional. Ruta a una foto en /public/images (p. ej. "/images/borsa-notte.jpg").
 *               Si no hay foto se muestra la ilustración indicada en `art`.
 *  - `tone`   → color de fondo de la lámina; "monogram" pone el monograma de la casa en oro.
 *  - `options`→ opcional. Colores o tallas entre los que elige el cliente.
 */

export type ArtKind =
  | "bag" | "tote" | "wallet" | "sunglasses" | "watch" | "scarf" | "loafer" | "heel"
  | "perfume" | "belt" | "blazer" | "dress" | "ring" | "trunk";

export type Tone = "sand" | "stone" | "blush" | "sage" | "ink" | "bordeaux" | "monogram";

export interface Category {
  slug: string;
  name: string;
  tagline: string;
  art: ArtKind;
  tone: Tone;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  art: ArtKind;
  tone: Tone;
  image?: string;
  isNew?: boolean;
  description: string;
  details: string[];
  options?: { label: string; values: string[] };
}

export const CURRENCY = "$";

/**
 * PORTADA. Para poner una foto a pantalla completa (p. ej. una captura del juego), guárdala en
 * /public/images y escribe su ruta en `image` ("/images/portada.jpg"). Sin foto se muestra el monograma.
 */
export const hero = {
  image: "",
  eyebrow: "Nueva colección",
  title: "Collezione Autunno–Inverno: el Monogramma",
  cta: "Descubrir la colección",
  href: "/coleccion",
};

export const categories: Category[] = [
  { slug: "bolsos", name: "Bolsos", tagline: "Marroquinería hecha a mano", art: "bag", tone: "monogram" },
  { slug: "pret-a-porter", name: "Prêt-à-porter", tagline: "Sastrería de temporada", art: "blazer", tone: "stone" },
  { slug: "calzado", name: "Calzado", tagline: "Del atelier a la calle", art: "loafer", tone: "sage" },
  { slug: "accesorios", name: "Accesorios", tagline: "El detalle que firma", art: "sunglasses", tone: "blush" },
  { slug: "joyeria", name: "Relojería y joyería", tagline: "Piezas numeradas", art: "watch", tone: "ink" },
  { slug: "fragancias", name: "Fragancias", tagline: "Les Extraits", art: "perfume", tone: "bordeaux" },
];

export const products: Product[] = [
  {
    id: "borsa-notte", name: "Borsa Notte", category: "bolsos", price: 18500, art: "bag", tone: "sand", isNew: true,
    description: "El bolso insignia de la Maison. Piel de becerro de grano fino, asa rígida y cierre de latón pulido a mano.",
    details: ["Piel de becerro italiana", "Herrajes de latón bañado en oro", "Forro de ante", "28 × 20 × 11 cm"],
    options: { label: "Color", values: ["Nero", "Cognac", "Avorio"] },
  },
  {
    id: "cabas-monogramma", name: "Cabas Monogramma", category: "bolsos", price: 14200, art: "tote", tone: "monogram", isNew: true,
    description: "Un cabas amplio y ligero en la lona Monogramma de la casa: la SN, el diamante, la estrella y la nudillera estampados en oro.",
    details: ["Lona Monogramma y piel vaquetilla", "Bolsillo interior con cremallera", "38 × 30 × 15 cm"],
    options: { label: "Color", values: ["Avorio e oro", "Nero e oro"] },
  },
  {
    id: "malle-sessanta", name: "Malle Sessanta", category: "bolsos", price: 64000, art: "trunk", tone: "ink", isNew: true,
    description: "Baúl de viaje construido por encargo. Estructura de álamo, cantoneras de latón y cerradura numerada.",
    details: ["Fabricación bajo pedido", "Cerradura con número de serie", "Interior acolchado en ante", "60 × 40 × 35 cm"],
  },
  {
    id: "portafoglio-uno", name: "Portafoglio Uno", category: "bolsos", price: 4200, art: "wallet", tone: "blush",
    description: "Cartera continental con doce ranuras, monedero con cremallera y la firma 69 grabada en seco.",
    details: ["Piel de grano saffiano", "12 ranuras para tarjetas", "19 × 10 cm"],
    options: { label: "Color", values: ["Nero", "Bordeaux", "Cognac"] },
  },
  {
    id: "giacca-milano", name: "Giacca Milano", category: "pret-a-porter", price: 22800, art: "blazer", tone: "stone", isNew: true,
    description: "Americana cruzada de lana fría con hombro natural. Cortada y entretelada a mano en nuestro atelier.",
    details: ["100 % lana virgen", "Forro de cupro", "Botones de cuerno"],
    options: { label: "Talla", values: ["XS", "S", "M", "L", "XL"] },
  },
  {
    id: "abito-sera", name: "Abito Sera", category: "pret-a-porter", price: 31500, art: "dress", tone: "bordeaux",
    description: "Vestido de noche en satén de seda con caída al bies y espalda descubierta.",
    details: ["Satén de seda", "Corte al bies", "Cremallera invisible lateral"],
    options: { label: "Talla", values: ["XS", "S", "M", "L"] },
  },
  {
    id: "mocassino-conte", name: "Mocassino Conte", category: "calzado", price: 8900, art: "loafer", tone: "sage",
    description: "Mocasín de antifaz cosido a mano, suela de cuero y horma italiana.",
    details: ["Piel de becerro pulida", "Suela de cuero cosida Blake", "Hecho a mano"],
    options: { label: "Talla", values: ["39", "40", "41", "42", "43", "44", "45"] },
  },
  {
    id: "decollete-luna", name: "Décolleté Luna", category: "calzado", price: 9600, art: "heel", tone: "blush",
    description: "Salón de punta afilada con tacón de aguja de 95 mm y plantilla acolchada.",
    details: ["Charol italiano", "Tacón de 95 mm", "Suela de cuero"],
    options: { label: "Talla", values: ["35", "36", "37", "38", "39", "40", "41"] },
  },
  {
    id: "occhiali-capri", name: "Occhiali Capri", category: "accesorios", price: 3800, art: "sunglasses", tone: "sand",
    description: "Gafas de sol de acetato pulido con lentes minerales y varillas con la firma grabada.",
    details: ["Acetato italiano", "Lentes minerales con protección UV", "Incluye estuche de piel"],
    options: { label: "Color", values: ["Havana", "Nero"] },
  },
  {
    id: "foulard-giardino", name: "Foulard Giardino", category: "accesorios", price: 2900, art: "scarf", tone: "sage", isNew: true,
    description: "Carré de sarga de seda estampado a mano con bordes enrollados.",
    details: ["100 % sarga de seda", "90 × 90 cm", "Bordes enrollados a mano"],
    options: { label: "Color", values: ["Verde salvia", "Bordeaux", "Blu notte"] },
  },
  {
    id: "cintura-sessanta", name: "Cintura Sessanta", category: "accesorios", price: 3400, art: "belt", tone: "stone",
    description: "Cinturón reversible con hebilla 69 en latón cepillado.",
    details: ["Piel reversible negro / cognac", "Hebilla de latón", "Ancho 35 mm"],
    options: { label: "Talla", values: ["80", "85", "90", "95", "100"] },
  },
  {
    id: "orologio-tempo", name: "Orologio Tempo", category: "joyeria", price: 48000, art: "watch", tone: "ink",
    description: "Reloj automático de caja fina en oro de 18 quilates, esfera lacada y correa de aligátor.",
    details: ["Movimiento automático", "Caja de 38 mm en oro de 18 qt", "Edición numerada"],
  },
  {
    id: "anello-promessa", name: "Anello Promessa", category: "joyeria", price: 27500, art: "ring", tone: "blush",
    description: "Solitario en oro blanco con diamante talla brillante engastado a cuatro garras.",
    details: ["Oro blanco de 18 qt", "Diamante talla brillante", "Grabado interior de cortesía"],
    options: { label: "Talla", values: ["48", "50", "52", "54", "56", "58"] },
  },
  {
    id: "extrait-notte-69", name: "Extrait Notte 69", category: "fragancias", price: 2600, art: "perfume", tone: "bordeaux",
    description: "Extracto de perfume. Iris, cuero y ámbar sobre un fondo de madera de oud.",
    details: ["Extrait de parfum", "100 ml", "Frasco recargable en boutique"],
  },
];

export const getProduct = (id: string) => products.find((product) => product.id === id);
export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);

/** $18.500 — separador de miles con punto, sin decimales. */
export function formatPrice(amount: number): string {
  return `${CURRENCY}${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export const DELIVERY_METHODS = [
  { id: "boutique", label: "Recogida en boutique", note: "Te avisamos cuando tu pedido esté preparado." },
  { id: "domicilio", label: "Entrega a domicilio", note: "Un asesor concertará la entrega contigo." },
] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]["id"];

export interface OrderItemInput { id: string; option?: string; qty: number }
export interface CustomerInput { name: string; phone: string; delivery: DeliveryMethod; address?: string; notes?: string }
