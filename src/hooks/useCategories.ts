"use client";

import { useEffect, useState } from "react";
import { mapCategoryDocument, subscribeToCategories, type Category as RemoteCategory } from "@/lib/firebase";
import type { CategoryIconKey } from "@/components/icons";
import { DEFAULT_CATEGORIES } from "@/lib/store";

type CategorySummary = { name: string; iconKey: CategoryIconKey };

interface UseCategoriesResult {
  categories: CategorySummary[];
  loading: boolean;
  error: string | null;
}

const normalizeCategory = (category: RemoteCategory | null): CategorySummary | null => {
  if (!category || !category.name) {
    return null;
  }

  const iconKey = (category.icon as CategoryIconKey) || "gear";
  return { name: category.name, iconKey };
};

const cloneFallbackCategories = (): CategorySummary[] =>
  DEFAULT_CATEGORIES.map((category) => ({ ...category }));

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<CategorySummary[]>(() => cloneFallbackCategories());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToCategories(
      (snapshot) => {
        const docs = snapshot.docs
          .map((document: unknown) => mapCategoryDocument(document as any))
          .filter(Boolean)
          .map((category: RemoteCategory | null) => normalizeCategory(category))
          .filter(Boolean) as CategorySummary[];

        const nextCategories = docs.length > 0 ? docs : cloneFallbackCategories();

        setCategories(nextCategories);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(err?.message ?? "No pudimos cargar las categorias.");
        setCategories(cloneFallbackCategories());
      }
    );

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  return { categories, loading, error };
}
