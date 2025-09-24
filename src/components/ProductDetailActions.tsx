"use client";

import { useCart } from "@/components/providers/CartProvider";
import type { Product } from "@/lib/firebase";
import { getProductSlug } from "@/lib/utils";
import Link from "next/link";

interface ProductDetailActionsProps {
  product: Product;
}

export default function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const { addItem, buyNow } = useCart();
  const slug = getProductSlug(product);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addItem(product)}
          className="flex-1 min-w-[160px] bg-green-600 text-white hover:bg-green-700 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg"
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          onClick={() => buyNow(product)}
          className="flex-1 min-w-[160px] bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg"
        >
          Comprar ahora
        </button>
      </div>
      <Link
        href={`/product/${slug}`}
        className="text-xs text-green-700 hover:underline"
      >
        Comparte este producto con tus clientes
      </Link>
    </div>
  );
}
