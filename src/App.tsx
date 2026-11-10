import { useEffect } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { Footer, Header } from "./components/Chrome";
import { MonogramDefs } from "./components/MonogramDefs";
import { CartProvider } from "./lib/cart";
import { Checkout, PaymentResult, SimulatedPayment } from "./pages/Pay";
import { Collection, Favorites, Home, ProductPage } from "./pages/Shop";

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

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <MonogramDefs />
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <Header />
      <div id="contenido">
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
    </CartProvider>
  );
}
