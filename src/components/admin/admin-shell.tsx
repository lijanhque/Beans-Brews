import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import {
  ChartNoAxesCombined,
  FileText,
  Headset,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tags,
  UsersRound,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products & stock", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/invoices", label: "Invoices", icon: FileText },
  { href: "/admin/users", label: "Customers", icon: UsersRound },
  { href: "/admin/offers", label: "Offers", icon: Tags },
  { href: "/admin/content", label: "Banners & journal", icon: ChartNoAxesCombined },
  { href: "/admin/support", label: "Customer support", icon: Headset },
];

export function AdminShell({
  children,
  active,
}: {
  children: ReactNode;
  active: string;
}) {
  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href="/admin" aria-label="Beans & Brews admin home">
          <BrandLogo className="admin-brand-logo" width={90} />
          <span className="admin-brand-caption"><small>STORE ADMIN</small></span>
        </Link>
        <span className="admin-sidebar-label">WORKSPACE</span>
        <nav aria-label="Admin navigation">
          {links.map((link) => (
            <Link
              aria-current={active === link.href ? "page" : undefined}
              className={active === link.href ? "admin-nav-link active" : "admin-nav-link"}
              href={link.href}
              key={link.href}
            >
              <link.icon aria-hidden="true" size={17} />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <Link className="admin-store-link" href="/">← <span>Back to storefront</span></Link>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar-context"><span className="admin-online-indicator" />Store management</span>
          <Link href="/profile"><span className="admin-avatar">A</span> My account</Link>
        </header>
        {children}
      </section>
    </main>
  );
}
