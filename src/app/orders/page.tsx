import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StoreLayout } from "@/components/store-layout";
import { OrderPlacedToast } from "@/components/order-placed-toast";
import { db } from "@/lib/db";
import { order, orderItem } from "@/lib/db/schema";
import { formatPrice } from "@/lib/store-data";
import { getSession } from "@/lib/server-auth";

export default async function OrdersPage({
  searchParams,
}: PageProps<"/orders">) {
  const session = await getSession();
  if (!session) redirect("/login?callbackURL=/orders");
  const params = await searchParams;
  const orders = await db
    .select()
    .from(order)
    .where(eq(order.userId, session.user.id))
    .orderBy(desc(order.createdAt));
  const items = orders.length
    ? await db.select().from(orderItem).where(inArray(orderItem.orderId, orders.map((entry) => entry.id)))
    : [];

  return (
    <StoreLayout>
      <main className="store-page customer-page">
        <OrderPlacedToast show={params.placed === "1"} />
        <div className="page-intro"><span className="eyebrow">YOUR ORDERS</span><h1>Good things, <em>on their way.</em></h1><p>Follow every order from confirmation to delivery.</p></div>
        {orders.length === 0 ? (
          <section className="empty-cart"><h2>No orders just yet.</h2><p>Your next favorite is waiting to be found.</p><Link className="button-dark" href="/products">Browse the shop</Link></section>
        ) : (
          <div className="customer-order-list">
            {orders.map((entry) => (
              <article className="customer-order-card" key={entry.id}>
                <div className="customer-order-heading">
                  <div><span className="eyebrow">ORDER #{entry.id.slice(0, 8).toUpperCase()}</span><strong>{entry.createdAt.toLocaleDateString("en-BD")}</strong></div>
                  <span className="status-pill">{entry.status.replaceAll("_", " ")}</span>
                </div>
                <ul className="customer-order-items">
                  {items.filter((item) => item.orderId === entry.id).map((item) => <li key={item.id}><span>{item.quantity} × {item.productName}</span><strong>{formatPrice(item.unitPriceBdt * item.quantity)}</strong></li>)}
                </ul>
                <div className="customer-order-footer"><strong>{formatPrice(entry.totalBdt)}</strong><Link href={`/orders/${entry.id}`}>Track order details →</Link></div>
              </article>
            ))}
          </div>
        )}
      </main>
    </StoreLayout>
  );
}
