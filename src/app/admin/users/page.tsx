import { desc } from "drizzle-orm";
import { AdminShell } from "@/components/admin/admin-shell";
import { setUserAccess } from "@/app/admin/actions";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";

export default async function AdminUsersPage() {
  const users = await db.select().from(user).orderBy(desc(user.createdAt));

  return (
    <AdminShell active="/admin/users">
      <div className="admin-content">
        <div className="admin-heading"><div><span className="eyebrow">CUSTOMER DIRECTORY</span><h1>People <em>and access.</em></h1></div><span className="admin-count">{users.length} accounts</span></div>
        <section className="admin-panel admin-table-panel">
          {users.length === 0 ? <p className="admin-empty">No registered users yet.</p> : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Customer</th><th>Email</th><th>Role</th><th>Joined</th><th>Access settings</th></tr></thead>
                <tbody>{users.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.name}</td><td>{entry.email}</td>
                    <td><span className="status-pill">{entry.role}</span>{entry.banned && <span className="status-pill danger-pill">suspended</span>}</td>
                    <td>{entry.createdAt.toLocaleDateString("en-BD")}</td>
                    <td>
                      <form action={setUserAccess} className="admin-user-access">
                        <input name="userId" type="hidden" value={entry.id} />
                        <select defaultValue={entry.role} name="role" aria-label={`Role for ${entry.name}`}>
                          <option value="user">Customer</option><option value="admin">Admin</option>
                        </select>
                        <label><input defaultChecked={entry.banned ?? false} name="banned" type="checkbox" /> Suspend</label>
                        <button className="button-outline" type="submit">Save</button>
                      </form>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
