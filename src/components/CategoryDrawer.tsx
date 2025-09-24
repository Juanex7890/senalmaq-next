"use client";

import Link from "next/link";
import { getCategoryIconComponent, type CategoryIconKey } from "@/components/icons";
import { slugify } from "@/lib/utils";

interface DrawerCategory {
  name: string;
  iconKey: CategoryIconKey;
}

export interface CategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: DrawerCategory[];
}

export function CategoryDrawer({ open, onClose, categories }: CategoryDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <aside
        className="absolute left-0 top-0 bottom-0 w-[92vw] max-w-[380px] md:max-w-[320px] bg-white shadow-xl p-4 overflow-y-auto"
        style={{ overscrollBehaviorY: "contain", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-green-800">Categorías</h4>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="grid gap-2">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center justify-between rounded-xl bg-white shadow-md font-bold text-base text-green-800 px-3 py-2 transition duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <span>Inicio</span>
            <span aria-hidden="true">&rsaquo;</span>
          </Link>
          {categories.map((category) => {
            const Icon = getCategoryIconComponent(category.iconKey);
            const slug = slugify(category.name);
            return (
              <Link
                key={category.name}
                href={`/c/${slug}`}
                onClick={onClose}
                className="flex items-center justify-between rounded-xl bg-white shadow-md font-bold text-base text-green-800 px-3 py-2 transition duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <span>{category.name}</span>
                <Icon className="h-5 w-5 text-green-600" />
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

export default CategoryDrawer;
