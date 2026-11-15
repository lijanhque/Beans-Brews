import Link from "next/link";
import type { StoreCategory } from "@/lib/store-data";

export function ProductCategoryFilters({
  categories,
  activeSlug,
}: {
  categories: StoreCategory[];
  activeSlug?: string;
}) {
  return (
    <nav aria-label="Product categories" className="collection-pills">
      <Link aria-current={activeSlug ? undefined : "page"} href="/products">
        Everything
      </Link>
      {categories.map((category) => (
        <Link
          aria-current={activeSlug === category.slug ? "page" : undefined}
          href={`/categories/${category.slug}`}
          key={category.slug}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
