import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { StoreLayout } from "@/components/store-layout";
import { createSupportTicket } from "@/app/customer-actions";
import { db } from "@/lib/db";
import { supportTicket } from "@/lib/db/schema";
import { getSession } from "@/lib/server-auth";

export default async function SupportPage() {
  const session = await getSession();
  if (!session) redirect("/login?callbackURL=/support");
  const tickets = await db
    .select()
    .from(supportTicket)
    .where(eq(supportTicket.userId, session.user.id))
    .orderBy(desc(supportTicket.createdAt));

  return (
    <StoreLayout>
      <main className="store-page customer-page">
        <div className="page-intro"><span className="eyebrow">HERE FOR YOU</span><h1>A little <em>help.</em></h1><p>Send us a note and our team will follow up here.</p></div>
        <section className="customer-order-card support-form-card">
          <form action={createSupportTicket} className="admin-form">
            <label>What can we help with?<input name="subject" maxLength={160} required /></label>
            <label>Your message<textarea name="message" minLength={10} maxLength={4000} rows={5} required /></label>
            <button className="button-dark" type="submit">Send message</button>
          </form>
        </section>
        <section className="customer-support-list"><h2>Your support requests</h2>
          {tickets.length === 0 ? <p className="empty-note">Your requests and replies will appear here.</p> : tickets.map((ticket) => (
            <article className="customer-order-card" key={ticket.id}>
              <div className="customer-order-heading"><h3>{ticket.subject}</h3><span className="status-pill">{ticket.status.replaceAll("_", " ")}</span></div>
              <p>{ticket.message}</p>
              {ticket.adminReply && <div className="support-reply"><strong>Beans & Brews team</strong><p>{ticket.adminReply}</p></div>}
            </article>
          ))}
        </section>
      </main>
    </StoreLayout>
  );
}
