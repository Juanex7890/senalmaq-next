"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/components/providers/CartProvider";
import { formatCOP, getProductSlug, slugify } from "@/lib/utils";
import type { Product } from "@/lib/firebase";

interface CategoryPageClientProps {
  slug: string;
  categoryName: string;
  initialProducts: Product[];
}

export function CategoryPageClient({ slug, categoryName, initialProducts }: CategoryPageClientProps) {
  const { products: liveProducts, loading, error } = useProducts();
  const { addItem, buyNow } = useCart();

  const products = liveProducts.length > 0 ? liveProducts : initialProducts;

  const filteredProducts = useMemo(
    () => products.filter((product) => slugify(product.category) === slug),
    [products, slug]
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-4">
      <header className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-green-800 tracking-tight">{categoryName}</h1>
        <div className="flex justify-center">
          <span className="inline-block h-1 w-16 rounded bg-green-500" />
        </div>
      </header>

      {loading && (
        <div className="rounded-2xl bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow">
          Cargando productos...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl bg-red-100 p-6 text-center text-sm font-semibold text-red-700 shadow">
          {error}
        </div>
      )}

      {!loading && !error && filteredProducts.length === 0 && (
        <div className="rounded-2xl bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow">
          No hay productos disponibles en esta categoría por el momento.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <CategoryProductCard
            key={product.docId || product.id}
            product={product}
            onAdd={addItem}
            onBuy={buyNow}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onBuy: (product: Product) => void;
}

function CategoryProductCard({ product, onAdd, onBuy }: CategoryProductCardProps) {
  const slug = getProductSlug(product);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col transition-transform duration-200 ease-out hover:-translate-y-[2px] hover:shadow-xl">
      <div className="relative w-full aspect-[4/3] mb-2 rounded-lg overflow-hidden bg-gray-50 shadow-sm flex items-center justify-center">
        <Image
          src={product.image || "/images/default.png"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-contain"
        />
        <Link
          href={`/product/${slug}`}
          className="absolute inset-0 focus:outline-none"
          aria-label={`Ver más de ${product.name}`}
        >
          <span className="absolute inset-0 bg-black/0 hover:bg-black/25 transition-colors pointer-events-none" />
        </Link>
      </div>
      <h3 className="font-bold text-green-800 text-lg truncate">{product.name}</h3>
      <div className="text-green-700 font-extrabold text-xl">{formatCOP(product.price)}</div>
      <p className="text-sm text-gray-600 mt-1 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
        {product.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="bg-green-600 text-white hover:bg-green-700 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200"
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          onClick={() => onBuy(product)}
          className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
}

export default CategoryPageClient;
