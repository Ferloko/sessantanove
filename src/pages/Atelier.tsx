import { createClient, type Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  ART_KINDS, formatPrice, normalizeContent,
  type ArtKind, type Category, type Content, type Editorial, type Gender, type Line, type Product, type ProductColor,
} from "../../shared/catalog";
import { CONTENT_ROW, IMAGE_BUCKET, SUPABASE_KEY, SUPABASE_URL } from "../../shared/config";
import { Art } from "../components/ProductArt";
import { getPublished, previewDraft, setPublished, stopPreview } from "../lib/content";

/**
 * MODO CREADOR (/atelier) — página oculta para editar toda la tienda desde dentro.
 * Solo entra quien inicia sesión con un correo autorizado en la tabla `sn_admins` de Supabase;
 * las reglas de la base de datos impiden publicar o subir imágenes a cualquier otra persona.
 */
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DRAFT_KEY = "sn_draft";
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const slugify = (value: string) => value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
const firstHex = (value: string, fallback: string) => value.match(/#[0-9a-f]{6}/i)?.[0] ?? fallback;
function shade(hex: string, amount: number): string {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * (1 + amount)))).toString(16).padStart(2, "0");
  return `#${channel(16)}${channel(8)}${channel(0)}`;
}

// ── Campos de formulario ──
const Field = ({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) => (
  <label className="at-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
);
const Text = ({ label, value, onChange, hint, placeholder }: { label: string; value: string; onChange: (value: string) => void; hint?: string; placeholder?: string }) => (
  <Field label={label} hint={hint}><input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></Field>
);
const Area = ({ label, value, onChange, hint, rows = 3 }: { label: string; value: string; onChange: (value: string) => void; hint?: string; rows?: number }) => (
  <Field label={label} hint={hint}><textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></Field>
);
const Pick = ({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: [string, string][] }) => (
  <Field label={label}><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></Field>
);
const Check = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <label className="at-check"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>
);

async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("El archivo no es una imagen.");
  if (file.size > 6 * 1024 * 1024) throw new Error("La imagen supera los 6 MB.");
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, file, { cacheControl: "31536000", contentType: file.type });
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Una o varias imágenes con miniaturas, subida y borrado. */
function Images({ label, value, onChange, multiple = false, hint }: { label: string; value: string[]; onChange: (value: string[]) => void; multiple?: boolean; hint?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, multiple ? 8 : 1)) urls.push(await uploadImage(file));
      onChange(multiple ? [...value, ...urls].slice(0, 8) : urls);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "No se pudo subir la imagen.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };
  return (
    <div className="at-field">
      <span>{label}</span>
      <div className="at-images">
        {value.map((url, index) => (
          <div key={url} className="at-thumb">
            <img src={url} alt="" />
            <button type="button" aria-label="Quitar imagen" onClick={() => onChange(value.filter((_, position) => position !== index))}>×</button>
          </div>
        ))}
        {(multiple || value.length === 0) && <button type="button" className="at-add-image" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Subiendo…" : "+ Subir foto"}</button>}
        <input ref={input} type="file" accept="image/*" multiple={multiple} hidden onChange={(event) => void pick(event.target.files)} />
      </div>
      {hint && <small>{hint}</small>}
      {error && <small className="at-error" role="alert">{error}</small>}
    </div>
  );
}

function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")); const password = String(form.get("password"));
    setBusy(true); setMessage("");
    const { data, error } = mode === "login" ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) setMessage(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message === "Email not confirmed" ? "Confirma tu correo con el enlace que te enviamos y vuelve a iniciar sesión." : error.message);
    else if (mode === "signup" && !data.session) { setMessage("Cuenta creada. Abre el enlace de confirmación que te hemos enviado por correo y después inicia sesión aquí."); setMode("login"); }
  };
  return (
    <main className="at-login">
      <form onSubmit={submit}>
        <span className="sn-mark" aria-hidden="true" />
        <h1>Atelier</h1>
        <p className="muted">Modo Creador de Sessanta Nove</p>
        <Field label="Correo"><input name="email" type="email" required autoComplete="email" /></Field>
        <Field label="Contraseña"><input name="password" type="password" required minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} /></Field>
        {message && <p className="notice" role="alert">{message}</p>}
        <button className="btn btn-solid btn-block" disabled={busy}>{busy ? "Un momento…" : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }}>
          {mode === "login" ? "Primera vez: crear mi cuenta" : "Ya tengo cuenta: iniciar sesión"}
        </button>
        <Link href="/" className="link">Volver a la tienda</Link>
      </form>
    </main>
  );
}

type Section = "portada" | "categorias" | "colecciones" | "productos";
const SECTIONS: [Section, string][] = [["portada", "Portada"], ["categorias", "Categorías"], ["colecciones", "Colecciones"], ["productos", "Productos"]];
const GENDERS: [Gender, string][] = [["mujer", "Mujer"], ["hombre", "Hombre"], ["unisex", "Unisex"]];
const ART_NAMES: Record<ArtKind, string> = {
  bag: "Bolso de mano", tote: "Cabas", clutch: "Pochette", trunk: "Baúl / maleta", wallet: "Cartera", cardholder: "Tarjetero", blazer: "Americana", coat: "Abrigo",
  shirt: "Camisa", dress: "Vestido", loafer: "Mocasín", heel: "Tacón", boot: "Botín", sneaker: "Zapatilla", belt: "Cinturón", scarf: "Pañuelo", sunglasses: "Gafas",
  watch: "Reloj", ring: "Anillo", necklace: "Collar", bracelet: "Pulsera", earrings: "Pendientes", perfume: "Perfume", candle: "Vela",
};

function Editor({ session }: { session: Session }) {
  const [, navigate] = useLocation();
  const [draft, setDraft] = useState<Content>(() => {
    try { const saved = normalizeContent(JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null")); if (saved) return saved; } catch { /* sin borrador */ }
    return clone(getPublished());
  });
  const [section, setSection] = useState<Section>("productos");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "error"; text?: string }>({ kind: "idle" });
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(getPublished()), [draft, status]);

  useEffect(() => { stopPreview(); }, []);
  useEffect(() => { try { if (dirty) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); else localStorage.removeItem(DRAFT_KEY); } catch { /* sin almacenamiento */ } }, [draft, dirty]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (change: (next: Content) => void) => setDraft((current) => { const next = clone(current); change(next); return next; });

  /** Devuelve los problemas que impedirían publicar (vacío = todo correcto). */
  const problems = (): string[] => {
    const issues: string[] = [];
    const ids = new Set<string>();
    for (const product of draft.products) {
      const label = product.name || product.id || "Pieza sin nombre";
      if (!product.id) issues.push(`«${label}» no tiene identificador.`);
      else if (ids.has(product.id)) issues.push(`El identificador «${product.id}» está repetido.`);
      ids.add(product.id);
      if (!product.name.trim()) issues.push(`La pieza «${product.id}» no tiene nombre.`);
      if (!Number.isInteger(product.price) || product.price < 1) issues.push(`«${label}» necesita un precio entero mayor que 0.`);
      if (!product.colors.length) issues.push(`«${label}» necesita al menos un color.`);
      if (product.colors.some((color) => !color.name.trim())) issues.push(`«${label}» tiene un color sin nombre.`);
      if (new Set(product.colors.map((color) => color.name.trim())).size !== product.colors.length) issues.push(`«${label}» tiene colores con el mismo nombre.`);
      if (!draft.categories.some((category) => category.slug === product.category)) issues.push(`«${label}» está en una categoría que ya no existe.`);
    }
    for (const group of [draft.categories, draft.lines]) {
      const slugs = group.map((entry) => entry.slug);
      if (slugs.some((slug) => !slug) || new Set(slugs).size !== slugs.length) issues.push("Hay categorías o colecciones con el identificador vacío o repetido.");
      if (group.some((entry) => !entry.name.trim())) issues.push("Hay categorías o colecciones sin nombre.");
    }
    return issues;
  };

  const publish = async () => {
    const issues = problems();
    const clean = normalizeContent(draft);
    if (issues.length || !clean) { setStatus({ kind: "error", text: issues.slice(0, 4).join(" ") || "El contenido no es válido." }); return; }
    setStatus({ kind: "busy", text: "Publicando…" });
    const { error } = await supabase.from("sn_content").upsert({ id: CONTENT_ROW, data: clean, updated_at: new Date().toISOString(), updated_by: session.user.id });
    if (error) { setStatus({ kind: "error", text: `No se pudo publicar: ${error.message}` }); return; }
    setPublished(clean);
    setDraft(clone(clean));
    setStatus({ kind: "ok", text: "Publicado. Los cambios ya están en la tienda." });
  };

  const changePassword = async () => {
    const password = window.prompt("Nueva contraseña (mínimo 8 caracteres):");
    if (password === null) return;
    if (password.length < 8) { setStatus({ kind: "error", text: "La contraseña debe tener al menos 8 caracteres." }); return; }
    const { error } = await supabase.auth.updateUser({ password });
    setStatus(error ? { kind: "error", text: `No se pudo cambiar la contraseña: ${error.message}` } : { kind: "ok", text: "Contraseña cambiada." });
  };

  const preview = () => {
    const clean = normalizeContent(draft);
    if (!clean) { setStatus({ kind: "error", text: "El borrador tiene errores y no se puede previsualizar." }); return; }
    previewDraft(clean);
    navigate("/");
  };

  const discard = () => {
    if (!window.confirm("¿Descartar todos los cambios sin publicar?")) return;
    setDraft(clone(getPublished()));
    setStatus({ kind: "idle" });
  };

  return (
    <div className="at">
      <header className="at-bar">
        <div className="at-brand"><span className="sn-mark" aria-hidden="true" /><strong>Atelier</strong><span className={`at-state ${dirty ? "is-dirty" : ""}`}>{dirty ? "Cambios sin publicar" : "Todo publicado"}</span></div>
        <div className="at-actions">
          <button className="at-btn" onClick={preview}>Vista previa</button>
          <button className="at-btn" onClick={discard} disabled={!dirty}>Descartar</button>
          <button className="at-btn at-btn-solid" onClick={() => void publish()} disabled={!dirty || status.kind === "busy"}>Publicar</button>
          <button className="at-btn" onClick={() => void changePassword()}>Contraseña</button>
          <button className="at-btn" onClick={() => void supabase.auth.signOut()}>Salir</button>
        </div>
      </header>
      {status.text && <p className={`at-status is-${status.kind}`} role="status">{status.text}</p>}

      <div className="at-body">
        <nav className="at-nav" aria-label="Secciones">
          {SECTIONS.map(([id, name]) => <button key={id} className={section === id ? "is-active" : ""} onClick={() => setSection(id)}>{name}</button>)}
          <Link href="/">Ver la tienda</Link>
        </nav>
        <main className="at-main">
          {section === "portada" && <HeroEditor draft={draft} update={update} />}
          {section === "categorias" && <CategoriesEditor draft={draft} update={update} />}
          {section === "colecciones" && <LinesEditor draft={draft} update={update} />}
          {section === "productos" && <ProductsEditor draft={draft} update={update} />}
        </main>
      </div>
    </div>
  );
}

interface EditorProps { draft: Content; update: (change: (next: Content) => void) => void }

function HeroEditor({ draft, update }: EditorProps) {
  return (
    <section className="at-card">
      <h2>Portada</h2>
      <p className="muted">La imagen a pantalla completa que abre la tienda. Sin foto se muestra el monograma.</p>
      <Images label="Foto de portada" value={draft.hero.image ? [draft.hero.image] : []} onChange={(urls) => update((next) => { next.hero.image = urls[0] ?? ""; })} hint="Horizontal, al menos 1920 px de ancho." />
      <Text label="Etiqueta pequeña" value={draft.hero.eyebrow} onChange={(value) => update((next) => { next.hero.eyebrow = value; })} />
      <Text label="Título" value={draft.hero.title} onChange={(value) => update((next) => { next.hero.title = value; })} />
      <div className="at-row">
        <Text label="Texto del enlace" value={draft.hero.cta} onChange={(value) => update((next) => { next.hero.cta = value; })} />
        <Pick label="El enlace lleva a" value={draft.hero.href} onChange={(value) => update((next) => { next.hero.href = value; })}
          options={[["/coleccion", "Toda la colección"], ["/mujer", "Mujer"], ["/hombre", "Hombre"], ...draft.lines.map((line): [string, string] => [`/linea/${line.slug}`, `Colección ${line.name}`]), ...draft.categories.map((category): [string, string] => [`/coleccion/${category.slug}`, category.name])]} />
      </div>
    </section>
  );
}

function move<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return;
  [items[index], items[target]] = [items[target], items[index]];
}
const RowTools = ({ onUp, onDown, onDelete }: { onUp: () => void; onDown: () => void; onDelete: () => void }) => (
  <div className="at-tools">
    <button type="button" onClick={onUp} aria-label="Subir">↑</button>
    <button type="button" onClick={onDown} aria-label="Bajar">↓</button>
    <button type="button" onClick={onDelete} aria-label="Eliminar" className="is-danger">Eliminar</button>
  </div>
);

function CategoriesEditor({ draft, update }: EditorProps) {
  const add = () => update((next) => {
    let slug = "nueva-categoria"; let count = 2;
    while (next.categories.some((category) => category.slug === slug)) slug = `nueva-categoria-${count++}`;
    next.categories.push({ slug, name: "Nueva categoría" });
  });
  const remove = (category: Category) => {
    const used = draft.products.filter((product) => product.category === category.slug).length;
    if (used) { window.alert(`«${category.name}» tiene ${used} piezas. Muévelas a otra categoría o elimínalas antes.`); return; }
    if (window.confirm(`¿Eliminar la categoría «${category.name}»?`)) update((next) => { next.categories = next.categories.filter((entry) => entry.slug !== category.slug); });
  };
  return (
    <>
      <div className="at-head"><div><h2>Categorías</h2><p className="muted">Aparecen en la cuadrícula de la portada (4 por fila) y en el menú, en este orden.</p></div><button className="at-btn at-btn-solid" onClick={add}>+ Categoría</button></div>
      {draft.categories.map((category, index) => {
        const set = (change: (entry: Category) => void) => update((next) => change(next.categories[index]));
        const editorials = category.editorials ?? [];
        const count = draft.products.filter((product) => product.category === category.slug).length;
        return (
          <details key={index} className="at-card at-fold">
            <summary><span>{category.name}</span><small>{count} piezas</small></summary>
            <RowTools onUp={() => update((next) => move(next.categories, index, -1))} onDown={() => update((next) => move(next.categories, index, 1))} onDelete={() => remove(category)} />
            <div className="at-row">
              <Text label="Nombre" value={category.name} onChange={(value) => set((entry) => { entry.name = value; })} />
              <Text label="Identificador (URL)" value={category.slug} hint="Solo minúsculas, números y guiones."
                onChange={(value) => update((next) => { const slug = slugify(value); const previous = next.categories[index].slug; next.categories[index].slug = slug; next.products.forEach((product) => { if (product.category === previous) product.category = slug; }); })} />
            </div>
            <Images label="Foto de la categoría en la portada" value={category.image ? [category.image] : []} onChange={(urls) => set((entry) => { entry.image = urls[0]; })} hint="Vertical 4:5. Sin foto se usa la primera pieza de la categoría." />
            <h3>Bloques editoriales (2×2) dentro de la cuadrícula</h3>
            {editorials.map((block, position) => {
              const setBlock = (change: (entry: Editorial) => void) => set((entry) => change(entry.editorials![position]));
              return (
                <div key={position} className="at-sub">
                  <div className="at-row">
                    <Text label="Título" value={block.title} onChange={(value) => setBlock((entry) => { entry.title = value; })} />
                    <Text label="Texto" value={block.text ?? ""} onChange={(value) => setBlock((entry) => { entry.text = value; })} />
                  </div>
                  <div className="at-row">
                    <Field label="Aparece tras la pieza n.º" hint="0 = al principio."><input type="number" min={0} max={count} value={block.position} onChange={(event) => setBlock((entry) => { entry.position = Math.max(0, Number(event.target.value) || 0); })} /></Field>
                    <Field label="Color de fondo"><input type="color" value={firstHex(block.background, "#ece5d8")} onChange={(event) => setBlock((entry) => { entry.background = `linear-gradient(160deg, ${event.target.value}, ${shade(event.target.value, 0.12)})`; })} /></Field>
                    <Check label="Texto en blanco" checked={Boolean(block.dark)} onChange={(checked) => setBlock((entry) => { entry.dark = checked; })} />
                  </div>
                  <Images label="Foto del bloque" value={block.image ? [block.image] : []} onChange={(urls) => setBlock((entry) => { entry.image = urls[0]; })} hint="Sin foto se muestra el monograma sobre el color de fondo." />
                  <button type="button" className="link" onClick={() => set((entry) => { entry.editorials = entry.editorials!.filter((_, at) => at !== position); })}>Quitar bloque</button>
                </div>
              );
            })}
            <button type="button" className="at-btn" onClick={() => set((entry) => { entry.editorials = [...(entry.editorials ?? []), { title: "Nuevo bloque", background: "linear-gradient(160deg, #e9dfcd, #f6f1e7)", position: 0 }]; })}>+ Bloque editorial</button>
          </details>
        );
      })}
    </>
  );
}

function LinesEditor({ draft, update }: EditorProps) {
  const add = () => update((next) => {
    let slug = "nueva-coleccion"; let count = 2;
    while (next.lines.some((line) => line.slug === slug)) slug = `nueva-coleccion-${count++}`;
    next.lines.push({ slug, name: "Nueva colección", eyebrow: "Colección", title: "Nueva colección", background: "radial-gradient(120% 90% at 60% 20%, #4a3324 0%, #241812 60%, #140e0b 100%)" });
  });
  return (
    <>
      <div className="at-head"><div><h2>Colecciones</h2><p className="muted">Cada colección tiene su bloque en la portada: foto grande, sus 4 primeras piezas y los botones Mujer / Hombre.</p></div><button className="at-btn at-btn-solid" onClick={add}>+ Colección</button></div>
      {draft.lines.map((line, index) => {
        const set = (change: (entry: Line) => void) => update((next) => change(next.lines[index]));
        return (
          <details key={index} className="at-card at-fold">
            <summary><span>{line.name}</span><small>{draft.products.filter((product) => product.line === line.slug).length} piezas</small></summary>
            <RowTools onUp={() => update((next) => move(next.lines, index, -1))} onDown={() => update((next) => move(next.lines, index, 1))}
              onDelete={() => { if (window.confirm(`¿Eliminar la colección «${line.name}»? Sus piezas se conservan, sin colección.`)) update((next) => { next.products.forEach((product) => { if (product.line === line.slug) product.line = ""; }); next.lines.splice(index, 1); }); }} />
            <div className="at-row">
              <Text label="Nombre" value={line.name} onChange={(value) => set((entry) => { entry.name = value; })} />
              <Text label="Identificador (URL)" value={line.slug} hint="Solo minúsculas, números y guiones."
                onChange={(value) => update((next) => { const slug = slugify(value); const previous = next.lines[index].slug; next.lines[index].slug = slug; next.products.forEach((product) => { if (product.line === previous) product.line = slug; }); })} />
            </div>
            <div className="at-row">
              <Text label="Etiqueta pequeña" value={line.eyebrow} onChange={(value) => set((entry) => { entry.eyebrow = value; })} />
              <Text label="Título del bloque" value={line.title} onChange={(value) => set((entry) => { entry.title = value; })} />
            </div>
            <Images label="Foto del bloque" value={line.image ? [line.image] : []} onChange={(urls) => set((entry) => { entry.image = urls[0]; })} hint="Horizontal, al menos 1920 px. Sin foto se muestra el monograma sobre el color de fondo." />
            <Field label="Color de fondo (sin foto)"><input type="color" value={firstHex(line.background, "#4a3324")} onChange={(event) => set((entry) => { entry.background = `radial-gradient(120% 90% at 60% 20%, ${event.target.value} 0%, ${shade(event.target.value, -0.5)} 60%, ${shade(event.target.value, -0.72)} 100%)`; })} /></Field>
          </details>
        );
      })}
    </>
  );
}

function ProductsEditor({ draft, update }: EditorProps) {
  const [category, setCategory] = useState(draft.categories[0]?.slug ?? "");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const term = query.trim().toLowerCase();
  const visible = draft.products.filter((product) => (term ? product.name.toLowerCase().includes(term) : product.category === category));
  const index = draft.products.findIndex((product) => product.id === selected);
  const product = index >= 0 ? draft.products[index] : undefined;
  const set = (change: (entry: Product) => void) => update((next) => change(next.products[index]));

  const add = () => {
    let id = "nueva-pieza"; let count = 2;
    while (draft.products.some((entry) => entry.id === id)) id = `nueva-pieza-${count++}`;
    update((next) => { next.products.push({ id, name: "Nueva pieza", category, line: next.lines[0]?.slug ?? "", gender: "unisex", price: 1000, art: "bag", isNew: true, description: "", details: [], colors: [{ name: "Nero", hex: "#1b1917" }] }); });
    setQuery(""); setSelected(id);
  };
  const duplicate = () => {
    if (!product) return;
    let id = `${product.id}-copia`; let count = 2;
    while (draft.products.some((entry) => entry.id === id)) id = `${product.id}-copia-${count++}`;
    update((next) => { next.products.splice(index + 1, 0, { ...clone(product), id, name: `${product.name} (copia)` }); });
    setSelected(id);
  };
  /** Mueve la pieza una posición dentro de su categoría (el orden es el de la cuadrícula). */
  const shift = (direction: -1 | 1) => update((next) => {
    const siblings = next.products.map((entry, at) => ({ entry, at })).filter(({ entry }) => entry.category === next.products[index].category);
    const place = siblings.findIndex(({ at }) => at === index);
    const other = siblings[place + direction];
    if (other) [next.products[index], next.products[other.at]] = [next.products[other.at], next.products[index]];
  });

  return (
    <>
      <div className="at-head">
        <div><h2>Productos</h2><p className="muted">El orden de la lista es el orden en la cuadrícula de la categoría. «Grande» hace que la pieza ocupe 2×2.</p></div>
        <button className="at-btn at-btn-solid" onClick={add}>+ Pieza</button>
      </div>
      <div className="at-products">
        <div className="at-list">
          <div className="at-row">
            <Pick label="Categoría" value={category} onChange={(value) => { setCategory(value); setQuery(""); }} options={draft.categories.map((entry): [string, string] => [entry.slug, entry.name])} />
            <Text label="Buscar" value={query} onChange={setQuery} placeholder="Nombre de la pieza" />
          </div>
          {visible.length === 0 && <p className="muted">No hay piezas aquí todavía.</p>}
          <ul>
            {visible.map((entry) => (
              <li key={entry.id}>
                <button className={`at-item ${entry.id === selected ? "is-active" : ""}`} onClick={() => setSelected(entry.id)}>
                  <span className="at-item-art">{entry.colors[0]?.images?.[0] ? <img src={entry.colors[0].images[0]} alt="" /> : <Art kind={entry.art} color={entry.colors[0]} />}</span>
                  <span className="at-item-name">{entry.name}{entry.big && <em>2×2</em>}</span>
                  <span className="muted">{formatPrice(entry.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {product ? (
          <section className="at-card at-product" key={index}>
            <div className="at-tools">
              <button type="button" onClick={() => shift(-1)} aria-label="Subir en la cuadrícula">↑</button>
              <button type="button" onClick={() => shift(1)} aria-label="Bajar en la cuadrícula">↓</button>
              <button type="button" onClick={duplicate}>Duplicar</button>
              <button type="button" className="is-danger" onClick={() => { if (window.confirm(`¿Eliminar «${product.name}»?`)) { update((next) => { next.products.splice(index, 1); }); setSelected(null); } }}>Eliminar</button>
            </div>
            <div className="at-row">
              <Text label="Nombre" value={product.name} onChange={(value) => set((entry) => { entry.name = value; })} />
              <Field label="Precio ($ del juego)"><input type="number" min={1} step={1} value={product.price} onChange={(event) => set((entry) => { entry.price = Math.round(Number(event.target.value)) || 0; })} /></Field>
            </div>
            <Field label="Identificador (URL)" hint={`La pieza se abre en /producto/${product.id}`}>
              <input value={product.id} onChange={(event) => { const id = slugify(event.target.value); set((entry) => { entry.id = id; }); setSelected(id); }} />
            </Field>
            <div className="at-row">
              <Pick label="Categoría" value={product.category} onChange={(value) => set((entry) => { entry.category = value; })} options={draft.categories.map((entry): [string, string] => [entry.slug, entry.name])} />
              <Pick label="Colección" value={product.line} onChange={(value) => set((entry) => { entry.line = value; })} options={[["", "Sin colección"], ...draft.lines.map((entry): [string, string] => [entry.slug, entry.name])]} />
              <Pick label="Para" value={product.gender} onChange={(value) => set((entry) => { entry.gender = value as Gender; })} options={GENDERS} />
            </div>
            <div className="at-row">
              <Check label="Etiqueta «Nuevo»" checked={Boolean(product.isNew)} onChange={(checked) => set((entry) => { entry.isNew = checked; })} />
              <Check label="Grande (2×2) en su categoría" checked={Boolean(product.big)} onChange={(checked) => set((entry) => { entry.big = checked; })} />
            </div>
            <Area label="Descripción" value={product.description} onChange={(value) => set((entry) => { entry.description = value; })} />
            <Area label="Detalles" hint="Uno por línea." value={product.details.join("\n")} onChange={(value) => set((entry) => { entry.details = value.split("\n"); })} />
            <Text label="Tallas" hint="Separadas por comas. Déjalo vacío si la pieza no tiene tallas." value={(product.sizes ?? []).join(", ")} onChange={(value) => set((entry) => { entry.sizes = value.split(",").map((size) => size.trimStart()); if (!value.trim()) delete entry.sizes; })} />

            <h3>Colores e imágenes</h3>
            <p className="muted">Cada color puede tener sus fotos: la primera se ve en las cuadrículas y todas en la ficha. Sin fotos se dibuja la ilustración.</p>
            <Pick label="Ilustración (cuando no hay fotos)" value={product.art} onChange={(value) => set((entry) => { entry.art = value as ArtKind; })} options={ART_KINDS.map((kind): [string, string] => [kind, ART_NAMES[kind]])} />
            {product.colors.map((color, position) => {
              const setColor = (change: (entry: ProductColor) => void) => set((entry) => change(entry.colors[position]));
              return (
                <div key={position} className="at-sub at-color">
                  <span className="at-item-art">{color.images?.[0] ? <img src={color.images[0]} alt="" /> : <Art kind={product.art} color={color} />}</span>
                  <div>
                    <div className="at-row">
                      <Text label="Nombre del color" value={color.name} onChange={(value) => setColor((entry) => { entry.name = value; })} />
                      <Field label="Color"><input type="color" value={color.hex} onChange={(event) => setColor((entry) => { entry.hex = event.target.value; })} /></Field>
                      <Check label="Con monograma" checked={Boolean(color.monogram)} onChange={(checked) => setColor((entry) => { entry.monogram = checked; })} />
                    </div>
                    <Images label="Fotos de este color" multiple value={color.images ?? []} onChange={(urls) => setColor((entry) => { entry.images = urls; })} />
                    <div className="at-tools">
                      <button type="button" onClick={() => set((entry) => move(entry.colors, position, -1))} aria-label="Subir color">↑</button>
                      <button type="button" onClick={() => set((entry) => move(entry.colors, position, 1))} aria-label="Bajar color">↓</button>
                      {product.colors.length > 1 && <button type="button" className="is-danger" onClick={() => set((entry) => { entry.colors.splice(position, 1); })}>Quitar color</button>}
                    </div>
                  </div>
                </div>
              );
            })}
            <button type="button" className="at-btn" onClick={() => set((entry) => { entry.colors.push({ name: `Color ${entry.colors.length + 1}`, hex: "#c9ab72" }); })}>+ Color</button>
          </section>
        ) : <p className="at-card muted at-empty">Elige una pieza de la lista para editarla, o crea una nueva.</p>}
      </div>
    </>
  );
}

export default function Atelier() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [admin, setAdmin] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    document.title = "Atelier — Sessanta Nove";
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);
  const userId = session?.user.id;
  useEffect(() => {
    setAdmin(undefined);
    if (!userId) return;
    void supabase.rpc("sn_is_admin").then(({ data, error }) => setAdmin(!error && data === true));
  }, [userId]);

  if (session === undefined || (session && admin === undefined)) return <main className="page page-center"><span className="spinner" /></main>;
  if (!session) return <Login />;
  if (!admin) {
    return (
      <main className="at-login">
        <div>
          <h1>Sin acceso</h1>
          <p className="muted">La cuenta {session.user.email} no está autorizada para editar la tienda.</p>
          <button className="btn btn-outline btn-block" onClick={() => void supabase.auth.signOut()}>Cerrar sesión</button>
        </div>
      </main>
    );
  }
  return <Editor session={session} />;
}
