import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { StoreLayout } from "@/components/store-layout";
import { CheckoutForm } from "@/components/checkout-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { customerProfile } from "@/lib/db/schema";

async function CheckoutContent() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect("/login?callbackURL=/checkout");

  const [profile] = await db
    .select()
    .from(customerProfile)
    .where(eq(customerProfile.userId, session.user.id))
    .limit(1);
  const feeRaw = process.env.DELIVERY_FEE_BDT;
  const deliveryFeeBdt = feeRaw === undefined ? 80 : Number(feeRaw);
  if (!Number.isSafeInteger(deliveryFeeBdt) || deliveryFeeBdt < 0) {
    throw new Error("DELIVERY_FEE_BDT must be a non-negative whole number.");
  }

  return (
    <CheckoutForm
      address={profile?.address ?? ""}
      city={profile?.city ?? ""}
      deliveryFeeBdt={deliveryFeeBdt}
      email={session.user.email}
      name={session.user.name}
      phone={profile?.phone ?? ""}
      postalCode={profile?.postalCode ?? ""}
    />
  );
}

export default function CheckoutPage() {
  return (
    <StoreLayout>
      <main className="store-page checkout-page">
        <Suspense fallback={<p className="empty-note">Getting everything ready…</p>}>
          <CheckoutContent />
        </Suspense>
      </main>
    </StoreLayout>
  );
}
