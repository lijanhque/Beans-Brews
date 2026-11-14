import { and, eq, gt, inArray, isNull, lte, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  invoice,
  offer,
  order,
  orderItem,
  product,
} from "@/lib/db/schema";
import { getSession } from "@/lib/server-auth";

type CheckoutLine = { productId: string; quantity: number };

class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateCheckout(value: unknown): {
  lines: CheckoutLine[];
  fullName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: "cod" | "bkash" | "nagad";
  paymentReference: string | null;
} {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    throw new CheckoutError("Checkout information is incomplete.", 400);
  }
  if (value.items.length === 0 || value.items.length > 40) {
    throw new CheckoutError("Your bag must contain between 1 and 40 products.", 400);
  }
  const lines = value.items.map((item): CheckoutLine => {
    if (
      !isRecord(item) ||
      typeof item.productId !== "string" ||
      item.productId.length > 80 ||
      typeof item.quantity !== "number" ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 99
    ) {
      throw new CheckoutError("Your bag contains an invalid product or quantity.", 400);
    }
    return { productId: item.productId, quantity: item.quantity };
  });
  if (new Set(lines.map(({ productId }) => productId)).size !== lines.length) {
    throw new CheckoutError("Your bag contains duplicate product entries.", 400);
  }

  const requiredText = (key: string, maximum: number) => {
    const text = value[key];
    if (typeof text !== "string" || !text.trim() || text.trim().length > maximum) {
      throw new CheckoutError(`Please provide a valid ${key}.`, 400);
    }
    return text.trim();
  };
  const phone = requiredText("phone", 24);
  if (!/^\+?[0-9][0-9\s()-]{7,19}$/.test(phone)) {
    throw new CheckoutError("Enter a valid phone number.", 400);
  }
  const paymentValue = value.paymentMethod;
  if (paymentValue !== "cod" && paymentValue !== "bkash" && paymentValue !== "nagad") {
    throw new CheckoutError("Choose COD, bKash, or Nagad.", 400);
  }
  const paymentMethod = paymentValue;
  const paymentReference =
    typeof value.paymentReference === "string" && value.paymentReference.trim()
      ? value.paymentReference.trim().slice(0, 100)
      : null;

  return {
    lines,
    fullName: requiredText("fullName", 160),
    phone,
    address: requiredText("address", 500),
    city: requiredText("city", 100),
    postalCode: requiredText("postalCode", 30),
    paymentMethod,
    paymentReference,
  };
}

function deliveryFeeBdt() {
  const raw = process.env.DELIVERY_FEE_BDT;
  if (raw === undefined) return 80;
  const fee = Number(raw);
  if (!Number.isSafeInteger(fee) || fee < 0) {
    throw new Error("DELIVERY_FEE_BDT must be a non-negative whole number.");
  }
  return fee;
}

function finalPrice(
  basePrice: number,
  productId: string,
  offers: (typeof offer.$inferSelect)[],
) {
  const applicable = offers.filter((entry) => entry.productId === null || entry.productId === productId);
  return applicable.reduce((price, entry) => {
    const reduced =
      entry.discountType === "percent"
        ? Math.floor((price * (100 - entry.discountValue)) / 100)
        : price - entry.discountValue;
    return Math.max(1, Math.min(price, reduced));
  }, basePrice);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Sign in before checking out." }, { status: 401 });
    }

    let requestBody: unknown;
    try {
      requestBody = await request.json();
    } catch {
      throw new CheckoutError("Checkout information could not be read. Please try again.", 400);
    }
    const details = validateCheckout(requestBody);
    const shippingFee = deliveryFeeBdt();
    const orderId = crypto.randomUUID();

    const createdOrder = await db.transaction(async (tx) => {
      const productRows = await tx
        .select()
        .from(product)
        .where(inArray(product.id, details.lines.map((line) => line.productId)))
        .for("update");
      if (productRows.length !== details.lines.length) {
        throw new CheckoutError("One or more products are no longer available.", 409);
      }

      const now = new Date();
      const activeOffers = await tx
        .select()
        .from(offer)
        .where(
          and(
            eq(offer.active, true),
            or(isNull(offer.startsAt), lte(offer.startsAt, now)),
            or(isNull(offer.endsAt), gt(offer.endsAt, now)),
            or(isNull(offer.productId), inArray(offer.productId, details.lines.map((line) => line.productId))),
          ),
        );
      const items = details.lines.map((line) => {
        const found = productRows.find((entry) => entry.id === line.productId);
        if (!found || !found.active) {
          throw new CheckoutError("One or more products are no longer available.", 409);
        }
        if (found.stock < line.quantity) {
          throw new CheckoutError(`${found.name} does not have enough stock.`, 409);
        }
        return {
          product: found,
          quantity: line.quantity,
          unitPriceBdt: finalPrice(found.priceBdt, found.id, activeOffers),
        };
      });
      const subtotalBdt = items.reduce(
        (total, entry) => total + entry.unitPriceBdt * entry.quantity,
        0,
      );
      const status = "pending";
      const paymentStatus = details.paymentMethod === "cod" ? "unpaid" : "pending_verification";
      await tx.insert(order).values({
        id: orderId,
        userId: session.user.id,
        status,
        subtotalBdt,
        deliveryFeeBdt: shippingFee,
        totalBdt: subtotalBdt + shippingFee,
        fullName: details.fullName,
        email: session.user.email,
        phone: details.phone,
        address: details.address,
        city: details.city,
        postalCode: details.postalCode,
        deliveryProvider: "steadfast",
        paymentMethod: details.paymentMethod,
        paymentStatus,
        paymentReference: details.paymentReference,
      });
      await tx.insert(orderItem).values(
        items.map((entry) => ({
          id: crypto.randomUUID(),
          orderId,
          productId: entry.product.id,
          productName: entry.product.name,
          unitPriceBdt: entry.unitPriceBdt,
          quantity: entry.quantity,
          image: entry.product.images[0] ?? null,
        })),
      );
      for (const entry of items) {
        await tx
          .update(product)
          .set({ stock: sql`${product.stock} - ${entry.quantity}`, updatedAt: now })
          .where(eq(product.id, entry.product.id));
      }
      const invoiceNumber = `BB-${now.getFullYear()}-${orderId.slice(0, 8).toUpperCase()}`;
      await tx.insert(invoice).values({
        id: crypto.randomUUID(),
        orderId,
        invoiceNumber,
      });
      return { id: orderId, invoiceNumber };
    });

    return NextResponse.json({ orderId: createdOrder.id }, { status: 201 });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Could not complete checkout:", error);
    return NextResponse.json(
      { error: "We couldn’t complete your order right now. Please try again." },
      { status: 500 },
    );
  }
}
