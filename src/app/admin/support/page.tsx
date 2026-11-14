import { desc, eq } from "drizzle-orm";
import { AdminShell } from "@/components/admin/admin-shell";
import { updateSupportTicket } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { supportTicket, user } from "@/lib/db/schema";

export default async function AdminSupportPage() {
  const tickets = await db
    .select({
      id: supportTicket.id,
      subject: supportTicket.subject,
      message: supportTicket.message,
      status: supportTicket.status,
      adminReply: supportTicket.adminReply,
      createdAt: supportTicket.createdAt,
      customerName: user.name,
      customerEmail: user.email,
    })
    .from(supportTicket)
    .innerJoin(user, eq(supportTicket.userId, user.id))
    .orderBy(desc(supportTicket.createdAt));

  return (
    <AdminShell active="/admin/support">
      <div className="admin-content">
        <div className="admin-heading"><div><span className="eyebrow">CUSTOMER CARE</span><h1>Support <em>inbox.</em></h1></div><span className="admin-count">{tickets.filter((item) => item.status !== "resolved").length} open</span></div>
        {tickets.length === 0 ? <section className="admin-panel admin-empty">No support requests yet.</section> : (
          <div className="admin-order-list">{tickets.map((ticket) => (
            <article className="admin-panel" key={ticket.id}>
              <div className="admin-panel-heading"><div><span className="eyebrow">{ticket.customerName} · {ticket.customerEmail}</span><h2>{ticket.subject}</h2></div><span className="status-pill">{ticket.status.replaceAll("_", " ")}</span></div>
              <p>{ticket.message}</p><small className="admin-muted">{ticket.createdAt.toLocaleString("en-BD")}</small>
              <form action={updateSupportTicket} className="admin-form support-admin-form">
                <input name="id" type="hidden" value={ticket.id} />
                <label>Status<select defaultValue={ticket.status} name="status"><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></label>
                <label>Reply<textarea defaultValue={ticket.adminReply ?? ""} name="adminReply" rows={3} /></label>
                <button className="button-dark" type="submit">Save reply</button>
              </form>
            </article>
          ))}</div>
        )}
      </div>
    </AdminShell>
  );
}
