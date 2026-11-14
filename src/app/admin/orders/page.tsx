import { desc } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { db } from "@/lib/db";
import { order, orderItem } from "@/lib/db/schema";
import { formatPrice } from "@/lib/store-data";

export default async function AdminOrdersPage() {
  const orders = await db.select().from(order).orderBy(desc(order.createdAt));
  const items = orders.length
    ? await db.select().from(orderItem).orderBy(desc(orderItem.orderId))
    : [];

  return (
    <AdminShell active="/admin/orders">
      <div className="admin-content">
        <div className="admin-heading">
          <div><span className="eyebrow">FULFILLMENT</span><h1>Customer <em>orders.</em></h1></div>
          <span className="admin-count">{orders.length} total</span>
        </div>
        {orders.length === 0 ? <section className="admin-panel admin-empty">No orders yet.</section> : (
          <div className="admin-order-list">
            {orders.map((entry) => (
              <article className="admin-panel admin-order-card" id={entry.id} key={entry.id}>
                <div className="admin-panel-heading">
                  <div><span className="eyebrow">ORDER #{entry.id.slice(0, 8).toUpperCase()}</span><h2>{entry.fullName}</h2></div>
                  <Link href={`/admin/invoices#${entry.id}`}>Invoice →</Link>
                </div>
                <div className="admin-order-meta">
                  <span>{entry.email}</span><span>{entry.phone}</span>
                  <span>{entry.address}, {entry.city} {entry.postalCode}</span>
                  <span>{entry.deliveryProvider} · {entry.paymentMethod.toUpperCase()}</span>
                  <span>{entry.createdAt.toLocaleString("en-BD")}</span>
                </div>
                <ul className="admin-line-items">
                  {items.filter((item) => item.orderId === entry.id).map((item) => (
                    <li key={item.id}><span>{item.quantity} × {item.productName}</span><strong>{formatPrice(item.unitPriceBdt * item.quantity)}</strong></li>
                  ))}
                </ul>
                <div className="admin-order-total"><span>Total</span><strong>{formatPrice(entry.totalBdt)}</strong></div>
                {entry.paymentReference && <p className="admin-order-meta">Payment reference: {entry.paymentReference}</p>}
                <OrderStatusForm
                  id={entry.id}
                  paymentStatus={entry.paymentStatus}
                  status={entry.status}
                />
              </article>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
