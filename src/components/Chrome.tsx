import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { categories, formatPrice, products } from "../../shared/catalog";
import { useCart } from "../lib/cart";
import { ProductPlate } from "./ProductArt";

const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const MenuIcon = () => <Icon><path d="M3 8h18M3 16h18" /></Icon>;
const SearchIcon = () => <Icon><circle cx="11" cy="11" r="6.5" /><path d="m16 16 5 5" /></Icon>;
const BagIcon = () => <Icon><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></Icon>;
const HeartIcon = () => <Icon><path d="M12 20.5 4.6 13a4.7 4.7 0 0 1 0-6.7 4.8 4.8 0 0 1 6.8 0l.6.6.6-.6a4.8 4.8 0 0 1 6.8 0 4.7 4.7 0 0 1 0 6.7L12 20.5Z" /></Icon>;
const CloseIcon = () => <Icon><path d="M5 5l14 14M19 5 5 19" /></Icon>;

/** Bloquea el scroll, cierra con Escape y devuelve el foco al cerrar. */
function useOverlay(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.body.classList.add("locked");
    window.addEventListener("keydown", onKey);
    return () => { document.body.classList.remove("locked"); window.removeEventListener("keydown", onKey); previous?.focus?.(); };
  }, [open, close]);
}

function Panel({ open, close, side, label, children }: { open: boolean; close: () => void; side: "left" | "right" | "top"; label: string; children: ReactNode }) {
  useOverlay(open, close);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) ref.current?.focus(); }, [open]);
  return (
    <div className={`overlay ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
      <div className="overlay-scrim" onClick={close} />
      <div className={`panel panel-${side}`} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} ref={ref}>
        <button className="icon-btn panel-close" onClick={close} aria-label="Cerrar"><CloseIcon /></button>
        {children}
      </div>
    </div>
  );
}

function SearchPanel({ open, close }: { open: boolean; close: () => void }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (open) { setQuery(""); window.setTimeout(() => input.current?.focus(), 60); } }, [open]);
  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return products.filter((product) => `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(term)).slice(0, 6);
  }, [query]);
  return (
    <Panel open={open} close={close} side="top" label="Buscar">
      <div className="search">
        <label className="search-field">
          <SearchIcon />
          <input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar en Sessanta Nove" aria-label="Buscar productos" />
        </label>
        {query.trim() && results.length === 0 && <p className="muted">Ningún resultado para «{query.trim()}».</p>}
        {!query.trim() && (
          <div className="search-suggest">
            <span className="eyebrow">Sugerencias</span>
            {categories.slice(0, 4).map((category) => <Link key={category.slug} href={`/coleccion/${category.slug}`} onClick={close}>{category.name}</Link>)}
          </div>
        )}
        <div className="search-results">
          {results.map((product) => (
            <Link key={product.id} href={`/producto/${product.id}`} onClick={close} className="search-result">
              <ProductPlate product={product} />
              <span>{product.name}</span>
              <span className="muted">{formatPrice(product.price)}</span>
            </Link>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function BagPanel() {
  const { open, setOpen, entries, total, setQty, remove } = useCart();
  const close = () => setOpen(false);
  return (
    <Panel open={open} close={close} side="right" label="Tu bolsa">
      <div className="bag">
        <h2 className="panel-title">Tu bolsa</h2>
        {entries.length === 0 ? (
          <div className="bag-empty">
            <p>Tu bolsa está vacía.</p>
            <Link href="/coleccion" className="btn btn-outline" onClick={close}>Descubrir la colección</Link>
          </div>
        ) : (
          <>
            <ul className="bag-lines">
              {entries.map((entry) => (
                <li key={entry.key} className="bag-line">
                  <Link href={`/producto/${entry.product.id}`} onClick={close}><ProductPlate product={entry.product} /></Link>
                  <div className="bag-line-body">
                    <div className="bag-line-head">
                      <Link href={`/producto/${entry.product.id}`} onClick={close}>{entry.product.name}</Link>
                      <span>{formatPrice(entry.product.price * entry.qty)}</span>
                    </div>
                    {entry.option && <p className="muted">{entry.product.options?.label}: {entry.option}</p>}
                    <div className="bag-line-foot">
                      <div className="qty" role="group" aria-label={`Cantidad de ${entry.product.name}`}>
                        <button onClick={() => setQty(entry.key, entry.qty - 1)} aria-label="Quitar uno">−</button>
                        <span aria-live="polite">{entry.qty}</span>
                        <button onClick={() => setQty(entry.key, entry.qty + 1)} aria-label="Añadir uno" disabled={entry.qty >= 10}>+</button>
                      </div>
                      <button className="link" onClick={() => remove(entry.key)}>Eliminar</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bag-foot">
              <div className="bag-total"><span>Total</span><span>{formatPrice(total)}</span></div>
              <p className="muted small">Pago seguro con tu cuenta de Fleeca Bank.</p>
              <Link href="/checkout" className="btn btn-solid" onClick={close}>Finalizar compra</Link>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
}

export function Header() {
  const [location] = useLocation();
  const { count, setOpen, wishlist } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overHero = location === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setMenu(false); setSearch(false); }, [location]);

  return (
    <>
      <header className={`site-header ${overHero ? "is-over" : ""}`}>
        <div className="header-side">
          <button className="header-btn" onClick={() => setMenu(true)} aria-label="Abrir menú"><MenuIcon /><span>Menú</span></button>
          <button className="header-btn" onClick={() => setSearch(true)} aria-label="Buscar"><SearchIcon /><span>Buscar</span></button>
        </div>
        <Link href="/" className="wordmark" aria-label="Sessanta Nove, inicio">Sessanta Nove</Link>
        <div className="header-side header-side-end">
          <a href="#contacto" className="header-btn header-text">Contacto</a>
          <Link href="/favoritos" className="header-btn" aria-label={`Favoritos, ${wishlist.length} piezas`}><HeartIcon /></Link>
          <button className="header-btn" onClick={() => setOpen(true)} aria-label={`Abrir bolsa, ${count} artículos`}>
            <BagIcon /><span className="bag-count">{count}</span>
          </button>
        </div>
      </header>

      <Panel open={menu} close={() => setMenu(false)} side="left" label="Menú">
        <nav className="menu">
          <span className="eyebrow">Colecciones</span>
          <Link href="/coleccion" className="menu-link">Todo</Link>
          {categories.map((category) => <Link key={category.slug} href={`/coleccion/${category.slug}`} className="menu-link">{category.name}</Link>)}
          <span className="eyebrow menu-gap">La casa</span>
          <Link href="/favoritos" className="menu-link menu-link-sm">Favoritos</Link>
          <a href="/#maison" className="menu-link menu-link-sm" onClick={() => setMenu(false)}>La Maison</a>
          <a href="/#servicios" className="menu-link menu-link-sm" onClick={() => setMenu(false)}>Servicios</a>
        </nav>
      </Panel>
      <SearchPanel open={search} close={() => setSearch(false)} />
      <BagPanel />
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <span className="eyebrow">Colecciones</span>
          {categories.map((category) => <Link key={category.slug} href={`/coleccion/${category.slug}`}>{category.name}</Link>)}
        </div>
        <div>
          <span className="eyebrow">La casa</span>
          <a href="/#maison">La Maison</a>
          <a href="/#servicios">Servicios</a>
          <Link href="/coleccion">Boutique en línea</Link>
        </div>
        <div id="contacto">
          <span className="eyebrow">Contacto</span>
          <p>Nuestros asesores atienden cada pedido personalmente tras la compra.</p>
          <p>Pago seguro mediante Fleeca Bank.</p>
        </div>
      </div>
      <span className="sn-mark" aria-hidden="true" />
      <div className="footer-mark">Sessanta Nove</div>
      <p className="footer-legal">© {new Date().getFullYear()} Sessanta Nove. Sitio de ficción para un servidor de roleplay: marca, productos y pagos pertenecen al juego.</p>
    </footer>
  );
}
