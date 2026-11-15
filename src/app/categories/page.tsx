import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { StoreLayout } from "@/components/store-layout";
import { getStoreCategories } from "@/lib/store-queries";

export default async function CategoriesPage() {
  const categories = await getStoreCategories();

  return (
    <StoreLayout>
      <main className="store-page">
        <div className="page-intro">
          <span className="eyebrow">FIND YOUR RITUAL</span>
          <h1>Shop by <em>feeling.</em></h1>
          <p>A few thoughtful corners for all the ways you like your coffee.</p>
        </div>
        <div className="route-category-grid">
          {categories.map((category, index) => (
            <Link
              className="route-category-card"
              href={`/categories/${category.slug}`}
              key={category.slug}
              style={{ backgroundImage: `url("${category.image}")` }}
            >
              <span className="eyebrow">0{index + 1} / COLLECTION</span>
              <span className="route-category-caption">
                <span>{category.note}</span>
                <strong>{category.name}</strong>
              </span>
              <ArrowUpRight aria-hidden="true" size={20} />
            </Link>
          ))}
        </div>
      </main>
    </StoreLayout>
  );
}
