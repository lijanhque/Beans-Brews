import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { StoreLayout } from "@/components/store-layout";
import { db } from "@/lib/db";
import { order, orderItem } from "@/lib/db/schema";
import { formatPrice } from "@/lib/store-data";
import { getSession } from "@/lib/server-auth";

export default async function OrderDetailsPage({ params }: PageProps<"/orders/[id]">) {
  const session = await getSession();
  if (!session) redirect("/login?callbackURL=/orders");
  const { id } = await params;
  const [entry] = await db
    .select()
    .from(order)
    .where(and(eq(order.id, id), eq(order.userId, session.user.id)))
    .limit(1);
  if (!entry) notFound();
  const items = await db.select().from(orderItem).where(eq(orderItem.orderId, entry.id));

  return (
    <StoreLayout>
      <main className="store-page customer-page">
        <Link className="eyebrow route-read-link" href="/orders">← BACK TO YOUR ORDERS</Link>
        <div className="page-intro"><span className="eyebrow">ORDER #{entry.id.slice(0, 8).toUpperCase()}</span><h1>Your order is <em>{entry.status.replaceAll("_", " ")}.</em></h1><p>Placed {entry.createdAt.toLocaleString("en-BD")}</p></div>
        <section className="customer-order-card">
          <h2>Items</h2>
          <ul className="customer-order-items">{items.map((item) => <li key={item.id}><span>{item.quantity} × {item.productName}</span><strong>{formatPrice(item.unitPriceBdt * item.quantity)}</strong></li>)}</ul>
          <div className="customer-order-items"><div><span>Delivery · Steadfast</span><strong>{formatPrice(entry.deliveryFeeBdt)}</strong></div><div className="customer-order-footer"><strong>Total · {formatPrice(entry.totalBdt)}</strong><Link href={`/orders/${entry.id}/invoice`}>View invoice →</Link></div></div>
          <div className="customer-order-delivery"><h2>Delivery details</h2><p>{entry.fullName}<br />{entry.phone}<br />{entry.address}, {entry.city} {entry.postalCode}</p><p>Payment: {entry.paymentMethod.toUpperCase()} · {entry.paymentStatus.replaceAll("_", " ")}</p></div>
        </section>
      </main>
    </StoreLayout>
  );
}
