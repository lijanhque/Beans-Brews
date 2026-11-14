import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";
import { invoice, order } from "@/lib/db/schema";
import { formatPrice } from "@/lib/store-data";

export default async function AdminInvoicesPage() {
  const records = await db
    .select({
      invoiceNumber: invoice.invoiceNumber,
      issuedAt: invoice.issuedAt,
      orderId: order.id,
      customer: order.fullName,
      totalBdt: order.totalBdt,
      status: order.status,
    })
    .from(invoice)
    .innerJoin(order, eq(invoice.orderId, order.id))
    .orderBy(desc(invoice.issuedAt));

  return (
    <AdminShell active="/admin/invoices">
      <div className="admin-content">
        <div className="admin-heading"><div><span className="eyebrow">BILLING</span><h1>Invoices <em>and receipts.</em></h1></div></div>
        <section className="admin-panel">
          {records.length === 0 ? <p className="admin-empty">Invoices are created automatically when an order is placed.</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Invoice</th><th>Customer</th><th>Order</th><th>Status</th><th>Total</th><th>Issued</th><th /></tr></thead>
                <tbody>{records.map((record) => (
                  <tr id={record.orderId} key={record.invoiceNumber}>
                    <td>{record.invoiceNumber}</td><td>{record.customer}</td>
                    <td>#{record.orderId.slice(0, 8).toUpperCase()}</td>
                    <td><span className="status-pill">{record.status}</span></td>
                    <td>{formatPrice(record.totalBdt)}</td><td>{record.issuedAt.toLocaleDateString("en-BD")}</td>
                    <td><Link href={`/orders/${record.orderId}/invoice`} target="_blank">Print →</Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
