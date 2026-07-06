"use client";

import { useState } from "react";
import { makeAdmin, revokeAdmin } from "./actions";
import DeleteUserButton from "@/app/components/DeleteUserButton";

type Row = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  verificationStatus: string;
};

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default function UsersTable({ users, currentUserId }: { users: Row[]; currentUserId: string }) {
  const [q, setQ] = useState("");
  const f = q.trim().toLowerCase();
  const rows = f
    ? users.filter(
        (u) =>
          u.fullName.toLowerCase().includes(f) ||
          u.email.toLowerCase().includes(f) ||
          u.role.toLowerCase().includes(f)
      )
    : users;

  return (
    <div className="card card-pad">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <h3>Users <span className="muted" style={{ fontWeight: 400, fontSize: ".9rem" }}>({rows.length})</span></h3>
        <div className="chat-search" style={{ margin: 0, maxWidth: 320, flex: "1 1 240px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, or role…" />
        </div>
      </div>

      {users.length === 0 ? (
        <p className="muted">No users yet.</p>
      ) : rows.length === 0 ? (
        <p className="muted">No users match “{q}”.</p>
      ) : (
        <div className="table-scroll"><table className="table">
          <thead><tr><th>User</th><th>Role</th><th>Verification</th><th>Action</th></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td><strong>{u.fullName}</strong><div className="muted" style={{ fontSize: ".8rem" }}>{u.email}</div></td>
                <td><span className={`status ${u.role === "ADMIN" ? "info" : "draft"}`}>{cap(u.role)}</span></td>
                <td><span className={`status ${u.verificationStatus === "VERIFIED" ? "ok" : "pending"}`}>{cap(u.verificationStatus.replace(/_/g, " "))}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {u.role === "ADMIN" ? (
                      u.id === currentUserId ? (
                        <span className="muted" style={{ fontSize: ".8rem" }}>You</span>
                      ) : (
                        <form action={revokeAdmin}>
                          <input type="hidden" name="userId" value={u.id} />
                          <button className="btn btn-ghost btn-sm" type="submit">Revoke admin</button>
                        </form>
                      )
                    ) : (
                      <form action={makeAdmin}>
                        <input type="hidden" name="userId" value={u.id} />
                        <button className="btn btn-ghost btn-sm" type="submit">Make admin</button>
                      </form>
                    )}
                    {u.id !== currentUserId && <DeleteUserButton userId={u.id} name={u.fullName} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}
    </div>
  );
}
