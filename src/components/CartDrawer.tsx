"use client";

import Image from "next/image";
import { useCart } from "@/components/providers/CartProvider";
import { formatCOP } from "@/lib/utils";

export interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    items,
    subtotal,
    shipping,
    total,
    increase,
    decrease,
    remove,
    clear,
    whatsappLink,
  } = useCart();

  if (!open) {
    return null;
  }

  const hasItems = items.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-3">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-bold text-green-800">Carrito</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scroll-smooth px-4 py-3">
          {!hasItems ? (
            <p className="text-sm text-gray-600">Tu carrito está vacío.</p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const key = toKey(item);
                return (
                  <div
                    key={key}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-200 rounded-lg p-3 bg-white"
                  >
                    <div className="flex w-full sm:w-48 flex-col items-start gap-2 min-w-0">
                      <div className="relative h-14 w-14 rounded-lg border border-gray-200 bg-gray-50">
                        <Image
                          src={item.image || "/images/default.png"}
                          alt={item.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm font-semibold text-green-800 truncate w-full">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex w-full sm:w-auto items-center justify-start sm:justify-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => decrease(key)}
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="min-w-[2.5rem] text-center text-sm font-semibold text-gray-700">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => increase(key)}
                        className="h-8 w-8 flex items-center justify-center rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex w-full sm:w-28 flex-col items-end text-right">
                      <span className="text-base font-semibold text-green-600">
                        {formatCOP(item.price * item.qty)}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(key)}
                        className="mt-1 text-xs text-red-500 hover:text-red-600"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t bg-gray-50 space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{formatCOP(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Envio</span>
            <span className="font-semibold">
              {shipping === 0 ? "Gratis" : formatCOP(shipping)}
            </span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-green-700">
            <span>Total</span>
            <span className="text-lg font-bold text-green-700">{formatCOP(total)}</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 min-w-[200px] bg-green-700 hover:bg-green-800 text-white text-center py-2 rounded-lg"
            >
              Finalizar por WhatsApp
            </a>
            {hasItems && (
              <button
                type="button"
                onClick={clear}
                className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700"
              >
                Vaciar carrito
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-green-200 text-green-700"
            >
              Seguir comprando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const toKey = (product: { id?: string | number; docId?: string }) =>
  (product.docId || product.id || "").toString();

export default CartDrawer;
