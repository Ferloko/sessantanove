/**
 * CONTENIDO INICIAL DE LA TIENDA
 * ──────────────────────────────
 * Es lo que se muestra mientras no se publique nada desde el modo Creador (/atelier). Una vez publicado,
 * manda el contenido guardado en Supabase y este archivo queda como respaldo.
 *
 * El orden de los productos dentro de cada categoría es el orden de su cuadrícula; `big: true` hace que
 * la pieza ocupe 2×2 y los bloques `editorials` se intercalan en la posición indicada.
 */
import type { ArtKind, Category, Content, Gender, Line, Product, ProductColor } from "./catalog.js";

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
const ACQUA = { name: "Acqua", hex: "#bcd3d6" };
const AMBRA = { name: "Ambra", hex: "#b9762f" };
const HAVANA = { name: "Havana", hex: "#6b4423" };
const BIANCO = { name: "Bianco", hex: "#f7f5f0" };
const M_EBANO = { name: "Monogramma Ebano", hex: "#3b2a20", monogram: true };
const M_AVORIO = { name: "Monogramma Avorio", hex: "#f3eee4", monogram: true };
const M_BLU = { name: "Monogramma Blu", hex: "#1f2a44", monogram: true };

const CLOTHES = ["XS", "S", "M", "L", "XL"];
const SHOES_M = ["39", "40", "41", "42", "43", "44", "45"];
const SHOES_W = ["35", "36", "37", "38", "39", "40", "41"];
const SHOES_U = ["36", "37", "38", "39", "40", "41", "42", "43", "44"];
const RINGS = ["48", "50", "52", "54", "56", "58"];
const BELTS = ["80", "85", "90", "95", "100"];

type Extra = Partial<Pick<Product, "isNew" | "big" | "sizes">>;
/** Atajo para escribir productos en una línea. */
const item = (
  category: string, id: string, name: string, line: string, gender: Gender, price: number, art: ArtKind,
  colors: ProductColor[], description: string, details: string[], extra: Extra = {},
): Product => ({ id, name, category, line, gender, price, art, colors, description, details, ...extra });

const lines: Line[] = [
  { slug: "monogramma", name: "Monogramma", eyebrow: "La lona de la casa", title: "Monogramma: la firma en cada pieza", background: "radial-gradient(120% 90% at 70% 25%, #4a3324 0%, #241812 60%, #140e0b 100%)" },
  { slug: "notte", name: "Notte", eyebrow: "Colección de noche", title: "Notte: negro, burdeos y oro", background: "radial-gradient(120% 90% at 30% 20%, #5a1e25 0%, #241013 60%, #0e0809 100%)" },
  { slug: "riviera", name: "Riviera", eyebrow: "Colección de verano", title: "Riviera: la luz de la costa", background: "radial-gradient(120% 90% at 60% 20%, #8fb0ba 0%, #557a87 60%, #2f4c57 100%)" },
];

const categories: Category[] = [
  { slug: "bolsos", name: "Bolsos", editorials: [{ title: "Hecho a mano, pieza a pieza", text: "Cada bolso pasa por las manos de un solo artesano.", background: "linear-gradient(160deg, #cfe0ea, #eef4f7)", position: 3 }] },
  { slug: "carteras", name: "Carteras", editorials: [{ title: "Pequeña marroquinería", text: "El Monogramma, en formato de bolsillo.", background: "linear-gradient(160deg, #4a3324, #1d1512)", dark: true, position: 0 }] },
  { slug: "pret-a-porter", name: "Prêt-à-porter" },
  { slug: "calzado", name: "Calzado", editorials: [
    { title: "Del atelier a la calle", background: "linear-gradient(160deg, #dfe3d8, #f3f5ee)", position: 2 },
    { title: "Cosido a mano", text: "Hormas italianas, suelas de cuero.", background: "linear-gradient(160deg, #1c1917, #3a332d)", dark: true, position: 6 },
  ] },
  { slug: "accesorios", name: "Accesorios", editorials: [{ title: "El detalle que firma", background: "linear-gradient(160deg, #e9dfcd, #f6f1e7)", position: 2 }] },
  { slug: "relojeria", name: "Relojería", editorials: [{ title: "El tiempo, a mano", text: "Movimientos montados en nuestro taller.", background: "linear-gradient(160deg, #1c1917, #3a332d)", dark: true, position: 5 }] },
  { slug: "joyeria", name: "Joyería" },
  { slug: "fragancias", name: "Fragancias", editorials: [{ title: "Les Extraits", text: "Ocho fragancias, una sola firma.", background: "linear-gradient(160deg, #4a161b, #1e0f11)", dark: true, position: 4 }] },
];

const products: Product[] = [
  // ── BOLSOS · grande al principio, editorial tras la 3.ª, grande al final ──
  item("bolsos", "cabas-monogramma", "Cabas Monogramma", "monogramma", "mujer", 14200, "tote", [M_EBANO, M_AVORIO],
    "Un cabas amplio y ligero en la lona Monogramma de la casa: la SN, el diamante, la estrella y la nudillera estampados en oro. Ribetes de piel natural que se patinan con el tiempo.",
    ["Lona Monogramma y piel vaquetilla", "Bolsillo interior con cremallera", "38 × 30 × 15 cm"], { isNew: true, big: true }),
  item("bolsos", "borsa-sessanta", "Borsa Sessanta", "monogramma", "mujer", 19800, "bag", [M_EBANO, M_BLU, M_AVORIO],
    "Bolso de mano estructurado en lona Monogramma con asa rígida y cierre de latón pulido a mano.",
    ["Lona Monogramma", "Herrajes de latón bañado en oro", "28 × 20 × 11 cm"], { isNew: true }),
  item("bolsos", "malle-sessanta", "Malle Sessanta", "monogramma", "unisex", 64000, "trunk", [M_EBANO],
    "Baúl de viaje construido por encargo. Estructura de álamo, cantoneras de latón y cerradura numerada.",
    ["Fabricación bajo pedido", "Cerradura con número de serie", "60 × 40 × 35 cm"]),
  item("bolsos", "borsa-notte", "Borsa Notte", "notte", "mujer", 18500, "bag", [NERO, BORDEAUX, COGNAC],
    "El bolso insignia de la Maison. Piel de becerro de grano fino, asa rígida y cierre de latón pulido a mano.",
    ["Piel de becerro italiana", "Forro de ante", "28 × 20 × 11 cm"], { isNew: true }),
  item("bolsos", "pochette-sera", "Pochette Sera", "notte", "mujer", 7800, "clutch", [NERO, BORDEAUX, ORO],
    "Bolso de noche en satén con solapa y broche joya.", ["Satén de seda", "Broche de latón dorado", "22 × 12 cm"]),
  item("bolsos", "cabas-riviera", "Cabas Riviera", "riviera", "mujer", 12600, "tote", [SABBIA, AVORIO, SALVIA],
    "Un cabas de lona encerada para los días de costa, con ribetes de piel natural.",
    ["Lona encerada y piel vaquetilla", "38 × 30 × 15 cm"]),
  item("bolsos", "borsa-capri", "Borsa Capri", "riviera", "mujer", 15400, "bag", [ACQUA, ROSA, AVORIO],
    "Bolso de mano en piel granulada de colores claros con asa trenzada.", ["Piel de grano", "Asa trenzada a mano", "26 × 19 × 10 cm"], { isNew: true }),
  item("bolsos", "valigia-riviera", "Valigia Riviera", "riviera", "unisex", 38500, "trunk", [SABBIA, BLU],
    "Maleta rígida de cabina forrada en lona con cantoneras de piel.", ["Estructura ligera de álamo", "Cerradura de combinación", "55 × 38 × 20 cm"], { big: true }),
  item("bolsos", "borsa-luna", "Borsa Luna", "notte", "mujer", 16900, "bag", [BORDEAUX, NERO, ORO],
    "Bolso de media luna en piel acolchada con cadena dorada.", ["Piel de cordero acolchada", "Cadena desmontable", "24 × 16 × 8 cm"]),
  item("bolsos", "pochette-capri", "Pochette Capri", "riviera", "mujer", 6900, "clutch", [ROSA, ACQUA, SABBIA],
    "Pochette de rafia y piel para las noches de verano.", ["Rafia tejida a mano y piel", "22 × 12 cm"], { isNew: true }),

  // ── CARTERAS · editorial al principio, grande en medio ──
  item("carteras", "portacarte-monogramma", "Portacarte Monogramma", "monogramma", "hombre", 2400, "cardholder", [M_EBANO, M_BLU],
    "Tarjetero plano de seis ranuras en lona Monogramma.", ["Lona Monogramma", "6 ranuras", "11 × 8 cm"], { isNew: true }),
  item("carteras", "pochette-monogramma", "Pochette Monogramma", "monogramma", "mujer", 5200, "clutch", [M_EBANO, M_AVORIO],
    "Pochette con solapa y cadena desmontable en lona Monogramma.", ["Lona Monogramma", "Cadena desmontable", "20 × 12 cm"], { isNew: true }),
  item("carteras", "portafoglio-uno", "Portafoglio Uno", "notte", "mujer", 4200, "wallet", [NERO, BORDEAUX, COGNAC],
    "Cartera continental con doce ranuras, monedero con cremallera y la firma SN grabada en seco.",
    ["Piel de grano saffiano", "12 ranuras para tarjetas", "19 × 10 cm"]),
  item("carteras", "portacarte-notte", "Portacarte Notte", "notte", "hombre", 2200, "cardholder", [NERO, BORDEAUX],
    "Tarjetero de piel lisa con canto pintado a mano.", ["Piel de becerro", "4 ranuras", "10 × 7 cm"]),
  item("carteras", "portafoglio-monogramma", "Portafoglio Monogramma", "monogramma", "mujer", 4600, "wallet", [M_EBANO, M_AVORIO, M_BLU],
    "Cartera continental en lona Monogramma con doce ranuras y monedero con cremallera.",
    ["Lona Monogramma", "12 ranuras para tarjetas", "19 × 10 cm"], { isNew: true, big: true }),
  item("carteras", "pochette-luna", "Pochette Luna", "notte", "mujer", 4900, "clutch", [NERO, ORO, ROSA],
    "Pochette rígida de noche con cierre de presión.", ["Piel metalizada", "Forro de ante", "18 × 10 cm"]),
  item("carteras", "portacarte-riviera", "Portacarte Riviera", "riviera", "hombre", 2100, "cardholder", [SABBIA, BLU, SALVIA],
    "Tarjetero de piel granulada en los tonos de la costa.", ["Piel de grano", "6 ranuras", "11 × 8 cm"]),
  item("carteras", "portafoglio-riviera", "Portafoglio Riviera", "riviera", "mujer", 3900, "wallet", [ACQUA, ROSA, AVORIO],
    "Cartera compacta con cierre de cremallera en piel granulada.", ["Piel de grano", "8 ranuras", "14 × 10 cm"], { isNew: true }),
  item("carteras", "portafoglio-conte", "Portafoglio Conte", "notte", "hombre", 3600, "wallet", [NERO, COGNAC, BLU],
    "Billetero plegable de ocho ranuras con forro de piel.", ["Piel de becerro", "8 ranuras y dos compartimentos", "11 × 9 cm"]),

  // ── PRÊT-À-PORTER · dos piezas grandes, sin editorial ──
  item("pret-a-porter", "giacca-milano", "Giacca Milano", "notte", "hombre", 22800, "blazer", [NERO, BLU],
    "Americana cruzada de lana fría con hombro natural. Cortada y entretelada a mano en nuestro atelier.",
    ["100 % lana virgen", "Forro de cupro", "Botones de cuerno"], { isNew: true, big: true, sizes: CLOTHES }),
  item("pret-a-porter", "abito-sera", "Abito Sera", "notte", "mujer", 31500, "dress", [NERO, BORDEAUX],
    "Vestido de noche en satén de seda con caída al bies y espalda descubierta.", ["Satén de seda", "Corte al bies"], { sizes: CLOTHES }),
  item("pret-a-porter", "cappotto-notte", "Cappotto Notte", "notte", "hombre", 38000, "coat", [NERO, BLU, COGNAC],
    "Abrigo largo de cachemir doble faz con cinturón.", ["100 % cachemir", "Doble faz cosido a mano"], { sizes: CLOTHES }),
  item("pret-a-porter", "camicia-seta", "Camicia Seta", "notte", "mujer", 8600, "shirt", [AVORIO, NERO, BORDEAUX],
    "Camisa de crepé de seda con puños dobles.", ["Crepé de seda", "Botones de nácar"], { sizes: CLOTHES }),
  item("pret-a-porter", "giacca-riviera", "Giacca Riviera", "riviera", "mujer", 19400, "blazer", [AVORIO, SALVIA, ROSA],
    "Americana desestructurada de lino y seda, ligera como una camisa.", ["Lino y seda", "Sin forro"], { sizes: CLOTHES }),
  item("pret-a-porter", "cappotto-monogramma", "Cappotto Monogramma", "monogramma", "mujer", 46000, "coat", [M_EBANO, M_AVORIO],
    "Abrigo en jacquard Monogramma tejido en lana y seda.", ["Jacquard de lana y seda", "Forro de cupro"], { isNew: true, big: true, sizes: CLOTHES }),
  item("pret-a-porter", "abito-riviera", "Abito Riviera", "riviera", "mujer", 16800, "dress", [AVORIO, ROSA, SABBIA],
    "Vestido de popelín de algodón con tirante fino y falda evasé.", ["Popelín de algodón", "Forro de voile"], { isNew: true, sizes: CLOTHES }),
  item("pret-a-porter", "camicia-riviera", "Camicia Riviera", "riviera", "hombre", 6400, "shirt", [BIANCO, ACQUA, SABBIA],
    "Camisa de lino lavado con cuello abierto.", ["100 % lino", "Botones de nácar"], { sizes: CLOTHES }),
  item("pret-a-porter", "camicia-monogramma", "Camicia Monogramma", "monogramma", "unisex", 9800, "shirt", [M_BLU, M_AVORIO],
    "Camisa de sarga de seda con el Monogramma estampado.", ["Sarga de seda", "Corte holgado"], { sizes: CLOTHES }),
  item("pret-a-porter", "abito-monogramma", "Abito Monogramma", "monogramma", "mujer", 27500, "dress", [M_BLU, M_EBANO],
    "Vestido camisero en sarga de seda con el Monogramma estampado.", ["Sarga de seda", "Cinturón desmontable"], { isNew: true, sizes: CLOTHES }),

  // ── CALZADO · sin piezas grandes, dos bloques editoriales ──
  item("calzado", "stivaletto-notte", "Stivaletto Notte", "notte", "mujer", 12400, "boot", [NERO, BORDEAUX],
    "Botín de piel lisa con tacón cubano y cremallera interior.", ["Piel de becerro", "Tacón de 60 mm"], { sizes: SHOES_W }),
  item("calzado", "mocassino-notte", "Mocassino Notte", "notte", "hombre", 9200, "loafer", [NERO, BORDEAUX],
    "Mocasín de charol para la noche, suela fina de cuero.", ["Charol italiano", "Suela de cuero"], { sizes: SHOES_M }),
  item("calzado", "decollete-luna", "Décolleté Luna", "notte", "mujer", 9600, "heel", [NERO, BORDEAUX, ROSA],
    "Salón de punta afilada con tacón de aguja de 95 mm y plantilla acolchada.", ["Charol italiano", "Tacón de 95 mm"], { sizes: SHOES_W }),
  item("calzado", "sneaker-monogramma", "Sneaker Monogramma", "monogramma", "unisex", 7900, "sneaker", [M_EBANO, M_AVORIO, M_BLU],
    "Zapatilla baja en lona Monogramma con suela de goma cosida.", ["Lona Monogramma y piel", "Suela de goma cosida"], { isNew: true, sizes: SHOES_U }),
  item("calzado", "stivaletto-monogramma", "Stivaletto Monogramma", "monogramma", "mujer", 13800, "boot", [M_EBANO],
    "Botín en lona Monogramma con puntera de piel.", ["Lona Monogramma", "Tacón de 60 mm"], { isNew: true, sizes: SHOES_W }),
  item("calzado", "mocassino-conte", "Mocassino Conte", "riviera", "hombre", 8900, "loafer", [COGNAC, NERO, SABBIA],
    "Mocasín de antifaz cosido a mano, suela de cuero y horma italiana.", ["Piel de becerro pulida", "Suela cosida Blake"], { sizes: SHOES_M }),
  item("calzado", "sneaker-riviera", "Sneaker Riviera", "riviera", "unisex", 6800, "sneaker", [BIANCO, ACQUA, SABBIA],
    "Zapatilla de piel blanca con contrafuerte de color.", ["Piel de becerro", "Suela de goma"], { sizes: SHOES_U }),
  item("calzado", "decollete-riviera", "Décolleté Riviera", "riviera", "mujer", 8800, "heel", [AVORIO, ROSA, ACQUA],
    "Salón de tacón medio en piel napa de tonos claros.", ["Piel napa", "Tacón de 70 mm"], { isNew: true, sizes: SHOES_W }),

  // ── ACCESORIOS · editorial tras la 2.ª, grande al final ──
  item("accesorios", "foulard-monogramma", "Foulard Monogramma", "monogramma", "mujer", 2900, "scarf", [M_AVORIO, M_BLU, M_EBANO],
    "Carré de sarga de seda con el Monogramma estampado a mano y bordes enrollados.", ["100 % sarga de seda", "90 × 90 cm"], { isNew: true }),
  item("accesorios", "cintura-sessanta", "Cintura Sessanta", "monogramma", "hombre", 3400, "belt", [M_EBANO, NERO],
    "Cinturón reversible con hebilla SN en latón cepillado.", ["Lona Monogramma / piel lisa", "Ancho 35 mm"], { sizes: BELTS }),
  item("accesorios", "occhiali-capri", "Occhiali Capri", "riviera", "unisex", 3800, "sunglasses", [HAVANA, NERO],
    "Gafas de sol de acetato pulido con lentes minerales y varillas con la firma grabada.", ["Acetato italiano", "Protección UV"]),
  item("accesorios", "occhiali-notte", "Occhiali Notte", "notte", "mujer", 4100, "sunglasses", [NERO, BORDEAUX],
    "Gafas de ojo de gato con varillas doradas.", ["Acetato y metal dorado", "Protección UV"], { isNew: true }),
  item("accesorios", "cintura-notte", "Cintura Notte", "notte", "mujer", 2900, "belt", [NERO, BORDEAUX, ORO],
    "Cinturón fino con hebilla joya.", ["Piel de becerro", "Ancho 20 mm"], { sizes: BELTS }),
  item("accesorios", "foulard-riviera", "Foulard Riviera", "riviera", "mujer", 2600, "scarf", [ACQUA, ROSA, SABBIA],
    "Pañuelo de algodón y seda con ribete pintado a mano.", ["Algodón y seda", "70 × 70 cm"]),
  item("accesorios", "cintura-riviera", "Cintura Riviera", "riviera", "hombre", 2700, "belt", [COGNAC, SABBIA],
    "Cinturón de piel trenzada con hebilla de latón.", ["Piel trenzada a mano", "Ancho 30 mm"], { sizes: BELTS }),
  item("accesorios", "sciarpa-notte", "Sciarpa Notte", "notte", "unisex", 5400, "scarf", [NERO, BLU, BORDEAUX],
    "Bufanda de cachemir con la SN bordada tono sobre tono.", ["100 % cachemir", "180 × 35 cm"], { big: true }),
  item("accesorios", "occhiali-lido", "Occhiali Lido", "riviera", "hombre", 3600, "sunglasses", [BLU, HAVANA, SABBIA],
    "Gafas de aviador ligeras con puente doble.", ["Metal y acetato", "Protección UV"], { isNew: true }),

  // ── RELOJERÍA · grande al principio, editorial tras la 5.ª ──
  item("relojeria", "orologio-tempo", "Orologio Tempo", "notte", "hombre", 48000, "watch", [ORO, ARGENTO],
    "Reloj automático de caja fina en oro de 18 quilates, esfera lacada y correa de aligátor.", ["Movimiento automático", "Caja de 38 mm", "Edición numerada"], { big: true }),
  item("relojeria", "orologio-riviera", "Orologio Riviera", "riviera", "mujer", 36500, "watch", [ORO, ROSA, ARGENTO],
    "Reloj de 32 mm con esfera de nácar y correa de piel intercambiable.", ["Movimiento de cuarzo", "Caja de 32 mm"], { isNew: true }),
  item("relojeria", "orologio-luna", "Orologio Luna", "notte", "mujer", 41000, "watch", [NERO, ORO],
    "Reloj joya con bisel engastado y esfera de laca negra.", ["Bisel con 48 diamantes", "Caja de 30 mm"]),
  item("relojeria", "cronografo-sessanta", "Cronografo Sessanta", "monogramma", "hombre", 56000, "watch", [M_EBANO, ARGENTO],
    "Cronógrafo automático con correa en lona Monogramma.", ["Cronógrafo automático", "Caja de 41 mm"], { isNew: true }),
  item("relojeria", "orologio-monogramma", "Orologio Monogramma", "monogramma", "mujer", 33000, "watch", [M_AVORIO, M_EBANO],
    "Reloj de pulsera con esfera y correa Monogramma.", ["Movimiento de cuarzo", "Caja de 34 mm"]),
  item("relojeria", "orologio-conte", "Orologio Conte", "riviera", "hombre", 39500, "watch", [ARGENTO, BLU],
    "Reloj de vestir extraplano con esfera azul sol.", ["Movimiento de cuerda manual", "Caja de 39 mm"]),
  item("relojeria", "orologio-capri", "Orologio Capri", "riviera", "unisex", 28000, "watch", [ACQUA, SABBIA, BIANCO],
    "Reloj deportivo de 36 mm con correa de caucho.", ["Sumergible 100 m", "Caja de 36 mm"], { isNew: true }),
  item("relojeria", "orologio-notte-oro", "Orologio Notte Oro", "notte", "unisex", 72000, "watch", [ORO],
    "Pieza de alta relojería en oro macizo con calendario perpetuo.", ["Calendario perpetuo", "Serie limitada a 69 piezas"]),
  item("relojeria", "orologio-sessanta", "Orologio Sessanta", "monogramma", "unisex", 44500, "watch", [M_BLU, ORO],
    "El reloj de la casa: caja cojín y esfera con la SN a las doce.", ["Movimiento automático", "Caja de 37 mm"]),

  // ── JOYERÍA · grande en la 4.ª posición ──
  item("joyeria", "collana-luna", "Collana Luna", "notte", "mujer", 21500, "necklace", [ORO, ARGENTO],
    "Collar de cadena fina con colgante de diamante talla marquesa.", ["Oro de 18 qt", "Largo ajustable 40–45 cm"], { isNew: true }),
  item("joyeria", "bracciale-sessanta", "Bracciale Sessanta", "monogramma", "unisex", 14800, "bracelet", [ORO, ARGENTO],
    "Brazalete rígido con la SN en relieve.", ["Oro de 18 qt", "Cierre de bisagra"]),
  item("joyeria", "orecchini-notte", "Orecchini Notte", "notte", "mujer", 18200, "earrings", [ORO, NERO],
    "Pendientes de lágrima con ónix y oro.", ["Oro de 18 qt y ónix", "Cierre de presión"]),
  item("joyeria", "anello-promessa", "Anello Promessa", "notte", "mujer", 27500, "ring", [{ name: "Oro bianco", hex: "#d8d8d6" }, ORO],
    "Solitario con diamante talla brillante engastado a cuatro garras.", ["Oro de 18 qt", "Diamante talla brillante"], { big: true, sizes: RINGS }),
  item("joyeria", "anello-sigillo", "Anello Sigillo", "riviera", "hombre", 9800, "ring", [ORO, ARGENTO],
    "Sello con la SN grabada a buril sobre oro macizo.", ["Oro de 18 qt", "Grabado a buril"], { sizes: RINGS }),
  item("joyeria", "collana-riviera", "Collana Riviera", "riviera", "mujer", 12600, "necklace", [ORO, ROSA],
    "Collar con colgante de coral rosa.", ["Oro de 18 qt", "Largo 42 cm"], { isNew: true }),
  item("joyeria", "bracciale-riviera", "Bracciale Riviera", "riviera", "mujer", 8900, "bracelet", [ORO, ACQUA, ROSA],
    "Pulsera esmaltada en los colores de la costa.", ["Latón dorado y esmalte", "Cierre de bisagra"]),
  item("joyeria", "orecchini-stella", "Orecchini Stella", "monogramma", "mujer", 11400, "earrings", [ORO, ARGENTO],
    "Pendientes con la estrella del Monogramma.", ["Oro de 18 qt", "Cierre de presión"], { isNew: true }),
  item("joyeria", "anello-stella", "Anello Stella", "monogramma", "unisex", 7600, "ring", [ORO, ARGENTO],
    "Anillo fino con la estrella del Monogramma calada.", ["Oro de 18 qt", "Motivo calado"], { sizes: RINGS }),

  // ── FRAGANCIAS · grande al principio, editorial tras la 4.ª ──
  item("fragancias", "extrait-notte-69", "Extrait Notte 69", "notte", "unisex", 2600, "perfume", [AMBRA],
    "Extracto de perfume. Iris, cuero y ámbar sobre un fondo de madera de oud.", ["Extrait de parfum", "100 ml"], { big: true }),
  item("fragancias", "eau-riviera", "Eau Riviera", "riviera", "unisex", 1900, "perfume", [ACQUA, ROSA],
    "Agua de perfume. Bergamota, sal marina y flor de azahar.", ["Eau de parfum", "100 ml"], { isNew: true }),
  item("fragancias", "extrait-cuoio", "Extrait Cuoio", "monogramma", "hombre", 2800, "perfume", [COGNAC],
    "Extracto de perfume. Cuero, tabaco rubio y vainilla.", ["Extrait de parfum", "100 ml"]),
  item("fragancias", "candela-notte", "Candela Notte", "notte", "unisex", 980, "candle", [NERO, BORDEAUX],
    "Vela perfumada de incienso y ámbar.", ["Cera vegetal", "60 horas"]),
  item("fragancias", "eau-capri", "Eau Capri", "riviera", "mujer", 1800, "perfume", [ROSA, AVORIO],
    "Agua de perfume. Peonía, pera y almizcle blanco.", ["Eau de parfum", "100 ml"]),
  item("fragancias", "candela-riviera", "Candela Riviera", "riviera", "unisex", 920, "candle", [ACQUA, SABBIA],
    "Vela perfumada de higuera y sal.", ["Cera vegetal", "60 horas"], { isNew: true }),
  item("fragancias", "extrait-oro", "Extrait Oro", "notte", "mujer", 3200, "perfume", [ORO],
    "Extracto de perfume. Azafrán, rosa de Damasco y oud.", ["Extrait de parfum", "100 ml"]),
  item("fragancias", "candela-monogramma", "Candela Monogramma", "monogramma", "unisex", 1250, "candle", [M_EBANO, M_AVORIO],
    "Vela perfumada de cuero y cedro en vaso Monogramma.", ["Cera vegetal", "80 horas", "Vaso reutilizable"], { isNew: true }),
  item("fragancias", "eau-notte", "Eau Notte", "notte", "hombre", 2100, "perfume", [BLU, NERO],
    "Agua de perfume. Pimienta negra, vetiver y haba tonka.", ["Eau de parfum", "100 ml"]),
];

export const seed: Content = {
  /** PORTADA. `image` vacío → se muestra el monograma de la casa. */
  hero: { image: "", eyebrow: "Nueva colección", title: "Collezione Autunno–Inverno: el Monogramma", cta: "Descubrir la colección", href: "/linea/monogramma" },
  lines, categories, products,
};
