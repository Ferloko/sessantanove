import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { DELIVERY_METHODS, formatPrice, type DeliveryMethod } from "../../shared/catalog";
import { ProductPlate } from "../components/ProductArt";
import { clearPending, loadPending, savePending, useCart } from "../lib/cart";

async function post<T>(path: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new Error("Sin conexión con la boutique. Comprueba tu red e inténtalo de nuevo.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error ?? "Algo no ha ido bien. Inténtalo de nuevo.");
  return data as T;
}

export function Checkout() {
  const { entries, total } = useCart();
  const [delivery, setDelivery] = useState<DeliveryMethod>("boutique");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { document.title = "Finalizar compra — Sessanta Nove"; }, []);

  if (entries.length === 0) {
    return (
      <main className="page page-center">
        <span className="eyebrow">Finalizar compra</span>
        <h1 className="display">Tu bolsa está vacía</h1>
        <Link href="/coleccion" className="btn btn-outline">Descubrir la colección</Link>
      </main>
    );
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const result = await post<{ ref: string; total: number; paymentId: string; paymentUrl: string; order: string }>("/api/checkout", {
        items: entries.map(({ id, color, size, qty }) => ({ id, color, size, qty })),
        customer: { name: form.get("name"), phone: form.get("phone"), delivery, address: form.get("address"), notes: form.get("notes") },
      });
      savePending({ ref: result.ref, total: result.total, paymentId: result.paymentId, order: result.order });
      window.location.assign(result.paymentUrl);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "No pudimos iniciar el pago.");
      setBusy(false);
    }
  };

  return (
    <main className="page">
      <header className="page-head">
        <span className="eyebrow">Paso final</span>
        <h1 className="display">Finalizar compra</h1>
      </header>
      <div className="checkout">
        <form className="checkout-form" onSubmit={submit}>
          <h2 className="form-title">Tus datos</h2>
          <label className="field">
            <span>Nombre y apellido</span>
            <input name="name" required minLength={3} maxLength={60} autoComplete="name" />
          </label>
          <label className="field">
            <span>Teléfono</span>
            <input name="phone" required inputMode="tel" pattern="[0-9+\-\s]{3,20}" maxLength={20} title="Solo números" autoComplete="tel" />
          </label>

          <h2 className="form-title">Entrega</h2>
          <div className="radios" role="radiogroup" aria-label="Método de entrega">
            {DELIVERY_METHODS.map((method) => (
              <label key={method.id} className={`radio ${delivery === method.id ? "is-active" : ""}`}>
                <input type="radio" name="delivery" value={method.id} checked={delivery === method.id} onChange={() => setDelivery(method.id)} />
                <span><strong>{method.label}</strong><small>{method.note}</small></span>
              </label>
            ))}
          </div>
          {delivery === "domicilio" && (
            <label className="field">
              <span>Dirección de entrega</span>
              <input name="address" required minLength={4} maxLength={120} autoComplete="street-address" />
            </label>
          )}
          <label className="field">
            <span>Notas para tu asesor <em>(opcional)</em></span>
            <textarea name="notes" rows={3} maxLength={300} />
          </label>

          {error && <p className="notice notice-error" role="alert">{error}</p>}
          <button className="btn btn-solid btn-block" disabled={busy}>{busy ? "Conectando con Fleeca…" : `Pagar ${formatPrice(total)} con Fleeca`}</button>
          <p className="muted small">Serás redirigido a la pasarela de Fleeca Bank para autorizar el pago. El pedido se confirma al volver.</p>
        </form>

        <aside className="summary" aria-label="Resumen del pedido">
          <h2 className="form-title">Tu pedido</h2>
          <ul>
            {entries.map((entry) => (
              <li key={entry.key} className="summary-line">
                <ProductPlate product={entry.product} color={entry.color} />
                <div>
                  <span>{entry.product.name}</span>
                  <span className="muted small">{[entry.color, entry.size && `Talla ${entry.size}`, `Cantidad ${entry.qty}`].filter(Boolean).join(" · ")}</span>
                </div>
                <span>{formatPrice(entry.product.price * entry.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row"><span>Entrega</span><span>Cortesía de la Maison</span></div>
          <div className="summary-row summary-total"><span>Total</span><span>{formatPrice(total)}</span></div>
        </aside>
      </div>
    </main>
  );
}

interface StatusResponse {
  status: "paid" | "pending" | "failed";
  ref: string;
  total: number;
  sandbox: boolean;
  lines: { id: string; name: string; color: string; size?: string; qty: number; unit: number }[];
  customer: { name: string; delivery: DeliveryMethod };
}
const RECEIPT_KEY = "sn_receipt";
const POLL_MS = 15000; // Fleeca limita a 10 consultas por minuto: se sondea despacio.
const MAX_POLLS = 8;

export function PaymentResult() {
  const { clear } = useCart();
  const [state, setState] = useState<{ phase: "checking" | "paid" | "pending" | "failed" | "missing" | "error"; data?: StatusResponse; message?: string }>({ phase: "checking" });
  const polls = useRef(0);
  const started = useRef(false);
  const timer = useRef<number | undefined>(undefined);

  const check = useCallback(async () => {
    window.clearTimeout(timer.current);
    const pending = loadPending();
    if (!pending) {
      let receipt: StatusResponse | null = null;
      try { receipt = JSON.parse(sessionStorage.getItem(RECEIPT_KEY) ?? "null"); } catch { /* noop */ }
      setState(receipt ? { phase: "paid", data: receipt } : { phase: "missing" });
      return;
    }
    const returned = new URLSearchParams(window.location.search).get("payment_id");
    if (returned && returned !== pending.paymentId) { setState({ phase: "missing" }); return; }
    try {
      const data = await post<StatusResponse>("/api/order-status", { order: pending.order, announce: true });
      if (data.status === "paid") {
        try { sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(data)); } catch { /* noop */ }
        clearPending();
        clear();
        setState({ phase: "paid", data });
      } else if (data.status === "failed") {
        setState({ phase: "failed", data });
      } else {
        setState({ phase: "pending", data });
        if (++polls.current < MAX_POLLS) timer.current = window.setTimeout(check, POLL_MS);
      }
    } catch (problem) {
      setState({ phase: "error", message: problem instanceof Error ? problem.message : undefined });
    }
  }, [clear]);

  useEffect(() => {
    document.title = "Tu pedido — Sessanta Nove";
    if (!started.current) { started.current = true; void check(); }
    return () => window.clearTimeout(timer.current);
  }, [check]);

  const { phase, data } = state;
  return (
    <main className="page page-center" aria-live="polite">
      {phase === "checking" && <><span className="spinner" aria-hidden="true" /><h1 className="display">Confirmando tu pago…</h1><p className="muted">Estamos consultando a Fleeca Bank.</p></>}

      {phase === "paid" && data && (
        <>
          <span className="eyebrow">Pedido {data.ref}</span>
          <h1 className="display">Grazie, {data.customer.name.split(" ")[0]}</h1>
          <p className="lead">Hemos recibido tu pago de {formatPrice(data.total)}. Un asesor de la Maison te contactará para {data.customer.delivery === "domicilio" ? "concertar la entrega" : "avisarte cuando puedas recoger tu pedido"}.</p>
          {data.sandbox && <p className="notice">Pago de prueba: no se ha movido dinero real.</p>}
          <ul className="receipt">
            {data.lines.map((line) => (
              <li key={`${line.id}-${line.color}-${line.size}`}><span>{line.qty} × {line.name} · {[line.color, line.size && `Talla ${line.size}`].filter(Boolean).join(" · ")}</span><span>{formatPrice(line.unit * line.qty)}</span></li>
            ))}
            <li className="receipt-total"><span>Total pagado</span><span>{formatPrice(data.total)}</span></li>
          </ul>
          <p className="muted small">Guarda tu número de pedido: {data.ref}</p>
          <Link href="/coleccion" className="btn btn-outline">Seguir explorando</Link>
        </>
      )}

      {phase === "pending" && (
        <>
          <span className="eyebrow">Pedido {data?.ref}</span>
          <h1 className="display">Pago pendiente</h1>
          <p className="lead">Fleeca todavía no ha confirmado el pago. Si acabas de autorizarlo, puede tardar unos instantes; esta página lo comprueba sola.</p>
          <button className="btn btn-solid" onClick={() => { setState({ phase: "checking" }); void check(); }}>Comprobar ahora</button>
          <Link href="/checkout" className="link-underline">Volver a la compra</Link>
        </>
      )}

      {phase === "failed" && (
        <>
          <span className="eyebrow">Pedido {data?.ref}</span>
          <h1 className="display">El pago no se completó</h1>
          <p className="lead">No se ha realizado ningún cargo. Tu bolsa sigue intacta para que puedas intentarlo de nuevo.</p>
          <Link href="/checkout" className="btn btn-solid" onClick={clearPending}>Reintentar el pago</Link>
        </>
      )}

      {phase === "missing" && (
        <>
          <h1 className="display">No encontramos tu pedido</h1>
          <p className="lead">Este dispositivo no tiene ningún pedido a la espera de confirmación. Si ya pagaste, tu asesor lo verá igualmente y te contactará.</p>
          <Link href="/coleccion" className="btn btn-outline">Ir a la colección</Link>
        </>
      )}

      {phase === "error" && (
        <>
          <h1 className="display">No pudimos comprobar el pago</h1>
          <p className="lead">{state.message ?? "Inténtalo de nuevo en unos instantes."} Tu pedido no se ha perdido.</p>
          <button className="btn btn-solid" onClick={() => { setState({ phase: "checking" }); void check(); }}>Reintentar</button>
        </>
      )}
    </main>
  );
}

/** Pasarela simulada: solo se usa cuando el servidor no tiene FLEECA_API_KEY (modo demo). */
export function SimulatedPayment() {
  const [, navigate] = useLocation();
  const paymentId = new URLSearchParams(window.location.search).get("payment_id") ?? "";
  const amount = Number(paymentId.split("_")[1]) || 0;
  useEffect(() => { document.title = "Pasarela de prueba — Sessanta Nove"; }, []);
  return (
    <main className="page page-center">
      <div className="gateway">
        <span className="gateway-badge">Modo demo · pasarela simulada</span>
        <h1>Fleeca Bank</h1>
        <p className="muted">Sessanta Nove solicita un pago de</p>
        <p className="gateway-amount">{formatPrice(amount)}</p>
        <p className="muted small">Esta pantalla sustituye a la pasarela real mientras no haya una clave de Fleeca configurada. No se mueve dinero.</p>
        <button className="btn btn-solid btn-block" onClick={() => navigate(`/pago/resultado?payment_id=${encodeURIComponent(paymentId)}`)}>Autorizar pago</button>
        <button className="btn btn-outline btn-block" onClick={() => navigate("/checkout")}>Cancelar</button>
      </div>
    </main>
  );
}
