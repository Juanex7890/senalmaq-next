import type { Metadata } from "next";
import { CategoryPageClient } from "./CategoryPageClient";
import { findCategoryBySlug, listProducts } from "@/lib/firebase";
import { slugify } from "@/lib/utils";
import { STORE } from "@/lib/store";

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const slug = params.slug;
  const [category, products] = await Promise.all([
    findCategoryBySlug(slug),
    listProducts(),
  ]);

  const categoryName = category?.name ?? humanizeSlug(slug);

  const descriptionSource = products
    .filter((product) => slugify(product.category) === slug)
    .map((product) => product.description)
    .find((text) => Boolean(text?.trim())) ?? `Explora ${categoryName} en ${STORE.name}.`;

  const description = descriptionSource.replace(/\s+/g, " ").trim().slice(0, 150);

  return {
    title: `${categoryName} | ${STORE.name}`,
    description,
    openGraph: {
      title: `${categoryName} | ${STORE.name}`,
      description,
      url: `https://senalmaq.com/c/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = params.slug;
  const [category, products] = await Promise.all([
    findCategoryBySlug(slug),
    listProducts(),
  ]);

  const categoryName = category?.name ?? humanizeSlug(slug);
  const initialProducts = products.filter((product) => slugify(product.category) === slug);

  return (
    <CategoryPageClient
      slug={slug}
      categoryName={categoryName}
      initialProducts={initialProducts}
    />
  );
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    || "Categoría";
}
