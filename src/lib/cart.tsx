import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "../../shared/catalog";
import { useContentVersion } from "./content";

export interface CartLine { id: string; color: string; size?: string; qty: number }
export interface CartEntry extends CartLine { product: Product; key: string }

interface CartValue {
  entries: CartEntry[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (id: string, color: string, size?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  wishlist: string[];
  toggleWish: (id: string) => void;
}

const STORAGE_KEY = "sn_bag";
const WISH_KEY = "sn_wishlist";
const MAX_QTY = 10;
const keyOf = (line: CartLine) => `${line.id}::${line.color}::${line.size ?? ""}`;
const CartContext = createContext<CartValue | null>(null);

function load(): CartLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((line) => getProduct(line?.id)?.colors.some((color) => color.name === line.color) && Number.isInteger(line?.qty) && line.qty > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(load);
  const [open, setOpen] = useState(false);
  const version = useContentVersion();
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(WISH_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((id) => getProduct(id)) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    try { localStorage.setItem(WISH_KEY, JSON.stringify(wishlist)); } catch { /* almacenamiento no disponible */ }
  }, [wishlist]);
  const toggleWish = useCallback((id: string) => setWishlist((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id])), []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* almacenamiento no disponible */ }
  }, [lines]);

  const add = useCallback((id: string, color: string, size?: string) => {
    setLines((current) => {
      const key = keyOf({ id, color, size, qty: 1 });
      if (current.some((line) => keyOf(line) === key)) return current.map((line) => (keyOf(line) === key ? { ...line, qty: Math.min(MAX_QTY, line.qty + 1) } : line));
      return [...current, { id, color, size, qty: 1 }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setLines((current) => (qty < 1 ? current.filter((line) => keyOf(line) !== key) : current.map((line) => (keyOf(line) === key ? { ...line, qty: Math.min(MAX_QTY, qty) } : line))));
  }, []);
  const remove = useCallback((key: string) => setLines((current) => current.filter((line) => keyOf(line) !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartValue>(() => {
    const entries = lines.flatMap((line) => {
      const product = getProduct(line.id);
      return product?.colors.some((color) => color.name === line.color) ? [{ ...line, product, key: keyOf(line) }] : [];
    });
    return {
      entries,
      count: entries.reduce((sum, entry) => sum + entry.qty, 0),
      total: entries.reduce((sum, entry) => sum + entry.qty * entry.product.price, 0),
      open, setOpen, add, setQty, remove, clear, wishlist, toggleWish,
    };
  }, [lines, open, add, setQty, remove, clear, wishlist, toggleWish, version]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart fuera de CartProvider");
  return value;
}

/** Pedido a la espera de confirmación de pago (se guarda para sobrevivir a la redirección a Fleeca). */
export interface PendingOrder { ref: string; total: number; paymentId: string; order: string }
const PENDING_KEY = "sn_pending";
export const savePending = (pending: PendingOrder) => { try { localStorage.setItem(PENDING_KEY, JSON.stringify(pending)); } catch { /* noop */ } };
export const clearPending = () => { try { localStorage.removeItem(PENDING_KEY); } catch { /* noop */ } };
export function loadPending(): PendingOrder | null {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) ?? "null"); } catch { return null; }
}
