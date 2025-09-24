import type { Product } from "./firebase";

export type ProductIdentifier = Pick<Product, "id" | "docId" | "name"> & {
  id?: string | number;
};

export function slugify(input: string | null | undefined): string {
  if (!input) {
    return "";
  }

  return input
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  if (!Number.isFinite(value)) {
    return "COP 0";
  }

  try {
    return copFormatter.format(value);
  } catch {
    return `COP ${value}`;
  }
}

export function getProductSlug(product: ProductIdentifier | null | undefined): string {
  if (!product) {
    return "";
  }

  const rawId =
    product.docId ??
    (product.id === undefined || product.id === null ? undefined : String(product.id));
  const trimmedId = rawId ? rawId.trim() : undefined;
  const nameSlug = slugify(product.name ?? "");

  if (trimmedId && nameSlug) {
    return `${nameSlug}__${trimmedId}`;
  }

  if (trimmedId) {
    return trimmedId;
  }

  return nameSlug;
}

export function extractProductId(slug: string | null | undefined): string {
  if (!slug) {
    return "";
  }

  const marker = slug.lastIndexOf("__");
  if (marker >= 0) {
    return slug.slice(marker + 2);
  }

  return slug;
}
