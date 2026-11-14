import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { BrandLogo } from "@/components/brand-logo";
import { StoreHeader } from "@/components/store-header";
import { CartDrawer } from "@/components/cart-drawer";

export function StoreFooter() {
  return (
    <footer className="route-footer">
      <Link className="brand" href="/" aria-label="Beans & Brews home">
        <BrandLogo className="brand-logo" width={90} />
      </Link>
      <p>Make a little room for joy.</p>
      <Link href="/products">Find your next favorite <ArrowRight size={14} /></Link>
    </footer>
  );
}

export async function StoreLayout({
  children,
  cartEnabled = true,
}: {
  children: ReactNode;
  cartEnabled?: boolean;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <StoreHeader
        cartEnabled={cartEnabled}
        user={session ? { name: session.user.name, role: session.user.role ?? "user" } : null}
      />
      {children}
      <StoreFooter />
      {cartEnabled && <CartDrawer />}
    </>
  );
}
