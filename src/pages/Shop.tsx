import { useEffect, useState } from "react";
import { Link } from "wouter";
import { categories, formatPrice, getCategory, getProduct, products, type Product } from "../../shared/catalog";
import { NotFound } from "../App";
import { Plate, ProductPlate } from "../components/ProductArt";
import { useCart } from "../lib/cart";

function useTitle(title: string) {
  useEffect(() => { document.title = `${title} — Sessanta Nove`; }, [title]);
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/producto/${product.id}`} className="card">
      <ProductPlate product={product} />
      <div className="card-body">
        {product.isNew && <span className="card-flag">Novedad</span>}
        <span className="card-name">{product.name}</span>
        <span className="card-price">{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}

export function Home() {
  useTitle("Maison");
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);
  const signature = getProduct("borsa-notte")!;
  const fresh = products.filter((product) => product.isNew).slice(0, 4);

  return (
    <main>
      <section className="hero">
        <div className="hero-pattern" aria-hidden="true"><div className="monogram" /></div>
        <div className="hero-copy">
          <span className="eyebrow">Collezione Autunno · Inverno</span>
          <h1 className="hero-title">L’arte di <em>farsi notare</em></h1>
          <p>Marroquinería, sastrería y objetos firmados por la Maison.</p>
          <Link href="/coleccion" className="btn btn-light">Descubrir la colección</Link>
        </div>
      </section>

      <section className="section">
        <header className="section-head">
          <span className="eyebrow">Los universos</span>
          <h2 className="display">La Maison, pieza a pieza</h2>
        </header>
        <div className="tiles">
          {categories.map((category) => (
            <Link key={category.slug} href={`/coleccion/${category.slug}`} className="tile">
              <Plate art={category.art} tone={category.tone} />
              <span className="tile-name">{category.name}</span>
              <span className="tile-tag">{category.tagline}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="feature">
        <Link href={`/producto/${signature.id}`} className="feature-media"><ProductPlate product={signature} /></Link>
        <div className="feature-copy">
          <span className="eyebrow">El icono</span>
          <h2 className="display">{signature.name}</h2>
          <p>{signature.description} Cada pieza pasa por las manos de un solo artesano, de la primera puntada al último pulido.</p>
          <Link href={`/producto/${signature.id}`} className="btn btn-outline">Ver la pieza</Link>
        </div>
      </section>

      <section className="section">
        <header className="section-head">
          <span className="eyebrow">Recién llegado</span>
          <h2 className="display">Novedades</h2>
        </header>
        <div className="grid">{fresh.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        <div className="section-cta"><Link href="/coleccion" className="link-underline">Ver toda la colección</Link></div>
      </section>

      <section className="maison" id="maison">
        <div className="monogram" aria-hidden="true" />
        <span className="eyebrow">La Maison</span>
        <p className="maison-quote">«El lujo no se anuncia. <em>Se reconoce.</em>»</p>
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

export function Collection({ slug }: { slug?: string }) {
  const category = slug ? getCategory(slug) : undefined;
  const [sort, setSort] = useState<"destacados" | "asc" | "desc">("destacados");
  useTitle(category?.name ?? "Colección");
  if (slug && !category) return <NotFound />;
  const list = products.filter((product) => !category || product.category === category.slug);
  if (sort !== "destacados") list.sort((a, b) => (sort === "asc" ? a.price - b.price : b.price - a.price));

  return (
    <main className="page">
      <header className="page-head">
        <span className="eyebrow">{category ? category.tagline : "Boutique en línea"}</span>
        <h1 className="display">{category?.name ?? "La colección"}</h1>
      </header>
      <nav className="filters" aria-label="Categorías">
        <Link href="/coleccion" className={!category ? "is-active" : ""}>Todo</Link>
        {categories.map((item) => <Link key={item.slug} href={`/coleccion/${item.slug}`} className={category?.slug === item.slug ? "is-active" : ""}>{item.name}</Link>)}
      </nav>
      <div className="toolbar">
        <span className="muted">{list.length} {list.length === 1 ? "pieza" : "piezas"}</span>
        <label className="sort">
          <span>Ordenar</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
            <option value="destacados">Destacados</option>
            <option value="asc">Precio ascendente</option>
            <option value="desc">Precio descendente</option>
          </select>
        </label>
      </div>
      <div className="grid">{list.map((product) => <ProductCard key={product.id} product={product} />)}</div>
    </main>
  );
}

export function ProductPage({ id }: { id: string }) {
  const product = getProduct(id);
  const { add } = useCart();
  const [option, setOption] = useState<string | undefined>(product?.options?.values.length === 1 ? product.options.values[0] : undefined);
  const [missing, setMissing] = useState(false);
  useTitle(product?.name ?? "Producto");
  if (!product) return <NotFound />;
  const category = getCategory(product.category);
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4);

  const submit = () => {
    if (product.options && !option) { setMissing(true); return; }
    add(product.id, option);
  };

  return (
    <main>
      <div className="product">
        <div className="product-media"><ProductPlate product={product} /></div>
        <div className="product-info">
          <nav className="crumbs" aria-label="Ruta">
            <Link href="/coleccion">Colección</Link>
            {category && <><span aria-hidden="true">/</span><Link href={`/coleccion/${category.slug}`}>{category.name}</Link></>}
          </nav>
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">{formatPrice(product.price)}</p>
          <p className="product-desc">{product.description}</p>

          {product.options && (
            <fieldset className="options">
              <legend>{product.options.label}{option ? <span className="muted"> — {option}</span> : null}</legend>
              <div className="options-list">
                {product.options.values.map((value) => (
                  <button key={value} type="button" className={`option ${option === value ? "is-active" : ""}`} aria-pressed={option === value} onClick={() => { setOption(value); setMissing(false); }}>{value}</button>
                ))}
              </div>
              {missing && <p className="field-error" role="alert">Elige {product.options.label.toLowerCase()} para continuar.</p>}
            </fieldset>
          )}

          <button className="btn btn-solid btn-block" onClick={submit}>Añadir a la bolsa</button>
          <ul className="product-details">{product.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
          <p className="muted small">Pago con Fleeca Bank · Entrega concertada por un asesor de la Maison.</p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="section">
          <header className="section-head"><span className="eyebrow">{category?.name}</span><h2 className="display">También te puede interesar</h2></header>
          <div className="grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      )}
    </main>
  );
}
