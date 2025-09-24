import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById, type Product } from "@/lib/firebase";
import { extractProductId, formatCOP, slugify } from "@/lib/utils";
import { STORE } from "@/lib/store";
import ProductDetailActions from "@/components/ProductDetailActions";

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await loadProduct(params.id);
  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const normalizedDescription = (product.description || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);

  const title = `${product.name} | ${STORE.name}`;
  const description = normalizedDescription || "Descubre más en Senalmaq.";
  const url = `https://senalmaq.com/product/${params.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: product.image ? [{ url: product.image, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await loadProduct(params.id);
  if (!product) {
    notFound();
  }

  const categorySlug = product.category ? `/c/${slugify(product.category)}` : "/";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        <div className="relative w-full aspect-[4/3] rounded-2xl bg-white shadow p-4">
          <Image
            src={product.image || "/images/default.png"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 640px"
            className="object-contain"
          />
        </div>
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Descripción</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-green-800">{product.name}</h1>
          <Link href={categorySlug} className="text-sm text-green-700 hover:underline">
            {product.category || "Ver catálogo"}
          </Link>
        </div>
        <div className="text-3xl font-extrabold text-green-700">
          {formatCOP(product.price)}
        </div>
        <ProductDetailActions product={product} />
        <div className="text-sm text-gray-600">
          <p>¿Deseas asesoría? Escríbenos y uno de nuestros especialistas te ayudará a elegir.</p>
          <a
            href={`${STORE.whatsapp}?text=${encodeURIComponent(`Hola, me interesa ${product.name}.`)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center justify-center bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg"
          >
            Consultar por WhatsApp
          </a>
        </div>
        <div className="text-xs text-gray-500">
          <p>SKU: {product.docId || product.id}</p>
          <p>Disponibilidad sujeta a confirmación.</p>
        </div>
      </div>
    </div>
  );
}

async function loadProduct(slug: string): Promise<Product | null> {
  const id = extractProductId(slug);
  if (!id) {
    return null;
  }
  const product = await getProductById(id);
  if (!product) {
    return null;
  }
  return {
    ...product,
    docId: product.docId || id,
    id: product.id || id,
    image: product.imageUrl || product.image,
  };
}
