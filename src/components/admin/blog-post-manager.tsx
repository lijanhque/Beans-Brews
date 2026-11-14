"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteBlogPost, saveBlogPost, setBlogPostStatus } from "@/app/admin/actions";
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
import type { AdminActionState } from "@/app/admin/actions";

type BlogPostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string | null;
  category: string;
  author: string;
  tags: string[];
  featured: boolean;
  status: string;
  updatedAt: string;
};

function BlogPostForm({
  post,
  onCancel,
}: {
  post: BlogPostRow | null;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(
    saveBlogPost,
    null,
  );

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="eyebrow">{post ? "UPDATE YOUR STORY" : "WRITE SOMETHING GOOD"}</span>
          <h2>{post ? "Edit blog post" : "Create a blog post"}</h2>
        </div>
        {post && (
          <Button onClick={onCancel} size="sm" type="button" variant="outline">
            Cancel edit
          </Button>
        )}
      </div>
      <form action={formAction} className="admin-form">
        <input name="id" type="hidden" value={post?.id ?? ""} />
        <div className="admin-form-row">
          <label>
            Title
            <Input defaultValue={post?.title ?? ""} maxLength={200} name="title" required />
          </label>
          <label>
            URL slug
            <Input defaultValue={post?.slug ?? ""} maxLength={120} name="slug" placeholder="a-gentler-morning" required />
          </label>
        </div>
        <div className="admin-form-row">
          <label>
            Category
            <Input defaultValue={post?.category ?? "Journal"} maxLength={100} name="category" />
          </label>
          <label>
            Author
            <Input defaultValue={post?.author ?? "Beans & Brews"} maxLength={120} name="author" />
          </label>
          <label>
            Status
            <select defaultValue={post?.status ?? "draft"} name="status">
              <option value="draft">Draft</option>
              <option value="published">Published / active</option>
            </select>
          </label>
        </div>
        <label>
          Tags
          <Input defaultValue={post?.tags.join(", ") ?? ""} maxLength={1000} name="tags" placeholder="coffee, rituals, brewing" />
          <small className="admin-field-hint">Separate tags with commas. Up to 20 tags, 40 characters each.</small>
        </label>
        <label>
          Short introduction
          <textarea defaultValue={post?.excerpt ?? ""} maxLength={500} name="excerpt" rows={2} />
        </label>
        <RichTextEditor initialContent={post?.content} label="Article body" name="content" />
        <MediaUploadField
          initial={post?.image ? [post.image] : []}
          label="Article image"
          multiple={false}
          name="image"
        />
        <label className="admin-inline-check">
          <input defaultChecked={post?.featured ?? false} name="featured" type="checkbox" />
          Feature this article
        </label>
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
        <div className="admin-form-actions">
          <Button disabled={pending} type="submit">
            {pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Plus aria-hidden="true" />}
            {pending ? "Saving post…" : post ? "Save changes" : "Save post"}
          </Button>
        </div>
      </form>
    </section>
  );
}

export function BlogPostManager({ posts }: { posts: BlogPostRow[] }) {
  const [editingPost, setEditingPost] = useState<BlogPostRow | null>(null);

  return (
    <div className="admin-blog-manager">
      <BlogPostForm
        key={editingPost?.id ?? "new-post"}
        onCancel={() => setEditingPost(null)}
        post={editingPost}
      />
      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="eyebrow">EDITORIAL MANAGEMENT</span>
            <h2>All blog posts</h2>
          </div>
          <span className="admin-count">{posts.length} posts</span>
        </div>
        {posts.length === 0 ? (
          <p className="admin-empty">Your drafts and published stories will appear here.</p>
        ) : (
          <div className="admin-table-wrap">
            <Table className="admin-blog-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="admin-blog-post-cell">
                        {post.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img alt="" src={post.image} />
                        )}
                        <span><strong>{post.title}</strong><small>/{post.slug} · {post.category}</small></span>
                      </div>
                    </TableCell>
                    <TableCell>{post.author}</TableCell>
                    <TableCell>
                      <div className="admin-blog-tags">
                        {post.tags.length > 0
                          ? post.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)
                          : <span className="admin-muted">No tags</span>}
                      </div>
                    </TableCell>
                    <TableCell>{post.updatedAt}</TableCell>
                    <TableCell>
                      <Badge variant={post.status === "published" ? "default" : "secondary"}>
                        {post.status === "published" ? "Active" : "Draft"}
                      </Badge>
                      {post.featured && <Badge className="admin-blog-featured" variant="outline">Featured</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="admin-blog-actions">
                        <Button onClick={() => setEditingPost(post)} size="sm" type="button" variant="outline">
                          <Pencil aria-hidden="true" /> Edit
                        </Button>
                        <form action={setBlogPostStatus}>
                          <input name="id" type="hidden" value={post.id} />
                          <input
                            name="status"
                            type="hidden"
                            value={post.status === "published" ? "draft" : "published"}
                          />
                          <Button size="sm" type="submit" variant="outline">
                            {post.status === "published" ? "Unpublish" : "Publish"}
                          </Button>
                        </form>
                        <form action={deleteBlogPost}>
                          <input name="id" type="hidden" value={post.id} />
                          <Button aria-label={`Delete ${post.title}`} size="icon-sm" type="submit" variant="destructive">
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
