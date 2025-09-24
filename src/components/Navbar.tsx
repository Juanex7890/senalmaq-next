"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { IconMenu, IconMoon, IconShoppingCart, IconSun } from "@/components/icons";
import CategoryDrawer from "@/components/CategoryDrawer";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/components/providers/CartProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useCategories } from "@/hooks/useCategories";

const LOGO_SRC = "/images/logosenalmaq.png";

export function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { categories } = useCategories();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();

  const cartCount = items.reduce((sum, entry) => sum + entry.qty, 0);
  const isDark = theme === "dark";

  return (
    <>
      <header className="bg-gradient-to-r from-green-700 to-green-600 text-white shadow h-14 flex items-center">
        <div className="w-full px-4 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir categorías"
              className="mr-2 inline-flex items-center gap-2 rounded-md p-2 text-white font-bold hover:bg-white/10"
            >
              <IconMenu className="h-6 w-6 text-white" />
              <span className="hidden md:inline text-lg">Categorías</span>
            </button>
          </div>

          <Link href="/" className="absolute left-1/2 -translate-x-1/2" aria-label="Ir a Inicio">
            <Image
              src={LOGO_SRC}
              alt="Senalmaq Logo"
              width={40}
              height={40}
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-full ring-1 ring-white/50 shadow bg-white/10 p-0.5"
            />
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
              className="relative bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              {isDark ? (
                <IconSun className="h-5 w-5 text-white" />
              ) : (
                <IconMoon className="h-5 w-5 text-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative bg-white/10 hover:bg-white/20 rounded-full p-2"
              aria-label="Abrir carrito"
            >
              <IconShoppingCart className="h-5 w-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <CategoryDrawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        categories={categories}
      />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default Navbar;
