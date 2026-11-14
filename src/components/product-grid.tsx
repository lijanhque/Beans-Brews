"use client";

import { Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice, products, type Product } from "@/lib/store-data";
import { toast } from "@/components/ui/toast";

export function ProductGrid({ items = products }: { items?: Product[] }) {
  const { addToCart, openCart } = useCart();
  const [addedProduct, setAddedProduct] = useState<string | null>(null);

  function add(product: Product) {
    addToCart(product);
    openCart();
    setAddedProduct(product.id);
    window.setTimeout(() => setAddedProduct(null), 1200);
    toast.add({
      description: `${product.name} is in your shopping bag.`,
      title: "Added to your bag",
      type: "success",
    });
  }

  if (items.length === 0) {
    return <p className="empty-note">We’re brewing this collection. Check back soon.</p>;
  }

  return (
    <div className="route-product-grid">
      {items.map((product) => (
        <article className="route-product-card" key={product.id}>
          <div
            className="route-product-image"
            style={{ backgroundImage: `url("${product.image}")` }}
          >
            {product.badge && <span className="route-product-badge">{product.badge}</span>}
            <button
              aria-label={`Add ${product.name} to cart`}
              className="route-quick-add"
              disabled={product.stock !== undefined && product.stock <= 0}
              onClick={() => add(product)}
              type="button"
            >
              {addedProduct === product.id ? <ShoppingBag size={17} /> : <Plus size={18} />}
            </button>
          </div>
          <div className="route-product-info">
            <div>
              <span>{product.category}</span>
              <h2><Link href={`/products/${product.slug}`}>{product.name}</Link></h2>
            </div>
            <strong>{formatPrice(product.price)}</strong>
          </div>
          {addedProduct === product.id && (
            <span className="added-note" role="status">Added to your bag</span>
          )}
        </article>
      ))}
    </div>
  );
}
