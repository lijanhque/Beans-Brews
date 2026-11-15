import { StoreLayout } from "@/components/store-layout";
import { ProductGrid } from "@/components/product-grid";
import { ProductCategoryFilters } from "@/components/product-category-filters";
import { getStoreCategories, getStoreProducts } from "@/lib/store-queries";

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([
    getStoreCategories(),
    getStoreProducts(),
  ]);

  return (
    <StoreLayout>
      <main className="store-page">
        <div className="page-intro">
          <span className="eyebrow">THE GOOD STUFF</span>
          <h1>Little things for <em>slow mornings.</em></h1>
          <p>Thoughtful coffee and lovely tools for your favorite part of the day.</p>
        </div>
        <ProductCategoryFilters categories={categories} />
        <ProductGrid items={products} />
      </main>
    </StoreLayout>
  );
}
