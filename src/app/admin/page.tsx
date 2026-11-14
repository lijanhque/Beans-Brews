import Link from "next/link";
import { connection } from "next/server";
import { count, desc, eq, gt, ne, sql } from "drizzle-orm";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { order, product, session, user } from "@/lib/db/schema";
import { formatPrice } from "@/lib/store-data";

export default async function AdminPage() {
  await connection();
  const now = new Date();
  const [usersCount] = await db
    .select({ value: count() })
    .from(session)
    .where(gt(session.expiresAt, now));
  const [productsCount] = await db
    .select({ value: count() })
    .from(product)
    .where(eq(product.active, true));
  const [ordersCount] = await db
    .select({ value: count() })
    .from(order)
    .where(ne(order.status, "cancelled"));
  const [sales] = await db
    .select({ value: sql<number>`coalesce(sum(${order.totalBdt}), 0)::int` })
    .from(order)
    .where(ne(order.status, "cancelled"));
  const [lowStock] = await db
    .select({ value: count() })
    .from(product)
    .where(sql`${product.active} = true and ${product.stock} <= 5`);

  const dailySales = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${order.createdAt}), 'Dy')`,
      value: sql<number>`coalesce(sum(${order.totalBdt}), 0)::int`,
    })
    .from(order)
    .where(
      sql`${order.createdAt} >= now() - interval '6 days' and ${order.status} <> 'cancelled'`,
    )
    .groupBy(sql`date_trunc('day', ${order.createdAt})`)
    .orderBy(sql`date_trunc('day', ${order.createdAt})`);
  const recentOrders = await db
    .select({
      id: order.id,
      fullName: order.fullName,
      status: order.status,
      totalBdt: order.totalBdt,
      createdAt: order.createdAt,
    })
    .from(order)
    .orderBy(desc(order.createdAt))
    .limit(6);
  const maxSales = Math.max(...dailySales.map((item) => item.value), 1);
  const customerCount = await db.select({ value: count() }).from(user);

  return (
    <AdminShell active="/admin">
      <div className="admin-content">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">YOUR STORE AT A GLANCE</span>
            <h1>Good morning, <em>admin.</em></h1>
          </div>
          <Link className="button-dark" href="/admin/products">Add a product</Link>
        </div>
        <section className="admin-stat-grid" aria-label="Store metrics">
          <article className="admin-stat"><span>Active sessions</span><strong>{usersCount?.value ?? 0}</strong><small>customers online now</small></article>
          <article className="admin-stat"><span>Orders</span><strong>{ordersCount?.value ?? 0}</strong><small>not cancelled</small></article>
          <article className="admin-stat"><span>Products available</span><strong>{productsCount?.value ?? 0}</strong><small>{lowStock?.value ?? 0} low in stock</small></article>
          <article className="admin-stat"><span>Sales</span><strong>{formatPrice(sales?.value ?? 0)}</strong><small>all non-cancelled orders</small></article>
        </section>

        <div className="admin-dashboard-grid">
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="eyebrow">LAST 7 DAYS</span><h2>Sales overview</h2></div>
              <span>{customerCount[0]?.value ?? 0} customers</span>
            </div>
            {dailySales.length === 0 ? (
              <p className="admin-empty">Sales will appear here as orders come in.</p>
            ) : (
              <div className="sales-chart" aria-label="Daily sales chart">
                {dailySales.map((item, index) => (
                  <div className="sales-chart-column" key={`${item.day}-${index}`}>
                    <span>{formatPrice(item.value)}</span>
                    <div className="sales-chart-track">
                      <div style={{ height: `${Math.max(8, (item.value / maxSales) * 100)}%` }} />
                    </div>
                    <small>{item.day}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="eyebrow">KEEP THINGS MOVING</span><h2>Quick links</h2></div>
            </div>
            <div className="admin-quick-links">
              <Link href="/admin/orders">Review new orders <span>→</span></Link>
              <Link href="/admin/products">Update stock <span>→</span></Link>
              <Link href="/admin/content">Add a banner or blog <span>→</span></Link>
              <Link href="/admin/support">Reply to customers <span>→</span></Link>
            </div>
          </section>
        </div>

        <section className="admin-panel admin-table-panel">
          <div className="admin-panel-heading">
            <div><span className="eyebrow">THE LATEST</span><h2>Recent orders</h2></div>
            <Link href="/admin/orders">View all →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="admin-empty">No orders yet. They’ll show up here after checkout.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Placed</th></tr></thead>
                <tbody>
                  {recentOrders.map((entry) => (
                    <tr key={entry.id}>
                      <td><Link href={`/admin/orders#${entry.id}`}>#{entry.id.slice(0, 8).toUpperCase()}</Link></td>
                      <td>{entry.fullName}</td>
                      <td><span className="status-pill">{entry.status.replaceAll("_", " ")}</span></td>
                      <td>{formatPrice(entry.totalBdt)}</td>
                      <td>{entry.createdAt.toLocaleDateString("en-BD")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
