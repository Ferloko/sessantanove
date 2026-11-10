import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  categories, formatPrice, getCategory, getColor, getLine, getProduct, hero, lines, matchesGender, products, skuOf,
  type Editorial, type Product,
} from "../../shared/catalog";
import { NotFound } from "../App";
import { Panel } from "../components/Chrome";
import { ProductPlate } from "../components/ProductArt";
import { useCart } from "../lib/cart";

function useTitle(title: string) {
  useEffect(() => { document.title = `${title} — Sessanta Nove`; }, [title]);
}

function WishButton({ product }: { product: Product }) {
  const { wishlist, toggleWish } = useCart();
  const on = wishlist.includes(product.id);
  return (
    <button type="button" className={`wish ${on ? "is-on" : ""}`} aria-pressed={on} aria-label={`${on ? "Quitar" : "Añadir"} ${product.name} ${on ? "de" : "a"} favoritos`} onClick={() => toggleWish(product.id)}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true"><path d="M12 20.5 4.6 13a4.7 4.7 0 0 1 0-6.7 4.8 4.8 0 0 1 6.8 0l.6.6.6-.6a4.8 4.8 0 0 1 6.8 0 4.7 4.7 0 0 1 0 6.7L12 20.5Z" /></svg>
    </button>
  );
}

/** Celda de producto: lámina, favorito, datos y mini selector de color que cambia la imagen en la propia cuadrícula. */
function ProductCell({ product, big = false }: { product: Product; big?: boolean }) {
  const [index, setIndex] = useState(0);
  const color = product.colors[index];
  const href = `/producto/${product.id}${index > 0 ? `?color=${encodeURIComponent(color.name)}` : ""}`;
  return (
    <article className={`cell ${big ? "cell-big" : ""}`}>
      <Link href={href} className="cell-link" aria-label={`${product.name}, ${formatPrice(product.price)}`}>
        <ProductPlate product={product} color={color.name} />
        <div className="cell-info">
          {product.isNew && <span className="cell-flag">Nuevo</span>}
          <span className="cell-name">{product.name}</span>
          <span className="cell-price">{formatPrice(product.price)}</span>
        </div>
      </Link>
      <WishButton product={product} />
      {product.colors.length > 1 && (
        <div className="cell-dots" role="group" aria-label={`Colores de ${product.name}`}>
          {product.colors.map((option, position) => (
            <button key={option.name} type="button" className={`dot ${position === index ? "is-active" : ""}`} aria-pressed={position === index} aria-label={option.name} title={option.name} onClick={() => setIndex(position)}>
              <span style={{ background: option.hex }} />
            </button>
          ))}
        </div>
      )}
    </article>
  );
}

function EditorialCell({ editorial }: { editorial: Editorial }) {
  return (
    <div className={`cell cell-big cell-editorial ${editorial.dark ? "is-dark" : ""}`} style={{ background: editorial.background }}>
      {editorial.image ? <img src={editorial.image} alt="" loading="lazy" /> : <div className="monogram" aria-hidden="true" />}
      <div className="editorial-copy">
        <span className="editorial-title">{editorial.title}</span>
        {editorial.text && <span>{editorial.text}</span>}
      </div>
    </div>
  );
}

export function Home() {
  useTitle("Maison");
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <main>
      <section className="hero">
        {hero.image ? <img className="hero-image" src={hero.image} alt="" /> : <div className="hero-pattern" aria-hidden="true"><div className="monogram" /></div>}
        <div className="hero-copy">
          <span className="eyebrow">{hero.eyebrow}</span>
          <h1 className="hero-title">{hero.title}</h1>
          <Link href={hero.href} className="link-underline">{hero.cta}</Link>
        </div>
      </section>

      <section className="explore">
        <h2 className="display">Explore la selección de creaciones de la Maison</h2>
        <div className="explore-grid">
          {categories.map((category) => {
            const cover = products.find((product) => product.category === category.slug);
            return (
              <Link key={category.slug} href={`/coleccion/${category.slug}`} className="explore-tile">
                {category.image ? <div className="plate"><img src={category.image} alt="" loading="lazy" /></div> : cover && <ProductPlate product={cover} />}
                <span>{category.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {lines.map((line) => {
        const picks = products.filter((product) => product.line === line.slug).slice(0, 4);
        return (
          <section key={line.slug} className="line">
            <Link href={`/linea/${line.slug}`} className="line-hero" style={{ background: line.background }}>
              {line.image ? <img className="hero-image" src={line.image} alt="" loading="lazy" /> : <div className="hero-pattern" aria-hidden="true"><div className="monogram" /></div>}
              <div className="hero-copy">
                <span className="eyebrow">{line.eyebrow}</span>
                <h2 className="hero-title">{line.title}</h2>
                <span className="link-underline">Descubrir {line.name}</span>
              </div>
            </Link>
            <div className="cells">{picks.map((product) => <ProductCell key={product.id} product={product} />)}</div>
            <div className="line-cta">
              <Link href={`/linea/${line.slug}/mujer`} className="btn btn-outline">Descubre la colección de Mujer</Link>
              <Link href={`/linea/${line.slug}/hombre`} className="btn btn-outline">Descubre la colección de Hombre</Link>
            </div>
          </section>
        );
      })}

      <section className="maison" id="maison">
        <div className="monogram" aria-hidden="true" />
        <span className="eyebrow">La Maison</span>
        <p className="maison-quote">«El lujo no se anuncia. Se reconoce.»</p>
        <p className="maison-text">
          Sessanta Nove nació en un pequeño taller de marroquinería con una idea sencilla: hacer pocas cosas y hacerlas para siempre.
          Hoy la casa viste, calza y acompaña a quienes entienden que la elegancia está en el detalle que casi nadie ve.
        </p>
      </section>

      <section className="services" id="servicios">
        {[
          ["Asesor personal", "Tras tu compra, un asesor de la Maison te contacta para preparar y entregar tu pedido."],
          ["Pago con Fleeca Bank", "Paga con tu cuenta bancaria desde la pasarela oficial. Nunca vemos tus credenciales."],
          ["Hecho por encargo", "Baúles, grabados y tallas especiales bajo pedido. Consúltalo en las notas de tu compra."],
        ].map(([title, text]) => (
          <div key={title} className="service">
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}

type Tab = "todo" | "novedad" | "mujer" | "hombre";
type Sort = "destacados" | "asc" | "desc";
const TABS: [Tab, string][] = [["todo", "Todo"], ["novedad", "Novedad"], ["mujer", "Mujer"], ["hombre", "Hombre"]];
const SORTS: [Sort, string][] = [["destacados", "Destacados"], ["asc", "Precio: de menor a mayor"], ["desc", "Precio: de mayor a menor"]];

/** Página de listado: categoría, colección (línea) o género. Cuadrícula continua de 4 columnas con piezas 2×2. */
export function Collection({ category: categorySlug, line: lineSlug, gender }: { category?: string; line?: string; gender?: string }) {
  const category = categorySlug ? getCategory(categorySlug) : undefined;
  const line = lineSlug ? getLine(lineSlug) : undefined;
  const fixedGender: "mujer" | "hombre" | undefined = gender === "mujer" || gender === "hombre" ? gender : undefined;
  const [tab, setTab] = useState<Tab>(fixedGender && lineSlug ? fixedGender : "todo");
  const [sort, setSort] = useState<Sort>("destacados");
  const [filters, setFilters] = useState(false);
  const genderOnly = fixedGender && !lineSlug ? fixedGender : undefined;

  const title = category?.name ?? (line ? `Colección ${line.name}` : genderOnly ? (genderOnly === "mujer" ? "Mujer" : "Hombre") : "Todas las creaciones");
  useTitle(title);

  const list = useMemo(() => {
    const result = products.filter((product) =>
      (!category || product.category === category.slug) &&
      (!line || product.line === line.slug) &&
      (!genderOnly || matchesGender(product, genderOnly)) &&
      (tab === "todo" || (tab === "novedad" ? product.isNew : matchesGender(product, tab))));
    if (sort !== "destacados") result.sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));
    return result;
  }, [category, line, genderOnly, tab, sort]);

  if ((categorySlug && !category) || (lineSlug && !line) || (gender && !fixedGender)) return <NotFound />;
  const tabs = TABS.filter(([id]) => !genderOnly || id === "todo" || id === "novedad");
  // Las piezas 2×2 y el bloque editorial solo se usan en la vista por defecto, para no descolocar los filtros.
  const curated = tab === "todo" && sort === "destacados";
  const editorial = curated ? category?.editorial : undefined;
  // Si la última fila de 4 queda incompleta se rellena con celdas de la casa para que no haya huecos.
  const units = list.reduce((sum, product) => sum + (curated && category && product.big ? 4 : 1), editorial ? 4 : 0);
  const fillers = (4 - (units % 4)) % 4;

  return (
    <main className="listing">
      <header className="listing-head">
        <nav className="crumbs" aria-label="Ruta"><Link href="/coleccion">Colección</Link>{line && <><span aria-hidden="true">/</span><span>Líneas</span></>}</nav>
        <h1 className="listing-title">{title}</h1>
        <div className="tabs" role="tablist" aria-label="Filtrar">
          {tabs.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "is-active" : ""} onClick={() => setTab(id)}>{id === "todo" && category ? `Todo ${category.name.toLowerCase()}` : label}</button>
          ))}
        </div>
      </header>

      {list.length === 0 ? (
        <div className="page page-center"><p className="muted">No hay piezas con este filtro.</p><button className="btn btn-outline" onClick={() => setTab("todo")}>Ver todo</button></div>
      ) : (
        <div className="cells">
          {list.map((product, position) => (
            <Fragment key={product.id}>
              {editorial && editorial.position === position && <EditorialCell editorial={editorial} />}
              <ProductCell product={product} big={curated && Boolean(category) && product.big} />
            </Fragment>
          ))}
          {editorial && editorial.position >= list.length && <EditorialCell editorial={editorial} />}
          {Array.from({ length: fillers }, (_, index) => <div key={`filler-${index}`} className="cell cell-filler" aria-hidden="true"><span className="sn-mark" /></div>)}
        </div>
      )}

      <button className="filters-pill" onClick={() => setFilters(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true"><path d="M3 8h11M18 8h3M3 16h3M10 16h11" /><circle cx="16" cy="8" r="2" /><circle cx="8" cy="16" r="2" /></svg>
        Filtros y ordenar por
      </button>
      <Panel open={filters} close={() => setFilters(false)} side="right" label="Filtros y orden">
        <div className="filters-panel">
          <h2 className="panel-title">Filtros y ordenar por</h2>
          <FilterGroup title="Ordenar por">{SORTS.map(([id, label]) => <Choice key={id} name="sort" label={label} checked={sort === id} onChange={() => setSort(id)} />)}</FilterGroup>
          <FilterGroup title="Mostrar">{tabs.map(([id, label]) => <Choice key={id} name="tab" label={label} checked={tab === id} onChange={() => setTab(id)} />)}</FilterGroup>
          <button className="btn btn-solid btn-block" onClick={() => setFilters(false)}>Ver {list.length} {list.length === 1 ? "pieza" : "piezas"}</button>
        </div>
      </Panel>
    </main>
  );
}

const FilterGroup = ({ title, children }: { title: string; children: ReactNode }) => (
  <fieldset className="filter-group"><legend>{title}</legend>{children}</fieldset>
);
const Choice = ({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: () => void }) => (
  <label className="choice"><input type="radio" name={name} checked={checked} onChange={onChange} /><span>{label}</span></label>
);

export function Favorites() {
  const { wishlist } = useCart();
  useTitle("Favoritos");
  const list = products.filter((product) => wishlist.includes(product.id));
  return (
    <main className="listing">
      <header className="listing-head"><h1 className="listing-title">Favoritos</h1></header>
      {list.length ? <div className="cells">{list.map((product) => <ProductCell key={product.id} product={product} />)}</div> : (
        <div className="page page-center">
          <p className="muted">Aún no has guardado ninguna pieza. Pulsa el corazón de un producto para añadirlo.</p>
          <Link href="/coleccion" className="btn btn-outline">Descubrir la colección</Link>
        </div>
      )}
    </main>
  );
}

export function ProductPage({ id }: { id: string }) {
  const product = getProduct(id);
  const { add } = useCart();
  const [colorName, setColorName] = useState(() => (product ? getColor(product, new URLSearchParams(window.location.search).get("color")).name : ""));
  const [size, setSize] = useState<string | undefined>(product?.sizes?.length === 1 ? product.sizes[0] : undefined);
  const [missing, setMissing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useTitle(product?.name ?? "Producto");
  if (!product) return <NotFound />;

  const category = getCategory(product.category);
  const color = getColor(product, colorName);
  const shots = Math.max(color.images?.length ?? 0, 2); // sin fotos: vista general + detalle
  const related = products.filter((item) => item.category === product.category && item.id !== product.id);
  const more = [...related, ...products.filter((item) => item.line === product.line && item.id !== product.id && !related.includes(item))].slice(0, 4);

  const submit = () => {
    if (product.sizes && !size) { setMissing(true); return; }
    add(product.id, color.name, size);
  };

  return (
    <main>
      <div className="pdp">
        <div className="pdp-media">
          {Array.from({ length: shots }, (_, shot) => <ProductPlate key={`${color.name}-${shot}`} product={product} color={color.name} shot={shot} />)}
        </div>

        <aside className="pdp-side">
          <div className="pdp-panel">
            <div className="pdp-top"><span className="pdp-sku">{skuOf(product)}</span><WishButton product={product} /></div>
            {product.isNew && <span className="cell-flag">Nuevo</span>}
            <h1 className="pdp-name">{product.name}</h1>
            <p className="pdp-price">{formatPrice(product.price)}</p>

            <div className="pdp-group">
              <div className="pdp-label"><span>Colores</span><span className="muted">{color.name}</span></div>
              <div className="swatches" role="group" aria-label="Color">
                {product.colors.map((option) => (
                  <button key={option.name} type="button" className={`swatch ${option.name === color.name ? "is-active" : ""}`} aria-pressed={option.name === color.name} aria-label={option.name} title={option.name} onClick={() => setColorName(option.name)}>
                    <ProductPlate product={product} color={option.name} />
                  </button>
                ))}
              </div>
            </div>

            {product.sizes && (
              <div className="pdp-group">
                <div className="pdp-label"><span>Talla</span><span className="muted">{size ?? "Elige una talla"}</span></div>
                <div className="sizes" role="group" aria-label="Talla">
                  {product.sizes.map((value) => (
                    <button key={value} type="button" className={`size ${size === value ? "is-active" : ""}`} aria-pressed={size === value} onClick={() => { setSize(value); setMissing(false); }}>{value}</button>
                  ))}
                </div>
                {missing && <p className="field-error" role="alert">Elige una talla para continuar.</p>}
              </div>
            )}

            <div className="pdp-actions">
              <button className="btn btn-solid btn-block" onClick={submit}>Añadir a la bolsa</button>
              <a className="btn btn-outline btn-block" href="#contacto">Contacte un asesor</a>
            </div>

            <div className="pdp-desc">
              <p className={expanded ? "" : "is-clamped"}>{product.description}</p>
              <button className="link" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>{expanded ? "Ver menos" : "Ver más"}</button>
            </div>

            <details className="pdp-row"><summary>Detalles del producto</summary><ul>{product.details.map((detail) => <li key={detail}>{detail}</li>)}</ul></details>
            <details className="pdp-row"><summary>Entrega y recogida</summary><p>Un asesor de la Maison concierta contigo la entrega a domicilio o la recogida en boutique tras la compra.</p></details>
            <details className="pdp-row"><summary>Pago con Fleeca Bank</summary><p>El pago se autoriza en la pasarela oficial de Fleeca Bank con tu cuenta bancaria. Nunca vemos tus credenciales.</p></details>
            {category && <Link href={`/coleccion/${category.slug}`} className="pdp-more">Ver más {category.name.toLowerCase()}</Link>}
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section className="related">
          <h2 className="display">También te puede interesar</h2>
          <div className="cells">{more.map((item) => <ProductCell key={item.id} product={item} />)}</div>
        </section>
      )}
    </main>
  );
}
