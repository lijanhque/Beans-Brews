"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { AccountMenu } from "@/components/account-menu";
import { useCart } from "@/lib/cart-context";

export function StoreHeader({
  user,
  cartEnabled = true,
}: {
  user: { name: string; role: string } | null;
  cartEnabled?: boolean;
}) {
  const { cartCount, openCart } = useCart();

  return (
    <>
      <div className="announcement">
        A little treat on us — free shipping over ৳4,000
      </div>
      <header className="site-header route-header">
        <Link className="brand" href="/" aria-label="Beans & Brews home">
          <BrandLogo className="brand-logo" width={90} />
        </Link>
        <nav className="route-nav" aria-label="Main navigation">
          <Link href="/products">Shop</Link>
          <Link href="/categories">Collections</Link>
          <Link href="/journal">Journal</Link>
          <Link href="/profile">My account</Link>
          {user && <Link href="/orders">Orders</Link>}
        </nav>
        <div className="route-actions">
          <AccountMenu user={user} />
          {!user && (
            <>
              <Link className="login-button" href="/login">Log in</Link>
              <Link className="login-button" href="/signup">Create account</Link>
            </>
          )}
          {cartEnabled && (
            <button
              className="cart-button icon-button"
              aria-label={`Open shopping bag, ${cartCount} items`}
              onClick={openCart}
              type="button"
            >
              <ShoppingBag size={18} />
              <span>Bag</span>
              <span className="cart-count">{cartCount}</span>
            </button>
          )}
        </div>
      </header>
    </>
  );
}
