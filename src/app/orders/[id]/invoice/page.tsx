import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { PrintInvoiceButton } from "@/components/print-invoice-button";
import { StoreLayout } from "@/components/store-layout";
import { db } from "@/lib/db";
import { invoice, order, orderItem } from "@/lib/db/schema";
import { formatPrice } from "@/lib/store-data";
import { getSession } from "@/lib/server-auth";

export default async function InvoicePage({ params }: PageProps<"/orders/[id]/invoice">) {
  const session = await getSession();
  if (!session) redirect("/login?callbackURL=/orders");
  const { id } = await params;
  const [entry] = await db.select().from(order).where(eq(order.id, id)).limit(1);
  if (!entry || (entry.userId !== session.user.id && session.user.role !== "admin")) notFound();
  const [invoiceRecord] = await db.select().from(invoice).where(eq(invoice.orderId, id)).limit(1);
  const items = await db.select().from(orderItem).where(eq(orderItem.orderId, id));

  return (
    <StoreLayout>
      <main className="store-page customer-page invoice-page">
        <div className="invoice-actions"><Link href={`/orders/${id}`}>← Order details</Link><PrintInvoiceButton /></div>
        <article className="invoice-paper">
          <span className="eyebrow">BEANS & BREWS</span>
          <h1>Thank you <em>for your order.</em></h1>
          <div className="invoice-meta"><span>Invoice <strong>{invoiceRecord?.invoiceNumber ?? `BB-${id.slice(0, 8).toUpperCase()}`}</strong></span><span>Issued <strong>{invoiceRecord?.issuedAt.toLocaleDateString("en-BD") ?? entry.createdAt.toLocaleDateString("en-BD")}</strong></span></div>
          <div className="invoice-customer"><strong>{entry.fullName}</strong><span>{entry.email}</span><span>{entry.phone}</span><span>{entry.address}, {entry.city} {entry.postalCode}</span></div>
          <table className="admin-table"><thead><tr><th>Item</th><th>Qty</th><th>Unit price</th><th>Total</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td>{item.productName}</td><td>{item.quantity}</td><td>{formatPrice(item.unitPriceBdt)}</td><td>{formatPrice(item.unitPriceBdt * item.quantity)}</td></tr>)}</tbody></table>
          <div className="invoice-totals"><div><span>Subtotal</span><strong>{formatPrice(entry.subtotalBdt)}</strong></div><div><span>Delivery · Steadfast</span><strong>{formatPrice(entry.deliveryFeeBdt)}</strong></div><div><span>Total · BDT</span><strong>{formatPrice(entry.totalBdt)}</strong></div></div>
          <p className="invoice-note">Payment: {entry.paymentMethod.toUpperCase()} · {entry.paymentStatus.replaceAll("_", " ")}</p>
        </article>
      </main>
    </StoreLayout>
  );
}
