"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/store-data";

type CheckoutResult = { error?: string; orderId?: string };

export function CheckoutForm({
  name,
  email,
  phone,
  address,
  city,
  postalCode,
  deliveryFeeBdt,
}: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  deliveryFeeBdt: number;
}) {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bkash" | "nagad">("cod");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cartItems.length === 0 || isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map(({ id, quantity }) => ({ productId: id, quantity })),
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          city: formData.get("city"),
          postalCode: formData.get("postalCode"),
          paymentMethod: formData.get("paymentMethod"),
          paymentReference: formData.get("paymentReference"),
        }),
      });
      let result: CheckoutResult;
      try {
        result = await response.json();
      } catch {
        throw new Error("We couldn’t read the checkout response. Please try again.");
      }
      if (!response.ok || !result.orderId) {
        throw new Error(result.error ?? "We couldn’t place your order. Please try again.");
      }

      clearCart();
      setSuccess(true);
      window.setTimeout(() => router.push("/orders?placed=1"), 650);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "We couldn’t place your order. Please try again.",
      );
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="checkout-success" role="status" aria-live="polite">
        <CheckCircle2 aria-hidden="true" size={34} />
        <div>
          <strong>Order confirmed</strong>
          <span>Taking you to your order details…</span>
        </div>
        <Loader2 aria-hidden="true" className="checkout-spinner" size={18} />
      </div>
    );
  }

  return (
    <>
      <div className="page-intro checkout-intro">
        <span className="eyebrow">THE LAST LITTLE STEP</span>
        <h1>Make it <em>yours.</em></h1>
        <p>Welcome, {name}. Your good things are almost on their way.</p>
      </div>
      {cartItems.length === 0 ? (
        <section className="empty-cart">
          <h2>Your bag is empty.</h2>
          <p>Add a little something before heading to checkout.</p>
          <Link className="button-dark" href="/products">Browse the shop</Link>
        </section>
      ) : (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={submit}>
            <h2>Where should we send it?</h2>
            <label>Full name<input autoComplete="name" defaultValue={name} name="fullName" required /></label>
            <label>Email address<input autoComplete="email" disabled value={email} /></label>
            <label>Phone number<input autoComplete="tel" defaultValue={phone} name="phone" required type="tel" /></label>
            <label>Street address<input autoComplete="street-address" defaultValue={address} name="address" required /></label>
            <div className="checkout-row">
              <label>City<input autoComplete="address-level2" defaultValue={city} name="city" required /></label>
              <label>Postal code<input autoComplete="postal-code" defaultValue={postalCode} name="postalCode" required /></label>
            </div>
            <fieldset className="checkout-choice-group">
              <legend>Delivery</legend>
              <label className="checkout-choice"><input defaultChecked name="deliveryProvider" type="radio" value="steadfast" /><span><strong>Steadfast courier</strong><small>Our team will arrange delivery manually.</small></span><strong>{formatPrice(deliveryFeeBdt)}</strong></label>
            </fieldset>
            <fieldset className="checkout-choice-group">
              <legend>Payment method</legend>
              <label className="checkout-choice"><input checked={paymentMethod === "cod"} name="paymentMethod" onChange={() => setPaymentMethod("cod")} type="radio" value="cod" /><span><strong>Cash on delivery</strong><small>Pay when your order arrives.</small></span></label>
              <label className="checkout-choice"><input checked={paymentMethod === "bkash"} name="paymentMethod" onChange={() => setPaymentMethod("bkash")} type="radio" value="bkash" /><span><strong>bKash</strong><small>Payment will be manually verified by our team.</small></span></label>
              <label className="checkout-choice"><input checked={paymentMethod === "nagad"} name="paymentMethod" onChange={() => setPaymentMethod("nagad")} type="radio" value="nagad" /><span><strong>Nagad</strong><small>Payment will be manually verified by our team.</small></span></label>
              <label>Transaction reference (optional)<input autoComplete="off" maxLength={100} name="paymentReference" placeholder="Reference for bKash or Nagad" /></label>
            </fieldset>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button
              aria-busy={isSubmitting}
              className="button-dark checkout-submit"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 aria-hidden="true" className="checkout-spinner" size={17} />
                  <span>Securely placing your order…</span>
                </>
              ) : (
                `Place order · ${formatPrice(cartTotal + deliveryFeeBdt)}`
              )}
            </button>
            {isSubmitting && (
              <p className="checkout-submitting" role="status" aria-live="polite">
                Please keep this page open while we confirm your order.
              </p>
            )}
          </form>
          <aside className="order-summary checkout-summary">
            <div className="checkout-summary-heading">
              <h2>Your order</h2>
              <span>{cartItems.length} {cartItems.length === 1 ? "item" : "items"}</span>
            </div>
            {cartItems.map((item) => (
              <article className="checkout-product" key={item.id}>
                <div
                  aria-label={item.name}
                  className="checkout-product-image"
                  role="img"
                  style={{ backgroundImage: `url("${item.image}")` }}
                />
                <div className="checkout-product-details">
                  <strong>{item.name}</strong>
                  <span>{item.category}</span>
                  <small>{item.quantity} × {formatPrice(item.price)} each</small>
                  {item.stock !== undefined && (
                    <small>{item.stock > 0 ? `${item.stock} available` : "Out of stock"}</small>
                  )}
                </div>
                <strong className="checkout-product-total">
                  {formatPrice(item.quantity * item.price)}
                </strong>
              </article>
            ))}
            <div className="checkout-summary-line"><span>Subtotal</span><strong>{formatPrice(cartTotal)}</strong></div>
            <div className="checkout-summary-line"><span>Delivery · Steadfast</span><strong>{formatPrice(deliveryFeeBdt)}</strong></div>
            <div className="checkout-summary-line"><span>Payment</span><strong>{paymentMethod === "cod" ? "Cash on delivery" : paymentMethod}</strong></div>
            <div className="checkout-total"><span>Total</span><strong>{formatPrice(cartTotal + deliveryFeeBdt)}</strong></div>
          </aside>
        </div>
      )}
    </>
  );
}
