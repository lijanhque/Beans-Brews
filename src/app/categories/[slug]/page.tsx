import { notFound } from "next/navigation";
import { StoreLayout } from "@/components/store-layout";
import { ProductGrid } from "@/components/product-grid";
import { getStoreCategories, getStoreProducts } from "@/lib/store-queries";

export default async function CategoryPage({
  params,
}: PageProps<"/categories/[slug]">) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    getStoreCategories(),
    getStoreProducts(),
  ]);
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) notFound();

  return (
    <StoreLayout>
      <main className="store-page">
        <div className="page-intro">
          <span className="eyebrow">OUR LITTLE COLLECTION</span>
          <h1>{category.name}, <em>made lovely.</em></h1>
          <p>{category.note}</p>
        </div>
        <ProductGrid items={products.filter((product) => product.collection === slug)} />
      </main>
    </StoreLayout>
  );
}
