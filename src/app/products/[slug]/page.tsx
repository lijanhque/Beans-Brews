import { notFound } from "next/navigation";
import { StoreLayout } from "@/components/store-layout";
import { ProductActions } from "@/components/product-actions";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { RichTextContent } from "@/components/rich-text-content";
import { formatPrice } from "@/lib/store-data";
import { getStoreProductBySlug } from "@/lib/store-queries";
import { getSession } from "@/lib/server-auth";
import { db } from "@/lib/db";
import { favorite } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) notFound();
  const session = await getSession();
  const [saved] = session
    ? await db
        .select({ productId: favorite.productId })
        .from(favorite)
        .where(and(eq(favorite.userId, session.user.id), eq(favorite.productId, product.id)))
        .limit(1)
    : [];

  return (
    <StoreLayout>
      <main className="store-page product-detail-page">
        <div
          aria-label={product.name}
          className="product-detail-image"
          role="img"
          style={{ backgroundImage: `url("${product.image}")` }}
        />
        <section className="product-detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <strong className="product-detail-price">{formatPrice(product.price)}</strong>
          <RichTextContent
            className="product-rich-description"
            content={product.description || "A thoughtful little favorite for your everyday ritual. Made for slow mornings, good company, and one more cup."}
          />
          <div className="product-detail-actions">
            <ProductActions product={product} />
            {session && <FavoriteToggle productId={product.id} saved={Boolean(saved)} />}
          </div>
          {product.stock !== undefined && <p className="product-detail-note">{product.stock > 0 ? `${product.stock} in stock` : "Currently out of stock"}</p>}
        </section>
      </main>
    </StoreLayout>
  );
}
