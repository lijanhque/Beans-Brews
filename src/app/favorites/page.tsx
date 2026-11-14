import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { StoreLayout } from "@/components/store-layout";
import { db } from "@/lib/db";
import { category, favorite, product } from "@/lib/db/schema";
import { formatPrice } from "@/lib/store-data";
import { getSession } from "@/lib/server-auth";

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackURL=/favorites");
  const items = await db
    .select({
      id: product.id,
      slug: product.slug,
      name: product.name,
      categoryName: category.name,
      priceBdt: product.priceBdt,
      image: product.images,
      stock: product.stock,
    })
    .from(favorite)
    .innerJoin(product, eq(favorite.productId, product.id))
    .leftJoin(category, eq(product.categoryId, category.id))
    .where(eq(favorite.userId, session.user.id))
    .orderBy(desc(favorite.createdAt));

  return (
    <StoreLayout>
      <main className="store-page customer-page">
        <div className="page-intro"><span className="eyebrow">YOUR LITTLE WISH LIST</span><h1>Favorite <em>things.</em></h1><p>Keep the things you love close by.</p></div>
        {items.length === 0 ? <section className="empty-cart"><h2>No favorites saved yet.</h2><p>Tap the heart on a product to save it here.</p><Link className="button-dark" href="/products">Browse products</Link></section> : (
          <div className="route-product-grid">
            {items.map((item) => (
              <article className="route-product-card" key={item.id}>
                <Link className="route-product-image" href={`/products/${item.slug}`} style={{ backgroundImage: `url("${item.image[0] ?? "/images/product-placeholder.svg"}")` }} aria-label={item.name} />
                <div className="route-product-info"><div><span>{item.categoryName ?? "Store favorite"}</span><h2><Link href={`/products/${item.slug}`}>{item.name}</Link></h2></div><strong>{formatPrice(item.priceBdt)}</strong></div>
                <div className="favorite-card-actions"><Link className="route-read-link" href={`/products/${item.slug}`}>{item.stock > 0 ? "View product" : "Out of stock"}</Link><FavoriteToggle productId={item.id} saved /></div>
              </article>
            ))}
          </div>
        )}
      </main>
    </StoreLayout>
  );
}
