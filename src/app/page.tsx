"use client";

import Image from "next/image";
import type { JSX } from "react";
import Link from "next/link";
import { useMemo, useState } from "react";
import HeroVideo from "@/components/HeroVideo";
import ShortsRow from "@/components/ShortsRow";
import CategoryGrid from "@/components/CategoryGrid";
import HSlider from "@/components/HSlider";
import { IconInstagram, IconTikTok, IconYouTube } from "@/components/icons";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useSocial } from "@/hooks/useSocial";
import { useCart } from "@/components/providers/CartProvider";
import { STORE } from "@/lib/store";
import { formatCOP, getProductSlug } from "@/lib/utils";
import type { Product } from "@/lib/firebase";

type SocialLink = {
  key: "instagram" | "youtube" | "tiktok";
  label: string;
  href: string;
  icon: JSX.Element;
  accentClass: string;
};

export default function HomePage() {
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { categories } = useCategories();
  const { social, loading: socialLoading, error: socialError } = useSocial();
  const { addItem, buyNow } = useCart();
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return products;
    }
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
    );
  }, [products, search]);

  const bestSellers = useMemo(
    () => products.filter((product) => Boolean(product.bestSeller)),
    [products]
  );

  const featuredCategories = categories.slice(0, 8);

  const socialLinks = createSocialLinks(social);

  const whatsappMessage = "Hola, vengo del sitio. Quiero más información.";

  return (
    <div className="flex-1">
      {socialError && (
        <div className="max-w-screen-xl mx-auto px-4 mt-4">
          <div className="rounded-2xl bg-yellow-100 px-4 py-3 text-sm font-semibold text-yellow-800 shadow">
            {socialError}
          </div>
        </div>
      )}

      <HeroVideo videoId={social.videoId} />

      <section className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow p-5 flex flex-col gap-4">
          <header className="flex items-center gap-2">
            <h3 className="font-bold text-green-800 text-lg">Síguenos</h3>
            {socialLoading && <span className="text-xs text-gray-500">Cargando...</span>}
          </header>
          <div className="flex flex-wrap gap-3">
            {socialLinks.length === 0 && !socialLoading ? (
              <p className="text-sm text-gray-600">Pronto compartiremos nuestras redes sociales.</p>
            ) : (
              socialLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold shadow border border-transparent transition-colors ${link.accentClass}`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </a>
              ))
            )}
          </div>
        </div>
      </section>

      {STORE.whatsapp && (
        <section className="max-w-screen-xl mx-auto px-4">
          <a
            href={`${STORE.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl bg-green-700 hover:bg-green-800 text-white text-center font-semibold text-base px-4 py-4 shadow-lg transition-colors"
          >
            Escríbenos por WhatsApp
          </a>
        </section>
      )}

      <ShortsRow social={social} />

      {bestSellers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-end justify-between mb-2">
            <h3 className="text-lg font-extrabold text-green-800">Las más vendidas</h3>
            <span className="text-xs font-semibold text-gray-600">Elegidas por nuestros clientes</span>
          </div>
          <HSlider>
            {bestSellers.map((product) => (
              <ProductCard key={product.docId || product.id} product={product} onAdd={addItem} onBuy={buyNow} />
            ))}
          </HSlider>
        </section>
      )}

      <section className="max-w-screen-xl mx-auto px-4 py-6">
        <h3 className="text-lg font-extrabold text-green-800 mb-3">Categorías principales</h3>
        <CategoryGrid categories={featuredCategories} className="bg-transparent" />
      </section>

      <section className="max-w-screen-xl mx-auto px-4">
        <div className="mb-4">
          <label htmlFor="home-search" className="sr-only">
            Buscar productos
          </label>
          <input
            id="home-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos..."
            className="w-full h-11 rounded-lg border border-white/70 bg-white/90 backdrop-blur-sm shadow-md shadow-black/5 ring-1 ring-black/5 hover:ring-black/10 focus:ring-2 focus:ring-green-300/40 focus:border-white/70 px-3 py-2 text-sm md:text-base outline-none placeholder:text-gray-500"
          />
        </div>
      </section>

      {productsLoading && (
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="rounded-2xl bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow">
            Cargando productos...
          </div>
        </div>
      )}

      {productsError && !productsLoading && (
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="rounded-2xl bg-red-100 p-6 text-center text-sm font-semibold text-red-700 shadow">
            {productsError}
          </div>
        </div>
      )}

      <section className="max-w-screen-xl mx-auto px-4 py-6 grid gap-6">
        <h3 className="text-lg font-extrabold text-green-800">Explora nuestro catálogo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.docId || product.id} product={product} onAdd={addItem} onBuy={buyNow} variant="grid" />
          ))}
          {!productsLoading && filteredProducts.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow">
              No encontramos resultados para "{search}".
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl p-4 shadow grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-green-800">Coser & Crecer</h2>
            <p className="mt-6 text-base text-gray-700">
              Servimos a cada cliente con excelencia e integridad para que su taller florezca, honrando a Dios al ayudarles a trabajar con orden y calidad (Col 3:23).
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href={`${STORE.whatsapp}?text=${encodeURIComponent("Hola, quisiera asesoría sobre máquinas de coser.")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-green-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-800"
              >
                Conversar por WhatsApp
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <Image
              src="/images/senalmaq.png"
              alt="Senalmaq"
              width={480}
              height={320}
              className="rounded-xl object-cover w-full h-56 md:h-72 object-center"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function createSocialLinks(social: ReturnType<typeof useSocial>["social"]): SocialLink[] {
  const links: SocialLink[] = [];
  const fallback = STORE.social;

  const instagram = (social.instagram || fallback.instagram || "").trim();
  const youtube = (social.youtube || fallback.youtube || "").trim();
  const tiktok = (social.tiktok || fallback.tiktok || "").trim();

  if (instagram) {
    links.push({
      key: "instagram",
      label: "Instagram",
      href: instagram,
      icon: <IconInstagram className="h-5 w-5" aria-hidden="true" />,
      accentClass: "bg-pink-50 hover:bg-pink-100 text-pink-700",
    });
  }

  if (youtube) {
    links.push({
      key: "youtube",
      label: "YouTube",
      href: youtube,
      icon: <IconYouTube className="h-5 w-5 text-red-600" aria-hidden="true" />,
      accentClass: "bg-red-50 hover:bg-red-100 text-red-700",
    });
  }

  if (tiktok) {
    links.push({
      key: "tiktok",
      label: "TikTok",
      href: tiktok,
      icon: <IconTikTok className="h-5 w-5" aria-hidden="true" />,
      accentClass: "bg-gray-900/90 hover:bg-black text-white",
    });
  }

  return links;
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onBuy: (product: Product) => void;
  variant?: "slider" | "grid";
}

function ProductCard({ product, onAdd, onBuy, variant = "slider" }: ProductCardProps) {
  const slug = getProductSlug(product);
  const cardClass =
    variant === "slider"
      ? "min-w-[200px] max-w-[210px] sm:min-w-[240px] sm:max-w-[260px]"
      : "w-full";

  return (
    <div
      className={`${cardClass} snap-start bg-white rounded-xl shadow-lg border border-gray-100 p-4 flex flex-col transition-transform duration-200 ease-out hover:-translate-y-[2px] hover:shadow-xl`}
    >
      <div className="relative w-full aspect-[4/3] rounded-lg bg-gray-50 overflow-hidden shadow-sm flex items-center justify-center">
        <Image
          src={product.image || "/images/default.png"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 240px"
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

      <div className="mt-2 flex-1">
        <h4 className="font-bold text-green-800 text-lg truncate">{product.name}</h4>
        <div className="text-green-700 font-extrabold text-xl">{formatCOP(product.price)}</div>
        <p className="text-sm text-gray-600 mt-1 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
          {product.description}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAdd(product)}
          className="bg-green-600 text-white hover:bg-green-700 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg transform hover:-translate-y-[2px]"
        >
          Agregar al carrito
        </button>
        <button
          type="button"
          onClick={() => onBuy(product)}
          className="bg-blue-600 text-white hover:bg-blue-700 py-2 px-4 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg transform hover:-translate-y-[2px]"
        >
          Comprar ahora
        </button>
      </div>
    </div>
  );
}
