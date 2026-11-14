"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { customerProfile, favorite, product, supportTicket, user } from "@/lib/db/schema";
import { requireUser } from "@/lib/server-auth";

function field(formData: FormData, key: string, maximum: number) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length > maximum) {
    throw new Error(`Please provide a valid ${key}.`);
  }
  return value.trim();
}

export async function updateCustomerProfile(formData: FormData) {
  const session = await requireUser();
  const name = field(formData, "name", 160);
  const phone = field(formData, "phone", 24);
  if (phone && !/^\+?[0-9][0-9\s()-]{7,19}$/.test(phone)) {
    throw new Error("Enter a valid phone number.");
  }
  const profile = {
    userId: session.user.id,
    phone: phone || null,
    address: field(formData, "address", 500) || null,
    city: field(formData, "city", 100) || null,
    postalCode: field(formData, "postalCode", 30) || null,
    updatedAt: new Date(),
  };
  await db.transaction(async (tx) => {
    await tx.update(user).set({ name, updatedAt: new Date() }).where(eq(user.id, session.user.id));
    await tx
      .insert(customerProfile)
      .values(profile)
      .onConflictDoUpdate({
        target: customerProfile.userId,
        set: {
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          postalCode: profile.postalCode,
          updatedAt: profile.updatedAt,
        },
      });
  });
  revalidatePath("/profile");
  revalidatePath("/checkout");
}

export async function toggleFavorite(formData: FormData) {
  const session = await requireUser();
  const productId = field(formData, "productId", 80);
  const [available] = await db
    .select({ id: product.id })
    .from(product)
    .where(and(eq(product.id, productId), eq(product.active, true)))
    .limit(1);
  if (!available) throw new Error("This product is no longer available.");

  const [saved] = await db
    .select({ userId: favorite.userId })
    .from(favorite)
    .where(and(eq(favorite.userId, session.user.id), eq(favorite.productId, productId)))
    .limit(1);
  if (saved) {
    await db
      .delete(favorite)
      .where(and(eq(favorite.userId, session.user.id), eq(favorite.productId, productId)));
  } else {
    await db.insert(favorite).values({ userId: session.user.id, productId });
  }
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/favorites");
  revalidatePath("/products");
}

export async function createSupportTicket(formData: FormData) {
  const session = await requireUser();
  const subject = field(formData, "subject", 160);
  const message = field(formData, "message", 4000);
  if (subject.length < 3 || message.length < 10) {
    throw new Error("Add a subject and a message with at least 10 characters.");
  }
  await db.insert(supportTicket).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    subject,
    message,
  });
  revalidatePath("/support");
  revalidatePath("/admin/support");
}
