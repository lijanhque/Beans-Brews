"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/store-data";

export function CartPageContent() {
  const { cartItems, cartTotal, updateQuantity } = useCart();

  return (
    <main className="store-page cart-page">
      <div className="page-intro">
        <span className="eyebrow">YOUR LITTLE BAG</span>
        <h1>Good things, <em>gathered.</em></h1>
      </div>
      {cartItems.length === 0 ? (
        <section className="empty-cart">
          <ShoppingBag size={32} />
          <h2>Your bag is taking a little breather.</h2>
          <p>Let’s find something lovely to put in it.</p>
          <Link className="button-dark" href="/products">Browse the shop <ArrowRight size={15} /></Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-lines" aria-label="Items in your bag">
            {cartItems.map((item) => (
              <article className="cart-line" key={item.id}>
                <div
                  className="cart-line-image"
                  style={{ backgroundImage: `url("${item.image}")` }}
                />
                <div className="cart-line-details">
                  <span>{item.category}</span>
                  <h2>{item.name}</h2>
                  <div className="quantity-control">
                    <button
                      aria-label={`Remove one ${item.name}`}
                      onClick={() => updateQuantity(item.id, -1)}
                      type="button"
                    >
                      {item.quantity === 1 ? <X size={14} /> : <Minus size={14} />}
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`Add one ${item.name}`}
                      onClick={() => updateQuantity(item.id, 1)}
                      type="button"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <strong>{formatPrice(item.price * item.quantity)}</strong>
              </article>
            ))}
          </section>
          <aside className="order-summary">
            <h2>A little summary</h2>
            <div><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
            <div><span>Delivery</span><span>Flat fee at checkout</span></div>
            <p>Steadfast delivery is arranged by our team after you place your order.</p>
            <Link className="button-dark checkout-link" href="/checkout">
              Continue to checkout <ArrowRight size={15} />
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
