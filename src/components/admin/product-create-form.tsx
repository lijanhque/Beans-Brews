"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, Plus } from "lucide-react";
import { createProduct } from "@/app/admin/actions";
import { MediaUploadField } from "@/components/admin/media-upload-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CategoryOption = {
  id: string;
  name: string;
};

export function ProductCreateForm({ categories }: { categories: CategoryOption[] }) {
  const [state, formAction, pending] = useActionState(createProduct, null);

  return (
    <form action={formAction} className="admin-form">
      <div className="admin-form-row">
        <label>
          Product name
          <Input autoComplete="off" maxLength={160} name="name" placeholder="e.g. Sunday Morning Blend" required />
        </label>
        <label>
          URL slug
          <Input autoComplete="off" maxLength={120} name="slug" placeholder="sunday-morning-blend" required />
        </label>
      </div>
      <label>
        Category
        <select name="categoryId" defaultValue="">
          <option value="">Uncategorized</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </label>
      <div className="admin-form-row">
        <label>
          Price (BDT)
          <Input min="1" name="priceBdt" placeholder="950" required step="1" type="number" />
        </label>
        <label>
          Compare-at price
          <Input min="1" name="compareAtPriceBdt" placeholder="Optional" step="1" type="number" />
        </label>
        <label>
          Starting stock
          <Input defaultValue="0" min="0" name="stock" required step="1" type="number" />
        </label>
      </div>
      <RichTextEditor label="Description" name="description" />
      <MediaUploadField label="Product photos" name="images" />
      <div className="admin-check-row">
        <label><input defaultChecked name="active" type="checkbox" /> Active in store</label>
        <label><input name="featured" type="checkbox" /> Feature on homepage</label>
      </div>
      {state?.error && (
        <p className="admin-action-message error" role="alert">
          <AlertCircle aria-hidden="true" size={16} /> {state.error}
        </p>
      )}
      {state?.success && (
        <p className="admin-action-message success" role="status">
          <CheckCircle2 aria-hidden="true" size={16} /> {state.success}
        </p>
      )}
      <Button className="admin-submit-button" disabled={pending} type="submit">
        {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Plus aria-hidden="true" />}
        {pending ? "Creating product…" : "Create product"}
      </Button>
    </form>
  );
}
