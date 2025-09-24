"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Product } from "@/lib/firebase";
import { formatCOP } from "@/lib/utils";
import { STORE } from "@/lib/store";

export interface CartItem extends Product {
  qty: number;
}

export interface CartContextValue {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  addItem: (product: Product) => void;
  buyNow: (product: Product) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  whatsappLink: string;
  whatsappMessage: string;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const SHIPPING_THRESHOLD = 300_000;
const SHIPPING_COST = 12_000;

const toKey = (product: Product) => (product.docId || product.id || "").toString();

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((previous) => {
      const key = toKey(product);
      const index = previous.findIndex((entry) => toKey(entry) === key);
      if (index === -1) {
        return [...previous, { ...product, qty: 1 }];
      }
      const next = [...previous];
      next[index] = { ...next[index], qty: next[index].qty + 1 };
      return next;
    });
  }, []);

  const buyNow = useCallback((product: Product) => {
    setItems((previous) => {
      const key = toKey(product);
      const index = previous.findIndex((entry) => toKey(entry) === key);
      if (index === -1) {
        return [...previous, { ...product, qty: 1 }];
      }
      return previous;
    });
  }, []);

  const increase = useCallback((id: string) => {
    setItems((previous) =>
      previous.map((entry) =>
        toKey(entry) === id ? { ...entry, qty: entry.qty + 1 } : entry
      )
    );
  }, []);

  const decrease = useCallback((id: string) => {
    setItems((previous) =>
      previous.flatMap((entry) => {
        if (toKey(entry) !== id) {
          return entry;
        }
        if (entry.qty <= 1) {
          return [];
        }
        return { ...entry, qty: entry.qty - 1 };
      })
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((previous) => previous.filter((entry) => toKey(entry) !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, entry) => sum + entry.price * entry.qty, 0),
    [items]
  );

  const shipping = subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  const whatsappMessage = useMemo(() => {
    if (items.length === 0) {
      return "Quiero hacer un pedido (carrito vacío).";
    }
    const lines = items.map((entry) =>
      ` ${entry.name} x${entry.qty} – ${formatCOP(entry.price * entry.qty)}`
    );
    const message = [
      ` *Nuevo pedido* – ${STORE.name}`,
      "",
      ...lines,
      "",
      `Subtotal: ${formatCOP(subtotal)}`,
      `Envio: ${shipping === 0 ? "Gratis" : formatCOP(shipping)}`,
      `Total: ${formatCOP(total)}`,
      "",
      "Direccion: (escribe tu direccion)",
      "Telefono: (tu telefono)",
      "Email: (tu email)",
    ].join("\n");
    return message;
  }, [items, shipping, subtotal, total]);

  const whatsappLink = `${STORE.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      subtotal,
      shipping,
      total,
      addItem,
      buyNow,
      increase,
      decrease,
      remove,
      clear,
      whatsappLink,
      whatsappMessage,
    }),
    [
      items,
      subtotal,
      shipping,
      total,
      addItem,
      buyNow,
      increase,
      decrease,
      remove,
      clear,
      whatsappLink,
      whatsappMessage,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
