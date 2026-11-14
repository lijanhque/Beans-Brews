import { desc, eq } from "drizzle-orm";
import { Archive, Boxes, CircleDollarSign, PackageCheck, Plus } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { MediaUploadField } from "@/components/admin/media-upload-field";
import { ProductCatalogTable } from "@/components/admin/product-catalog-table";
import { ProductCreateForm } from "@/components/admin/product-create-form";
import { createCategory } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { category, inventoryMovement, product } from "@/lib/db/schema";
import { formatPrice } from "@/lib/store-data";

export default async function AdminProductsPage() {
  const [products, categories, movements] = await Promise.all([
    db
      .select({
        id: product.id,
        slug: product.slug,
        name: product.name,
        description: product.description,
        categoryId: product.categoryId,
        categoryName: category.name,
        priceBdt: product.priceBdt,
        compareAtPriceBdt: product.compareAtPriceBdt,
        images: product.images,
        stock: product.stock,
        active: product.active,
        featured: product.featured,
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.id))
      .orderBy(desc(product.createdAt)),
    db.select().from(category).orderBy(category.name),
    db.select().from(inventoryMovement).orderBy(desc(inventoryMovement.createdAt)).limit(12),
  ]);
  const activeCount = products.filter((entry) => entry.active).length;
  const lowStockCount = products.filter((entry) => entry.stock < 5).length;
  const inventoryValue = products.reduce((total, entry) => total + entry.priceBdt * entry.stock, 0);

  return (
    <AdminShell active="/admin/products">
      <div className="admin-content">
        <div className="admin-heading admin-products-heading">
          <div>
            <span className="eyebrow">CATALOG & INVENTORY</span>
            <h1>Product <em>catalog.</em></h1>
            <p>Manage your storefront listings, pricing, and inventory in one place.</p>
          </div>
          <a className="admin-heading-action" href="#new-product">
            <Plus aria-hidden="true" size={16} /> Add product
          </a>
        </div>

        <section aria-label="Catalog summary" className="admin-stat-grid admin-product-stats">
          <article className="admin-stat">
            <span><PackageCheck aria-hidden="true" size={16} /> Total products</span>
            <strong>{products.length}</strong>
            <small>Across {categories.length} categories</small>
          </article>
          <article className="admin-stat">
            <span><Boxes aria-hidden="true" size={16} /> Active listings</span>
            <strong>{activeCount}</strong>
            <small>{products.length - activeCount} hidden from store</small>
          </article>
          <article className="admin-stat">
            <span><Archive aria-hidden="true" size={16} /> Low stock alerts</span>
            <strong>{lowStockCount}</strong>
            <small>Products with fewer than 5 units</small>
          </article>
          <article className="admin-stat">
            <span><CircleDollarSign aria-hidden="true" size={16} /> Inventory value</span>
            <strong>{formatPrice(inventoryValue)}</strong>
            <small>Based on current retail prices</small>
          </article>
        </section>

        <div className="admin-dashboard-grid admin-products-forms">
          <section className="admin-panel" id="new-product">
            <div className="admin-panel-heading">
              <div><span className="eyebrow">ADD TO CATALOG</span><h2>New product</h2></div>
            </div>
            <ProductCreateForm categories={categories} />
          </section>
          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div><span className="eyebrow">ORGANIZE YOUR STORE</span><h2>Categories</h2></div>
              <span className="admin-count">{categories.length} total</span>
            </div>
            <form action={createCategory} className="admin-form">
              <label>Name<input maxLength={100} name="name" placeholder="Coffee beans" required /></label>
              <label>URL slug<input maxLength={120} name="slug" placeholder="coffee-beans" required /></label>
              <label>Description<input maxLength={500} name="description" placeholder="A short category description" /></label>
              <MediaUploadField label="Category image" name="image" multiple={false} />
              <button className="button-dark" type="submit">Add category</button>
            </form>
            {categories.length > 0 && (
              <div aria-label="Existing categories" className="admin-category-list">
                {categories.map((entry) => (
                  <span key={entry.id}>{entry.name}<small>/{entry.slug}</small></span>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="admin-panel admin-catalog-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="eyebrow">PRODUCT MANAGEMENT</span>
              <h2>All products</h2>
            </div>
            <span className="admin-count">{products.length} products</span>
          </div>
          <ProductCatalogTable categories={categories} products={products} />
        </section>

        <section className="admin-panel admin-table-panel">
          <div className="admin-panel-heading">
            <div><span className="eyebrow">INVENTORY HISTORY</span><h2>Recent stock changes</h2></div>
          </div>
          {movements.length === 0 ? <p className="admin-empty">Stock changes will be recorded here.</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Product</th><th>Change</th><th>Reason</th><th>Date</th></tr></thead>
                <tbody>{movements.map((movement) => {
                  const name = products.find((entry) => entry.id === movement.productId)?.name ?? "Removed product";
                  return (
                    <tr key={movement.id}>
                      <td>{name}</td>
                      <td>{movement.quantityChange > 0 ? "+" : ""}{movement.quantityChange}</td>
                      <td>{movement.reason}</td>
                      <td>{movement.createdAt.toLocaleDateString("en-BD")}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
