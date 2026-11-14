import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { banner, blogPost, category, product } from "@/lib/db/schema";
import { richTextToPlainText } from "@/lib/rich-text";
import {
  categories as demoCategories,
  journalEntries as demoJournalEntries,
  products as demoProducts,
  type Product,
  type StoreCategory,
} from "@/lib/store-data";

export async function getStoreProducts(): Promise<Product[]> {
  const rows = await db
    .select({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      categoryName: category.name,
      categorySlug: category.slug,
      price: product.priceBdt,
      compareAtPriceBdt: product.compareAtPriceBdt,
      images: product.images,
      stock: product.stock,
      featured: product.featured,
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id))
    .where(eq(product.active, true))
    .orderBy(desc(product.featured), desc(product.createdAt));

  if (rows.length === 0) return demoProducts;

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.categoryName ?? "Store favorite",
    collection: row.categorySlug ?? "products",
    description: richTextToPlainText(row.description),
    price: row.price,
    compareAtPriceBdt: row.compareAtPriceBdt ?? undefined,
    image: row.images[0] ?? "/images/product-placeholder.svg",
    images: row.images,
    color: "sand",
    badge: row.featured ? "FEATURED" : undefined,
    stock: row.stock,
  }));
}

export async function getStoreProductBySlug(slug: string): Promise<Product | undefined> {
  const [row] = await db
    .select({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      categoryName: category.name,
      categorySlug: category.slug,
      price: product.priceBdt,
      compareAtPriceBdt: product.compareAtPriceBdt,
      images: product.images,
      stock: product.stock,
      featured: product.featured,
    })
    .from(product)
    .leftJoin(category, eq(product.categoryId, category.id))
    .where(eq(product.slug, slug))
    .limit(1);

  if (!row) return demoProducts.find((entry) => entry.slug === slug);
  if (row.images.length === 0) {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.categoryName ?? "Store favorite",
      collection: row.categorySlug ?? "products",
      description: row.description,
      price: row.price,
      compareAtPriceBdt: row.compareAtPriceBdt ?? undefined,
      image: "/images/product-placeholder.svg",
      images: [],
      color: "sand",
      badge: row.featured ? "FEATURED" : undefined,
      stock: row.stock,
    };
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.categoryName ?? "Store favorite",
    collection: row.categorySlug ?? "products",
    description: row.description,
    price: row.price,
    compareAtPriceBdt: row.compareAtPriceBdt ?? undefined,
    image: row.images[0],
    images: row.images,
    color: "sand",
    badge: row.featured ? "FEATURED" : undefined,
    stock: row.stock,
  };
}

export async function getStoreCategories(): Promise<StoreCategory[]> {
  const rows = await db.select().from(category).orderBy(category.name);
  return rows.length > 0
    ? rows.map((entry, index) => ({
        slug: entry.slug,
        name: entry.name,
        note: entry.description ?? "Thoughtfully chosen for your daily ritual.",
        number: String(index + 1).padStart(2, "0"),
        image: entry.image ?? demoCategories[index % demoCategories.length].image,
      }))
    : demoCategories;
}

export async function getPublishedPosts() {
  const rows = await db
    .select()
    .from(blogPost)
    .where(eq(blogPost.status, "published"))
    .orderBy(desc(blogPost.publishedAt));
  if (rows.length === 0) {
    return demoJournalEntries.map((entry) => ({
      ...entry,
      author: "Beans & Brews",
      tags: [] as string[],
      content: "",
    }));
  }

  return rows.map((post) => ({
    slug: post.slug,
    category: post.category.toUpperCase(),
    title: post.title,
    author: post.author,
    tags: post.tags,
    date: post.publishedAt?.toLocaleDateString("en-GB") ?? "",
    image: post.image ?? "/images/product-placeholder.svg",
    excerpt: post.excerpt,
    content: post.content,
  }));
}

export async function getActiveBanners() {
  return db
    .select({
      id: banner.id,
      title: banner.title,
      image: banner.image,
      href: banner.href,
    })
    .from(banner)
    .where(eq(banner.active, true))
    .orderBy(desc(banner.createdAt));
}
