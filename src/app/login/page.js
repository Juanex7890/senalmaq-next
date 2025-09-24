"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No pudimos iniciar sesión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow p-6 flex flex-col gap-4"
      >
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-green-800">Acceso administrador</h1>
          <p className="text-sm text-gray-600">Ingresa tus credenciales para gestionar el catálogo.</p>
        </div>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Correo electrónico
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-lg border border-gray-200 px-3 focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none"
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Contraseña
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-lg border border-gray-200 px-3 focus:border-green-400 focus:ring-2 focus:ring-green-200 outline-none"
            required
          />
        </label>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="h-11 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}
