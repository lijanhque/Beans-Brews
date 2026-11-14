import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StoreLayout } from "@/components/store-layout";
import { ProfileActions } from "@/components/profile-actions";
import { updateCustomerProfile } from "@/app/customer-actions";
import { db } from "@/lib/db";
import { customerProfile } from "@/lib/db/schema";
import { getSession } from "@/lib/server-auth";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackURL=/profile");
  const [profile] = await db
    .select()
    .from(customerProfile)
    .where(eq(customerProfile.userId, session.user.id))
    .limit(1);

  return (
    <StoreLayout>
      <main className="store-page profile-page">
        <section className="profile-card customer-profile-card">
          <span className="eyebrow">YOUR LITTLE CORNER</span>
          <h1>Hello, <em>{session.user.name.split(" ")[0]}.</em></h1>
          <p>Update your details and keep your favorite things close.</p>
          <form action={updateCustomerProfile} className="checkout-form profile-edit-form">
            <label>Full name<input autoComplete="name" defaultValue={session.user.name} name="name" required /></label>
            <label>Email address<input autoComplete="email" disabled value={session.user.email} /></label>
            <label>Phone number<input autoComplete="tel" defaultValue={profile?.phone ?? ""} name="phone" type="tel" /></label>
            <label>Delivery address<input autoComplete="street-address" defaultValue={profile?.address ?? ""} name="address" /></label>
            <div className="checkout-row">
              <label>City<input autoComplete="address-level2" defaultValue={profile?.city ?? ""} name="city" /></label>
              <label>Postal code<input autoComplete="postal-code" defaultValue={profile?.postalCode ?? ""} name="postalCode" /></label>
            </div>
            <button className="button-dark auth-submit" type="submit">Save profile</button>
          </form>
          <div className="customer-links">
            <Link href="/orders">My orders →</Link>
            <Link href="/favorites">Favorite products →</Link>
            <Link href="/support">Customer support →</Link>
            {session.user.role === "admin" && <Link href="/admin">Admin dashboard →</Link>}
          </div>
          <ProfileActions />
        </section>
      </main>
    </StoreLayout>
  );
}
