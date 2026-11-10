import type { ReactNode } from "react";
import type { ArtKind, Product, Tone } from "../../shared/catalog";

/** Ilustraciones a línea de la casa. Se usan cuando un producto no tiene fotografía (`image`). */
const ART: Record<ArtKind, ReactNode> = {
  bag: (
    <>
      <path d="M52 92 L60 150 Q61 158 69 158 H131 Q139 158 140 150 L148 92 Z" />
      <path d="M50 92 H150 V104 Q100 122 50 104 Z" />
      <path d="M74 92 Q74 48 100 48 Q126 48 126 92" />
      <rect x="93" y="107" width="14" height="10" rx="2" />
    </>
  ),
  tote: (
    <>
      <path d="M48 84 H152 L144 160 H56 Z" />
      <path d="M72 84 Q72 40 88 40 Q102 40 102 84" />
      <path d="M98 84 Q98 40 112 40 Q128 40 128 84" />
      <path d="M52 100 H148" />
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
      <circle cx="100" cy="100" r="34" />
      <circle cx="100" cy="100" r="28" />
      <path d="M100 100 V80 M100 100 L114 108" />
      <path d="M84 70 L88 30 H112 L116 70 M84 130 L88 170 H112 L116 130" />
      <path d="M134 96 H140 V104 H134" />
    </>
  ),
  scarf: (
    <>
      <path d="M46 52 H154 V148 H46 Z" />
      <path d="M56 62 H144 V138 H56 Z" />
      <path d="M100 76 Q118 88 100 100 Q82 112 100 124" />
      <path d="M78 100 Q90 84 100 100 Q110 116 122 100" />
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
      <path d="M40 82 Q52 104 86 118 Q124 134 162 138 Q172 140 172 146 H112 Q84 140 60 118 L52 150 H46 L40 82 Z" />
      <path d="M40 82 Q60 78 70 96" />
    </>
  ),
  perfume: (
    <>
      <rect x="62" y="78" width="76" height="92" rx="6" />
      <rect x="86" y="58" width="28" height="20" />
      <rect x="80" y="34" width="40" height="24" rx="3" />
      <rect x="78" y="108" width="44" height="30" />
      <path d="M88 123 H112" />
    </>
  ),
  belt: (
    <>
      <circle cx="96" cy="104" r="46" />
      <circle cx="96" cy="104" r="34" />
      <rect x="126" y="86" width="34" height="36" rx="3" />
      <path d="M134 104 H152" />
    </>
  ),
  blazer: (
    <>
      <path d="M72 34 L44 50 L30 110 L48 116 L54 92 V168 H146 V92 L152 116 L170 110 L156 50 L128 34" />
      <path d="M72 34 L100 100 L128 34" />
      <path d="M72 34 L62 66 L78 72 L100 100 M128 34 L138 66 L122 72 L100 100" />
      <path d="M100 100 V168" />
      <circle cx="108" cy="120" r="2.5" /><circle cx="108" cy="142" r="2.5" />
    </>
  ),
  dress: (
    <>
      <path d="M82 28 L84 62 Q76 82 82 96 L56 172 H144 L118 96 Q124 82 116 62 L118 28" />
      <path d="M84 62 Q100 74 116 62" />
      <path d="M82 96 H118" />
    </>
  ),
  ring: (
    <>
      <circle cx="100" cy="118" r="40" />
      <circle cx="100" cy="118" r="32" />
      <path d="M84 70 L92 58 H108 L116 70 L100 86 Z" />
      <path d="M84 70 H116" />
    </>
  ),
  trunk: (
    <>
      <rect x="34" y="62" width="132" height="92" rx="4" />
      <path d="M34 92 H166" />
      <path d="M62 62 V154 M138 62 V154" />
      <rect x="90" y="84" width="20" height="18" rx="2" />
      <path d="M84 62 Q84 44 100 44 Q116 44 116 62" />
    </>
  ),
};

export function Art({ kind, className }: { kind: ArtKind; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ART[kind]}
    </svg>
  );
}

export function Plate({ art, tone, image, alt, className = "" }: { art: ArtKind; tone: Tone; image?: string; alt?: string; className?: string }) {
  return (
    <div className={`plate tone-${tone} ${className}`}>
      {image ? <img src={image} alt={alt ?? ""} loading="lazy" /> : <Art kind={art} className="plate-art" />}
    </div>
  );
}

export const ProductPlate = ({ product, className }: { product: Product; className?: string }) => (
  <Plate art={product.art} tone={product.tone} image={product.image} alt={product.name} className={className} />
);
