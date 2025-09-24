import Link from "next/link";
import { getCategoryIconComponent, type CategoryIconKey } from "@/components/icons";
import { slugify } from "@/lib/utils";

export interface CategoryGridProps {
  categories: Array<{ name: string; iconKey: CategoryIconKey }>;
  showHomeLink?: boolean;
  homeHref?: string;
  className?: string;
}

export function CategoryGrid({
  categories,
  showHomeLink = false,
  homeHref = "/",
  className,
}: CategoryGridProps) {
  if (!Array.isArray(categories) || categories.length === 0) {
    return null;
  }

  const containerClass = [
    "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass}>
      {showHomeLink && (
        <Link
          href={homeHref}
          className="group rounded-xl bg-white p-3 text-center shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg select-none"
        >
          <span className="block font-bold text-lg text-green-800 truncate">🏠 Inicio</span>
        </Link>
      )}
      {categories.map((category) => {
        const Icon = getCategoryIconComponent(category.iconKey);
        const slug = slugify(category.name);
        return (
          <Link
            key={category.name}
            href={`/c/${slug}`}
            className="group rounded-xl bg-white p-3 text-center shadow-md transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg select-none"
            aria-label={`Ver categoría ${category.name}`}
          >
            <div className="flex items-center justify-center mb-2">
              <Icon className="h-6 w-6 text-green-700" />
            </div>
            <span className="block font-bold text-lg text-green-800 truncate">{category.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default CategoryGrid;
