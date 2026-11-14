"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Check, Coffee, Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/store-data";

export function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    cartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  useEffect(() => {
    if (!cartOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [cartOpen, closeCart]);

  return (
    <>
      {cartOpen && (
        <button
          aria-label="Close shopping bag"
          className="drawer-backdrop"
          onClick={closeCart}
          type="button"
        />
      )}
      <aside
        aria-hidden={!cartOpen}
        aria-labelledby="cart-drawer-title"
        aria-modal={cartOpen}
        className={`cart-drawer${cartOpen ? " is-open" : ""}`}
        inert={!cartOpen}
        role="dialog"
      >
        <div className="drawer-heading">
          <div>
            <span className="eyebrow">GOOD CHOICES</span>
            <h2 id="cart-drawer-title">Your little bag <span>({cartCount})</span></h2>
          </div>
          <button
            aria-label="Close shopping bag"
            className="icon-button"
            onClick={closeCart}
            type="button"
          >
            <X size={20} />
          </button>
        </div>
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <span className="empty-cart-icon"><Coffee size={27} /></span>
            <h3>It&apos;s a little quiet in here.</h3>
            <p>Find a few things that make your coffee time feel like yours.</p>
            <Link className="button-dark" href="/products" onClick={closeCart}>
              Browse products <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-image">
                    <Image
                      alt=""
                      fill
                      sizes="88px"
                      src={item.image}
                      unoptimized
                    />
                  </div>
                  <div className="cart-item-info">
                    <span className="product-category">{item.category}</span>
                    <strong>{item.name}</strong>
                    <span>{formatPrice(item.price)}</span>
                    <div className="quantity-control">
                      <button
                        aria-label={`Remove one ${item.name}`}
                        onClick={() => updateQuantity(item.id, -1)}
                        type="button"
                      >
                        <Minus size={13} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        aria-label={`Add one ${item.name}`}
                        onClick={() => updateQuantity(item.id, 1)}
                        type="button"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                  <button
                    aria-label={`Remove ${item.name}`}
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                    type="button"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="cart-summary">
              {cartTotal < 45 ? (
                <p className="shipping-note">
                  Add {formatPrice(45 - cartTotal)} more for a little free shipping.
                </p>
              ) : (
                <p className="shipping-note shipping-earned">
                  <Check size={15} /> Free shipping is on us.
                </p>
              )}
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>
              <span className="tax-note">Taxes and shipping are sorted at checkout.</span>
              <Link
                className="button-dark checkout-button"
                href="/checkout"
                onClick={closeCart}
              >
                Continue to checkout <ArrowRight size={16} />
              </Link>
              <button
                className="continue-shopping"
                onClick={closeCart}
                type="button"
              >
                Keep having a look
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
