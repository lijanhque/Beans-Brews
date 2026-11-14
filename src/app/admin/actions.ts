"use server";

import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  banner,
  blogPost,
  category,
  inventoryMovement,
  offer,
  order,
  product,
  supportTicket,
  user,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/server-auth";

export type AdminActionState =
  | { error: string; success?: never }
  | { success: string; error?: never }
  | null;

class ActionValidationError extends Error {}

function actionFailure(error: unknown, operation: string): Exclude<AdminActionState, null> {
  if (error instanceof ActionValidationError) {
    return { error: error.message };
  }

  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    error.code === "23505"
  ) {
    return { error: "That URL slug is already in use. Choose a unique slug and try again." };
  }

  console.error(`Admin ${operation} failed:`, error);
  return { error: `Unable to ${operation}. Please try again.` };
}

function textValue(formData: FormData, key: string, maxLength = 5000) {
  const value = formData.get(key);
  if (typeof value !== "string") throw new ActionValidationError(`Missing ${key}.`);
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new ActionValidationError(`${key} is too long.`);
  return trimmed;
}

function integerValue(formData: FormData, key: string, minimum = 0) {
  const value = Number(textValue(formData, key, 30));
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new ActionValidationError(
      `${key} must be a whole number greater than or equal to ${minimum}.`,
    );
  }
  return value;
}

function slugValue(formData: FormData) {
  const slug = textValue(formData, "slug", 120).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new ActionValidationError(
      "Use a URL-friendly slug with lowercase letters, numbers, and hyphens.",
    );
  }
  return slug;
}

function imageList(formData: FormData) {
  const raw = textValue(formData, "images", 12000);
  let images: unknown;
  try {
    images = JSON.parse(raw || "[]");
  } catch {
    throw new ActionValidationError("Product photos could not be read. Upload them again.");
  }
  if (
    !Array.isArray(images) ||
    images.length > 12 ||
    images.some((image) => typeof image !== "string" || !image.startsWith("https://"))
  ) {
    throw new ActionValidationError("Upload up to 12 images before saving.");
  }
  return images as string[];
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = textValue(formData, "name", 100);
  const slug = slugValue(formData);
  if (!name) throw new Error("Category name is required.");
  await db.insert(category).values({
    id: crypto.randomUUID(),
    name,
    slug,
    description: textValue(formData, "description", 500),
    image: textValue(formData, "image", 2048) || null,
  });
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/categories");
}

export async function createProduct(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    const adminSession = await requireAdmin();
    const name = textValue(formData, "name", 160);
    const slug = slugValue(formData);
    const stock = integerValue(formData, "stock");
    const priceBdt = integerValue(formData, "priceBdt", 1);
    const compareAtPriceBdt = textValue(formData, "compareAtPriceBdt", 30);
    const categoryId = textValue(formData, "categoryId", 80);
    const id = crypto.randomUUID();

    if (!name) throw new ActionValidationError("Product name is required.");
    await db.transaction(async (tx) => {
      await tx.insert(product).values({
        id,
        name,
        slug,
        description: textValue(formData, "description", 30000),
        categoryId: categoryId || null,
        priceBdt,
        compareAtPriceBdt: compareAtPriceBdt
          ? integerValue(formData, "compareAtPriceBdt", priceBdt)
          : null,
        images: imageList(formData),
        stock,
        active: formData.get("active") === "on",
        featured: formData.get("featured") === "on",
      });
      if (stock > 0) {
        await tx.insert(inventoryMovement).values({
          id: crypto.randomUUID(),
          productId: id,
          quantityChange: stock,
          reason: "Initial stock",
          createdBy: adminSession.user.id,
        });
      }
    });
    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: "Product created successfully." };
  } catch (error) {
    return actionFailure(error, "create product");
  }
}

export async function updateProduct(formData: FormData) {
  const adminSession = await requireAdmin();
  const id = textValue(formData, "id", 80);
  const [existing] = await db.select().from(product).where(eq(product.id, id)).limit(1);
  if (!existing) throw new Error("Product not found.");

  const stock = integerValue(formData, "stock");
  const priceBdt = integerValue(formData, "priceBdt", 1);
  const compareAtPriceBdt = textValue(formData, "compareAtPriceBdt", 30);
  await db.transaction(async (tx) => {
    await tx
      .update(product)
      .set({
        name: textValue(formData, "name", 160),
        slug: slugValue(formData),
        description: textValue(formData, "description", 30000),
        categoryId: textValue(formData, "categoryId", 80) || null,
        priceBdt,
        compareAtPriceBdt: compareAtPriceBdt
          ? integerValue(formData, "compareAtPriceBdt", priceBdt)
          : null,
        images: imageList(formData),
        stock,
        active: formData.get("active") === "on",
        featured: formData.get("featured") === "on",
        updatedAt: new Date(),
      })
      .where(eq(product.id, id));

    const change = stock - existing.stock;
    if (change !== 0) {
      await tx.insert(inventoryMovement).values({
        id: crypto.randomUUID(),
        productId: id,
        quantityChange: change,
        reason: textValue(formData, "inventoryReason", 200) || "Stock adjustment",
        createdBy: adminSession.user.id,
      });
    }
  });
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/products/${existing.slug}`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = textValue(formData, "id", 80);
  await db.delete(product).where(eq(product.id, id));
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function createOffer(formData: FormData) {
  await requireAdmin();
  const productId = textValue(formData, "productId", 80);
  const discountType = textValue(formData, "discountType", 20);
  const discountValue = integerValue(formData, "discountValue", 1);
  if (!["percent", "amount"].includes(discountType)) {
    throw new Error("Choose a valid discount type.");
  }
  if (discountType === "percent" && discountValue > 100) {
    throw new Error("Percentage discounts cannot exceed 100.");
  }
  await db.insert(offer).values({
    id: crypto.randomUUID(),
    productId: productId || null,
    title: textValue(formData, "title", 160),
    discountType,
    discountValue,
    active: formData.get("active") === "on",
  });
  revalidatePath("/admin");
  revalidatePath("/admin/offers");
  revalidatePath("/products");
}

export async function toggleOffer(formData: FormData) {
  await requireAdmin();
  const id = textValue(formData, "id", 80);
  const active = textValue(formData, "active", 5) === "true";
  await db.update(offer).set({ active }).where(eq(offer.id, id));
  revalidatePath("/admin/offers");
}

export async function updateOrder(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const id = textValue(formData, "id", 80);
    const status = textValue(formData, "status", 40);
    const paymentStatus = textValue(formData, "paymentStatus", 40);
    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    const validPayments = ["unpaid", "pending_verification", "paid", "refunded"];
    if (!validStatuses.includes(status) || !validPayments.includes(paymentStatus)) {
      throw new ActionValidationError("Choose valid order and payment statuses.");
    }
    const updated = await db
      .update(order)
      .set({ status, paymentStatus, updatedAt: new Date() })
      .where(eq(order.id, id))
      .returning({ id: order.id });
    if (updated.length === 0) {
      throw new ActionValidationError("This order could not be found. Refresh the page and try again.");
    }
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/invoices");
    revalidatePath("/orders");
    return { success: "Order status updated." };
  } catch (error) {
    return actionFailure(error, "update order status");
  }
}

export async function setUserAccess(formData: FormData) {
  const adminSession = await requireAdmin();
  const userId = textValue(formData, "userId", 80);
  const role = textValue(formData, "role", 20);
  const banned = formData.get("banned") === "on";
  if (userId === adminSession.user.id) {
    throw new Error("You cannot change your own account access.");
  }
  if (!["user", "admin"].includes(role)) throw new Error("Invalid account role.");
  const [target] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  if (!target) throw new Error("Account not found.");
  if (target.role === "admin" && role !== "admin") {
    const [adminCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(user)
      .where(and(eq(user.role, "admin"), eq(user.banned, false)));
    if ((adminCount?.count ?? 0) <= 1) {
      throw new Error("The last active administrator cannot be demoted.");
    }
  }
  await db.update(user).set({ role, banned }).where(eq(user.id, userId));
  revalidatePath("/admin/users");
}

export async function saveBlogPost(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const id = textValue(formData, "id", 80);
    const title = textValue(formData, "title", 200);
    const slug = slugValue(formData);
    const status = textValue(formData, "status", 20);
    const tags = textValue(formData, "tags", 1000)
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const uniqueTags = [...new Set(tags)];

    if (!title) throw new ActionValidationError("Post title is required.");
    if (!["draft", "published"].includes(status)) {
      throw new ActionValidationError("Choose draft or published status.");
    }
    if (uniqueTags.length > 20 || uniqueTags.some((tag) => tag.length > 40)) {
      throw new ActionValidationError("Add up to 20 tags, each no longer than 40 characters.");
    }

    const [existing] = id
      ? await db.select().from(blogPost).where(eq(blogPost.id, id)).limit(1)
      : [];
    if (id && !existing) throw new ActionValidationError("The post you selected no longer exists.");

    const image = textValue(formData, "image", 2048);
    if (image && !image.startsWith("https://")) {
      throw new ActionValidationError("Upload an image or clear the image field before saving.");
    }

    const values = {
      title,
      slug,
      excerpt: textValue(formData, "excerpt", 500),
      content: textValue(formData, "content", 50000),
      image: image || null,
      category: textValue(formData, "category", 100) || "Journal",
      author: textValue(formData, "author", 120) || "Beans & Brews",
      tags: uniqueTags,
      featured: formData.get("featured") === "on",
      status,
      publishedAt: status === "published" ? (existing?.publishedAt ?? new Date()) : null,
      updatedAt: new Date(),
    };
    if (existing) {
      await db.update(blogPost).set(values).where(eq(blogPost.id, id));
    } else {
      await db.insert(blogPost).values({ id: crypto.randomUUID(), ...values });
    }
    revalidatePath("/admin/content");
    revalidatePath("/journal");
    return { success: "Blog post saved successfully." };
  } catch (error) {
    return actionFailure(error, "save blog post");
  }
}

export async function setBlogPostStatus(formData: FormData) {
  await requireAdmin();
  const id = textValue(formData, "id", 80);
  const status = textValue(formData, "status", 20);
  if (!["draft", "published"].includes(status)) {
    throw new ActionValidationError("Choose draft or published status.");
  }
  const [existing] = await db.select().from(blogPost).where(eq(blogPost.id, id)).limit(1);
  if (!existing) throw new ActionValidationError("The post you selected no longer exists.");
  await db
    .update(blogPost)
    .set({
      status,
      publishedAt: status === "published" ? (existing.publishedAt ?? new Date()) : null,
      updatedAt: new Date(),
    })
    .where(eq(blogPost.id, id));
  revalidatePath("/admin/content");
  revalidatePath("/journal");
}

export async function deleteBlogPost(formData: FormData) {
  await requireAdmin();
  await db.delete(blogPost).where(eq(blogPost.id, textValue(formData, "id", 80)));
  revalidatePath("/admin/content");
  revalidatePath("/journal");
}

export async function createBanner(formData: FormData) {
  await requireAdmin();
  const image = textValue(formData, "image", 2048);
  if (!image.startsWith("https://")) throw new Error("Upload a banner image first.");
  await db.insert(banner).values({
    id: crypto.randomUUID(),
    title: textValue(formData, "title", 160),
    image,
    href: textValue(formData, "href", 2048) || null,
    active: formData.get("active") === "on",
  });
  revalidatePath("/admin/content");
}

export async function toggleBanner(formData: FormData) {
  await requireAdmin();
  const id = textValue(formData, "id", 80);
  const active = textValue(formData, "active", 5) === "true";
  await db.update(banner).set({ active }).where(eq(banner.id, id));
  revalidatePath("/admin/content");
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  await db.delete(banner).where(eq(banner.id, textValue(formData, "id", 80)));
  revalidatePath("/admin/content");
}

export async function updateSupportTicket(formData: FormData) {
  await requireAdmin();
  const id = textValue(formData, "id", 80);
  const status = textValue(formData, "status", 20);
  if (!["open", "in_progress", "resolved"].includes(status)) {
    throw new Error("Invalid support status.");
  }
  await db
    .update(supportTicket)
    .set({
      status,
      adminReply: textValue(formData, "adminReply", 4000) || null,
      updatedAt: new Date(),
    })
    .where(eq(supportTicket.id, id));
  revalidatePath("/admin/support");
}
