"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/store-data";
import { toast } from "@/components/ui/toast";

export function ProductActions({ product }: { product: Product }) {
  const { addToCart, openCart } = useCart();
  const [added, setAdded] = useState(false);

  function add() {
    addToCart(product);
    openCart();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
    toast.add({
      description: `${product.name} is in your shopping bag.`,
      title: "Added to your bag",
      type: "success",
    });
  }

  return (
    <button
      className="button-dark product-detail-add"
      disabled={product.stock !== undefined && product.stock <= 0}
      onClick={add}
      type="button"
    >
      {product.stock !== undefined && product.stock <= 0
        ? "Out of stock"
        : added
          ? "Added to your bag"
          : "Add to your bag"}
      <ShoppingBag size={16} />
    </button>
  );
}
