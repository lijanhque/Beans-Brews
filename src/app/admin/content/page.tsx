import { desc } from "drizzle-orm";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlogPostManager } from "@/components/admin/blog-post-manager";
import { MediaUploadField } from "@/components/admin/media-upload-field";
import {
  createBanner,
  deleteBanner,
  toggleBanner,
} from "@/app/admin/actions";
import { db } from "@/lib/db";
import { banner, blogPost } from "@/lib/db/schema";

export default async function AdminContentPage() {
  const [banners, posts] = await Promise.all([
    db.select().from(banner).orderBy(desc(banner.createdAt)),
    db.select().from(blogPost).orderBy(desc(blogPost.updatedAt)),
  ]);

  return (
    <AdminShell active="/admin/content">
      <div className="admin-content">
        <div className="admin-heading"><div><span className="eyebrow">STORE STORYTELLING</span><h1>Banners, <em>blogs & features.</em></h1></div></div>
        <section className="admin-panel admin-content-banner-panel">
          <h2>Upload a banner or poster</h2>
          <form action={createBanner} className="admin-form">
            <label>Title<input name="title" maxLength={160} required /></label>
            <MediaUploadField label="Banner image" name="image" multiple={false} />
            <label>Link (optional)<input name="href" type="url" placeholder="/products" /></label>
            <label className="admin-inline-check"><input defaultChecked name="active" type="checkbox" /> Show this banner</label>
            <button className="button-dark" type="submit">Save banner</button>
          </form>
        </section>
        <BlogPostManager
          posts={posts.map((post) => ({
            ...post,
            updatedAt: post.updatedAt.toLocaleDateString("en-BD"),
          }))}
        />
        <section className="admin-panel">
          <div className="admin-panel-heading"><div><span className="eyebrow">{banners.length} BANNERS</span><h2>Store banners</h2></div></div>
          {banners.length === 0 ? <p className="admin-empty">Upload a banner to promote a collection or offer.</p> : (
            <div className="admin-content-list">
              {banners.map((entry) => (
                <article className="admin-content-row" key={entry.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt="" src={entry.image} />
                  <div><strong>{entry.title}</strong><small>{entry.href || "No destination link"}</small></div>
                  <span className="status-pill">{entry.active ? "active" : "paused"}</span>
                  <form action={toggleBanner}><input name="id" type="hidden" value={entry.id} /><input name="active" type="hidden" value={String(!entry.active)} /><button className="button-outline" type="submit">{entry.active ? "Pause" : "Enable"}</button></form>
                  <form action={deleteBanner}><input name="id" type="hidden" value={entry.id} /><button className="button-outline danger-button" type="submit">Delete</button></form>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
