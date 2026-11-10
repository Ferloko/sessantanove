import { lazy, Suspense, useEffect } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { Footer, Header } from "./components/Chrome";
import { MonogramDefs } from "./components/MonogramDefs";
import { CartProvider } from "./lib/cart";
import { isPreviewing, loadPublishedContent, stopPreview, useContentVersion } from "./lib/content";
import { Checkout, PaymentResult, SimulatedPayment } from "./pages/Pay";
import { Collection, Favorites, Home, ProductPage } from "./pages/Shop";

// El modo Creador se descarga solo cuando se entra en /atelier.
const Atelier = lazy(() => import("./pages/Atelier"));

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, [location]);
  return null;
}

export function NotFound() {
  return (
    <main className="page page-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="display">Esta página no existe</h1>
      <Link href="/coleccion" className="btn btn-outline">Volver a la colección</Link>
    </main>
  );
}

function PreviewBar() {
  return (
    <div className="preview-bar" role="status">
      <span>Vista previa del borrador — aún no está publicado</span>
      <Link href="/atelier">Volver al Creador</Link>
      <button onClick={stopPreview}>Salir de la vista previa</button>
    </div>
  );
}

export default function App() {
  const version = useContentVersion();
  const [location] = useLocation();
  useEffect(() => { void loadPublishedContent(); }, []);

  if (location.startsWith("/atelier")) {
    return <><MonogramDefs /><Suspense fallback={<main className="page page-center"><span className="spinner" /></main>}><Atelier /></Suspense></>;
  }

  return (
    <CartProvider>
      <ScrollToTop />
      <MonogramDefs />
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Header />
      <div id="contenido" key={version}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/coleccion">{() => <Collection key="todo" />}</Route>
          <Route path="/coleccion/:slug">{(params) => <Collection key={params.slug} category={params.slug} />}</Route>
          <Route path="/linea/:slug/:gender?">{(params) => <Collection key={`${params.slug}-${params.gender}`} line={params.slug} gender={params.gender} />}</Route>
          <Route path="/mujer">{() => <Collection key="mujer" gender="mujer" />}</Route>
          <Route path="/hombre">{() => <Collection key="hombre" gender="hombre" />}</Route>
          <Route path="/producto/:id">{(params) => <ProductPage id={params.id} key={params.id} />}</Route>
          <Route path="/favoritos" component={Favorites} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/pago/resultado" component={PaymentResult} />
          <Route path="/pago/simulado" component={SimulatedPayment} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
      {isPreviewing() && <PreviewBar />}
    </CartProvider>
  );
}
