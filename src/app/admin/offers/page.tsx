import { desc } from "drizzle-orm";
import { AdminShell } from "@/components/admin/admin-shell";
import { createOffer, toggleOffer } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { offer, product } from "@/lib/db/schema";

export default async function AdminOffersPage() {
  const [offers, products] = await Promise.all([
    db.select().from(offer).orderBy(desc(offer.createdAt)),
    db.select({ id: product.id, name: product.name }).from(product).orderBy(product.name),
  ]);
  const names = new Map(products.map((entry) => [entry.id, entry.name]));

  return (
    <AdminShell active="/admin/offers">
      <div className="admin-content">
        <div className="admin-heading"><div><span className="eyebrow">SMART PRICING</span><h1>Offers <em>and promotions.</em></h1></div></div>
        <div className="admin-dashboard-grid">
          <section className="admin-panel">
            <h2>Create offer</h2>
            <p className="admin-muted">Offers automatically apply at checkout. Leave the product blank for a store-wide offer.</p>
            <form action={createOffer} className="admin-form">
              <label>Offer name<input name="title" maxLength={160} required /></label>
              <label>Product
                <select name="productId" defaultValue=""><option value="">All products</option>{products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
              </label>
              <div className="admin-form-row">
                <label>Discount type<select name="discountType"><option value="percent">Percent</option><option value="amount">Fixed BDT</option></select></label>
                <label>Discount value<input name="discountValue" min="1" step="1" type="number" required /></label>
              </div>
              <label className="admin-inline-check"><input defaultChecked name="active" type="checkbox" /> Offer is active</label>
              <button className="button-dark" type="submit">Save offer</button>
            </form>
          </section>
          <section className="admin-panel">
            <h2>Active offers</h2>
            {offers.length === 0 ? <p className="admin-empty">No promotions have been created.</p> : (
              <div className="admin-quick-links">
                {offers.map((entry) => <div className="admin-offer-row" key={entry.id}>
                  <span>{entry.title}<small>{entry.productId ? names.get(entry.productId) ?? "Product" : "Store-wide"}</small></span>
                  <strong>{entry.discountType === "percent" ? `${entry.discountValue}%` : `৳${entry.discountValue}`}</strong>
                  <span className="status-pill">{entry.active ? "active" : "paused"}</span>
                  <form action={toggleOffer}><input name="id" type="hidden" value={entry.id} /><input name="active" type="hidden" value={String(!entry.active)} /><button className="button-outline" type="submit">{entry.active ? "Pause" : "Enable"}</button></form>
                </div>)}
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminShell>
  );
}
