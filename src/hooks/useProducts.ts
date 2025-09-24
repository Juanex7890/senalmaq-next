"use client";

import { useEffect, useState } from "react";
import { mapProductDocument, subscribeToProducts, type Product } from "@/lib/firebase";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToProducts(
      (snapshot) => {
        const nextProducts = snapshot.docs
          .map((document: unknown) => mapProductDocument(document as any))
          .filter(Boolean) as Product[];

        nextProducts.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

        setProducts(nextProducts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setProducts([]);
        setLoading(false);
        setError(err?.message ?? "No pudimos cargar los productos.");
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return { products, loading, error };
}
