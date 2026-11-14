"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Image as ImageIcon, Package, Pencil, Search, Trash2, X } from "lucide-react";
import { deleteProduct, updateProduct } from "@/app/admin/actions";
import { MediaUploadField } from "@/components/admin/media-upload-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/store-data";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string | null;
  categoryName: string | null;
  priceBdt: number;
  compareAtPriceBdt: number | null;
  images: string[];
  stock: number;
  active: boolean;
  featured: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
};

const pageSize = 10;

export function ProductCatalogTable({
  products,
  categories,
}: {
  products: ProductRow[];
  categories: CategoryOption[];
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query) ||
        (product.categoryName ?? "uncategorized").toLowerCase().includes(query);
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && product.active) ||
        (filter === "inactive" && !product.active) ||
        (filter === "low-stock" && product.stock < 5);
      return matchesSearch && matchesFilter;
    });
  }, [filter, products, search]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const editingProduct = products.find((product) => product.id === editingId);
  const firstItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, filteredProducts.length);

  function changeSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function changeFilter(value: string) {
    setFilter(value);
    setPage(1);
  }

  return (
    <div className="admin-catalog">
      <div className="admin-catalog-toolbar">
        <label className="admin-catalog-search">
          <Search aria-hidden="true" size={17} />
          <Input
            aria-label="Search products"
            onChange={(event) => changeSearch(event.target.value)}
            placeholder="Search products, slugs, categories…"
            value={search}
          />
        </label>
        <label className="admin-catalog-filter">
          <span className="sr-only">Filter products</span>
          <select onChange={(event) => changeFilter(event.target.value)} value={filter}>
            <option value="all">All products</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="low-stock">Low stock</option>
          </select>
          <ChevronDown aria-hidden="true" size={15} />
        </label>
      </div>

      <Table className="admin-catalog-table">
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Inventory</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="admin-catalog-actions-heading">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleProducts.length === 0 ? (
            <TableRow>
              <TableCell className="admin-catalog-empty" colSpan={6}>
                <Package aria-hidden="true" size={24} />
                <strong>{products.length === 0 ? "Your catalog is empty" : "No products found"}</strong>
                <span>
                  {products.length === 0
                    ? "Create your first product to start building your catalog."
                    : "Try another search or clear the selected filter."}
                </span>
              </TableCell>
            </TableRow>
          ) : (
            visibleProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="admin-catalog-product">
                    <span className="admin-catalog-thumb">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt="" src={product.images[0]} />
                      ) : (
                        <ImageIcon aria-hidden="true" size={17} />
                      )}
                    </span>
                    <span className="admin-catalog-product-copy">
                      <strong>{product.name}</strong>
                      <small>/{product.slug}</small>
                    </span>
                  </div>
                </TableCell>
                <TableCell>{product.categoryName ?? "Uncategorized"}</TableCell>
                <TableCell className="admin-catalog-price">{formatPrice(product.priceBdt)}</TableCell>
                <TableCell>
                  <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                    {product.stock === 0 ? "Out of stock" : `${product.stock} in stock`}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="admin-catalog-badges">
                    <Badge variant={product.active ? "default" : "outline"}>
                      {product.active ? "Active" : "Draft"}
                    </Badge>
                    {product.featured && <Badge variant="outline">Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell className="admin-catalog-row-actions">
                  <Button
                    aria-label={`Edit ${product.name}`}
                    onClick={() => setEditingId(editingId === product.id ? null : product.id)}
                    size="sm"
                    variant="outline"
                  >
                    {editingId === product.id ? <X aria-hidden="true" /> : <Pencil aria-hidden="true" />}
                    {editingId === product.id ? "Close" : "Edit"}
                  </Button>
                  <form action={deleteProduct}>
                    <input name="id" type="hidden" value={product.id} />
                    <Button aria-label={`Delete ${product.name}`} size="icon-sm" type="submit" variant="destructive">
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {editingProduct && (
        <section className="admin-product-edit-panel" aria-label={`Edit ${editingProduct.name}`}>
          <div className="admin-panel-heading">
            <div>
              <span className="eyebrow">PRODUCT DETAILS</span>
              <h3>Edit {editingProduct.name}</h3>
            </div>
            <Button onClick={() => setEditingId(null)} size="icon-sm" type="button" variant="ghost">
              <X aria-label="Close product editor" />
            </Button>
          </div>
          <form action={updateProduct} className="admin-form">
            <input name="id" type="hidden" value={editingProduct.id} />
            <div className="admin-form-row">
              <label>Name<input defaultValue={editingProduct.name} maxLength={160} name="name" required /></label>
              <label>Slug<input defaultValue={editingProduct.slug} maxLength={120} name="slug" required /></label>
            </div>
            <label>
              Category
              <select defaultValue={editingProduct.categoryId ?? ""} name="categoryId">
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <div className="admin-form-row">
              <label>Price (BDT)<input defaultValue={editingProduct.priceBdt} min="1" name="priceBdt" required type="number" /></label>
              <label>Compare-at price<input defaultValue={editingProduct.compareAtPriceBdt ?? ""} min="1" name="compareAtPriceBdt" type="number" /></label>
              <label>Stock<input defaultValue={editingProduct.stock} min="0" name="stock" required type="number" /></label>
            </div>
            <RichTextEditor key={editingProduct.id} initialContent={editingProduct.description} label="Description" name="description" />
            <label>Stock adjustment reason<input maxLength={200} name="inventoryReason" placeholder="Restock, correction, return…" /></label>
            <MediaUploadField initial={editingProduct.images} label="Product photos" name="images" />
            <div className="admin-check-row">
              <label><input defaultChecked={editingProduct.active} name="active" type="checkbox" /> Active in store</label>
              <label><input defaultChecked={editingProduct.featured} name="featured" type="checkbox" /> Featured</label>
            </div>
            <div className="admin-form-actions">
              <Button type="submit"><Check aria-hidden="true" /> Save changes</Button>
            </div>
          </form>
        </section>
      )}

      <div className="admin-catalog-footer">
        <span>
          Showing <strong>{firstItem}–{lastItem}</strong> of <strong>{filteredProducts.length}</strong> products
        </span>
        <nav aria-label="Product table pagination" className="admin-pagination">
          <Button
            aria-label="Previous page"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            <ChevronLeft aria-hidden="true" /> Previous
          </Button>
          <span aria-current="page" className="admin-pagination-current">
            Page {currentPage} of {pageCount}
          </span>
          <Button
            aria-label="Next page"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            Next <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
