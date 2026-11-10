import type { ReactNode } from "react";
import { getColor, type ArtKind, type Product, type ProductColor } from "../../shared/catalog";

const ring = (cx: number, cy: number, outer: number, inner: number) => {
  const circle = (r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
  return `${circle(outer)} ${circle(inner)}`;
};

/** Ilustraciones de la casa. Se usan cuando un color no tiene fotos; se rellenan con el color elegido. */
const ART: Record<ArtKind, ReactNode> = {
  bag: (
    <>
      <path d="M74 92 Q74 48 100 48 Q126 48 126 92 H119 Q119 56 100 56 Q81 56 81 92 Z" />
      <path d="M52 92 L60 150 Q61 158 69 158 H131 Q139 158 140 150 L148 92 Z" />
      <path d="M50 92 H150 V104 Q100 122 50 104 Z" />
      <rect x="93" y="107" width="14" height="10" rx="2" />
    </>
  ),
  tote: (
    <>
      <path d="M70 84 Q70 38 87 38 Q104 38 104 84 H98 Q98 46 87 46 Q76 46 76 84 Z" />
      <path d="M96 84 Q96 38 113 38 Q130 38 130 84 H124 Q124 46 113 46 Q102 46 102 84 Z" />
      <path d="M48 84 H152 L144 160 H56 Z" />
      <path d="M50 100 H150" />
    </>
  ),
  wallet: (
    <>
      <rect x="42" y="68" width="116" height="72" rx="6" />
      <path d="M42 86 H158" />
      <path d="M118 104 H158 V124 H118 Q110 124 110 114 Q110 104 118 104 Z" />
      <circle cx="124" cy="114" r="3" />
    </>
  ),
  sunglasses: (
    <>
      <path d="M38 88 Q38 82 46 82 H84 Q92 82 92 90 Q92 122 66 122 Q38 122 38 88 Z" />
      <path d="M108 90 Q108 82 116 82 H154 Q162 82 162 88 Q162 122 134 122 Q108 122 108 90 Z" />
      <path d="M92 90 Q100 84 108 90" />
      <path d="M38 86 L24 80 M162 86 L176 80" />
    </>
  ),
  watch: (
    <>
      <path d="M84 72 L88 30 H112 L116 72 Z M84 128 L88 170 H112 L116 128 Z" />
      <circle cx="100" cy="100" r="34" />
      <circle cx="100" cy="100" r="27" />
      <path d="M100 100 V80 M100 100 L114 108" />
      <rect x="134" y="96" width="6" height="8" />
    </>
  ),
  scarf: (
    <>
      <path d="M46 52 H154 V148 H46 Z" />
      <path d="M56 62 H144 V138 H56 Z" />
    </>
  ),
  loafer: (
    <>
      <path d="M30 128 Q30 104 56 100 Q84 96 104 108 Q126 122 156 124 Q172 126 172 138 V142 H30 Z" />
      <path d="M30 142 H172 V148 H30 Z" />
      <path d="M92 104 Q104 96 120 112" />
      <path d="M96 110 L112 118" />
    </>
  ),
  heel: (
    <>
      <path d="M48 82 C56 96 70 112 96 124 C108 128 116 122 128 118 C146 122 166 134 174 146 L174 148 H112 C92 146 78 138 70 128 L64 154 H57 L54 122 C48 110 46 96 48 82 Z" />
    </>
  ),
  perfume: (
    <>
      <rect x="62" y="78" width="76" height="92" rx="6" />
      <rect x="86" y="58" width="28" height="20" />
      <rect x="80" y="34" width="40" height="24" rx="3" />
      <rect x="78" y="108" width="44" height="30" className="art-label" />
      <path d="M88 123 H112" />
    </>
  ),
  belt: (
    <>
      <path fillRule="evenodd" d={ring(96, 104, 46, 34)} />
      <rect x="126" y="86" width="34" height="36" rx="3" className="art-metal" />
      <path d="M134 104 H152" />
    </>
  ),
  blazer: (
    <>
      <path d="M72 34 L44 50 L30 110 L48 116 L54 92 V168 H146 V92 L152 116 L170 110 L156 50 L128 34 L100 100 Z" />
      <path d="M72 34 L62 66 L78 72 L100 100 M128 34 L138 66 L122 72 L100 100" />
      <path d="M100 100 V168" />
      <circle cx="108" cy="120" r="2.5" /><circle cx="108" cy="142" r="2.5" />
    </>
  ),
  dress: (
    <>
      <path d="M82 28 L84 62 Q76 82 82 96 L56 172 H144 L118 96 Q124 82 116 62 L118 28 L112 28 L110 60 Q100 70 90 60 L88 28 Z" />
      <path d="M82 96 H118" />
    </>
  ),
  ring: (
    <>
      <path fillRule="evenodd" d={ring(100, 118, 40, 32)} />
      <path d="M84 70 L92 58 H108 L116 70 L100 86 Z" className="art-label" />
      <path d="M84 70 H116" />
    </>
  ),
  trunk: (
    <>
      <path d="M84 62 Q84 44 100 44 Q116 44 116 62 H110 Q110 50 100 50 Q90 50 90 62 Z" />
      <rect x="34" y="62" width="132" height="92" rx="4" />
      <path d="M34 92 H166" />
      <path d="M62 62 V154 M138 62 V154" />
      <rect x="90" y="84" width="20" height="18" rx="2" className="art-metal" />
    </>
  ),
  clutch: (
    <>
      <rect x="44" y="80" width="112" height="60" rx="6" />
      <path d="M44 86 Q44 80 50 80 H150 Q156 80 156 86 L100 118 Z" />
      <circle cx="100" cy="116" r="4.5" className="art-metal" />
    </>
  ),
  cardholder: (
    <>
      <rect x="58" y="68" width="84" height="64" rx="4" />
      <path d="M58 84 H142 M58 98 H142" />
    </>
  ),
  coat: (
    <>
      <path d="M74 28 L46 42 L32 120 L50 124 L56 92 V178 H144 V92 L150 124 L168 120 L154 42 L126 28 L100 84 Z" />
      <path d="M74 28 L64 58 L80 64 L100 84 M126 28 L136 58 L120 64 L100 84" />
      <path d="M100 84 V178 M56 118 H144" />
    </>
  ),
  shirt: (
    <>
      <path d="M76 34 L46 48 L34 86 L52 92 L58 76 V166 H142 V76 L148 92 L166 86 L154 48 L124 34 Q100 50 76 34 Z" />
      <path d="M76 34 L100 60 L124 34" className="art-line" />
      <path d="M100 60 V166" />
    </>
  ),
  boot: (
    <>
      <path d="M70 38 H110 V100 Q130 108 156 118 Q168 122 168 136 V144 H112 L104 136 H96 V144 H70 Z" />
      <path d="M70 52 H110" />
    </>
  ),
  sneaker: (
    <>
      <path d="M34 120 Q34 98 50 96 L62 104 Q84 100 98 84 L112 96 Q130 114 158 118 Q170 120 170 132 V138 H34 Z" />
      <path d="M34 138 H170 V147 H34 Z" className="art-label" />
      <path d="M92 96 L104 104 M84 103 L96 112" />
    </>
  ),
  necklace: (
    <>
      <path d="M58 44 Q58 130 100 130 Q142 130 142 44" className="art-line" />
      <path d="M100 130 L111 145 L100 162 L89 145 Z" />
    </>
  ),
  bracelet: (
    <>
      <path fillRule="evenodd" d={ring(100, 100, 46, 37)} />
      <circle cx="100" cy="150" r="7" className="art-metal" />
    </>
  ),
  earrings: (
    <>
      <circle cx="74" cy="66" r="5" /><path d="M74 71 L87 108 Q74 128 61 108 Z" />
      <circle cx="126" cy="66" r="5" /><path d="M126 71 L139 108 Q126 128 113 108 Z" />
    </>
  ),
  candle: (
    <>
      <rect x="62" y="84" width="76" height="84" rx="6" />
      <rect x="76" y="108" width="48" height="34" className="art-label" />
      <path d="M100 84 V72" className="art-line" />
      <path d="M100 50 Q110 62 100 72 Q90 62 100 50 Z" className="art-metal" />
    </>
  ),
};

function isDark(hex: string): boolean {
  const value = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.42;
}

export function Art({ kind, color, className }: { kind: ArtKind; color?: ProductColor; className?: string }) {
  const stroke = color ? (isDark(color.hex) ? "#a39a8e" : "#2a2521") : "currentColor";
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" stroke={stroke} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {color && <g fill={color.hex} stroke="none">{ART[kind]}</g>}
      {color?.monogram && <g fill="url(#sn-mono)" stroke="none" className="art-mono">{ART[kind]}</g>}
      <g>{ART[kind]}</g>
    </svg>
  );
}

/** Lámina de producto: foto si el color la tiene; si no, la ilustración en ese color. `shot` elige la foto o el encuadre. */
export function ProductPlate({ product, color, shot = 0, className = "" }: { product: Product; color?: string | null; shot?: number; className?: string }) {
  const chosen = getColor(product, color);
  const image = chosen.images?.[shot];
  return (
    <div className={`plate ${!image && shot > 0 ? "plate-detail" : ""} ${className}`}>
      {image ? <img src={image} alt={`${product.name}, ${chosen.name}`} loading="lazy" /> : <Art kind={product.art} color={chosen} className="plate-art" />}
    </div>
  );
}
