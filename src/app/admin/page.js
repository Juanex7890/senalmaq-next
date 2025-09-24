"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { getProductsCollection } from "@/lib/firebase";
import { formatCOP } from "@/lib/utils";

const INITIAL_FORM = {
  name: "",
  price: "",
  category: "",
  description: "",
  image: "",
  bestSeller: false,
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { products } = useProducts();
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-slate-100 text-green-700">
        <div className="h-12 w-12 rounded-full border-4 border-green-200 border-t-green-600 animate-spin" />
        <p className="mt-4 text-sm font-semibold">Verificando acceso...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <h1 className="text-2xl font-bold text-green-800">Acceso restringido</h1>
        <p className="text-sm text-gray-600">Debes iniciar sesión como administrador para continuar.</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    );
  }
  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const nextValue =
      event.target instanceof HTMLInputElement && event.target.type === "checkbox"
        ? event.target.checked
        : value;

    setError(null);
    setSuccess(null);

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const collectionRef = getProductsCollection();
      const docRef = doc(collectionRef);
      const price = Number(form.price);
      await setDoc(docRef, {
        name: form.name.trim(),
        price: Number.isFinite(price) ? price : 0,
        category: form.category.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        bestSeller: form.bestSeller,
        createdAt: Date.now(),
      });
      setForm(() => ({ ...INITIAL_FORM }));
      setSuccess("Producto creado correctamente.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <section className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-extrabold text-green-800">Panel de administración</h1>
        <p className="text-sm text-gray-600">Gestiona el catálogo y destaca productos para tu tienda en linea.</p>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-green-800 mb-4">Agregar nuevo producto</h2>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Nombre
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="h-11 rounded-lg border border-gray-200 px-3 focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Precio (COP)
            <input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              min="0"
              step="100"
              required
              className="h-11 rounded-lg border border-gray-200 px-3 focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Categoría
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="h-11 rounded-lg border border-gray-200 px-3 focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Imagen (URL)
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
              className="h-11 rounded-lg border border-gray-200 px-3 focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Descripción
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="rounded-lg border border-gray-200 px-3 py-2 focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="bestSeller"
              checked={form.bestSeller}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Destacar como más vendido
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar producto"}
          </button>
        </form>
      </section>

      <section className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-green-800 mb-4">Productos actuales</h2>
        <div className="grid gap-3">
          {products.map((product) => (
            <div
              key={product.docId || product.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-green-800 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 truncate">{product.category}</p>
              </div>
              <span className="text-sm font-semibold text-green-700">
                {formatCOP(product.price)}
              </span>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-sm text-gray-500">Aún no hay productos registrados.</p>
          )}
        </div>
      </section>
    </div>
  );
}




