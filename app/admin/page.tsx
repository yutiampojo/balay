import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateListing, updateReport } from "./actions";
import ActiveListings from "./ActiveListings";
import AdminTabs from "./AdminTabs";
import UsersTable from "./UsersTable";

export const dynamic = "force-dynamic";

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");
const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function AdminConsole() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [pendingListings, activeListings, reports, users, audit, counts] = await Promise.all([
    prisma.listing.findMany({ where: { listingStatus: "PENDING_REVIEW" }, orderBy: { createdAt: "desc" }, include: { owner: { select: { fullName: true } } } }),
    prisma.listing.findMany({ where: { listingStatus: "PUBLISHED" }, orderBy: { createdAt: "desc" }, include: { owner: { select: { fullName: true } } } }),
    prisma.report.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], include: { listing: { select: { id: true, title: true } }, reporter: { select: { fullName: true } }, reportedUser: { select: { fullName: true } } } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { admin: { select: { fullName: true } } } }),
    prisma.listing.count({ where: { listingStatus: "PUBLISHED" } }),
  ]);

  return (
    <>

      <div className="wrap pagehead">
        <h1>Trust &amp; safety console</h1>
        <p>Review verifications, moderate listings, and keep Balaymo compliant. Nothing reaches the public until an admin approves it.</p>
      </div>

      <div className="wrap" style={{ marginBottom: 26 }}>
        <div className="grid-3" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          <div className="card card-pad"><div className="eyebrow">Listings pending</div><div style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, marginTop: 4 }}>{pendingListings.length}</div><div className="muted" style={{ fontSize: ".82rem" }}>before going public</div></div>
          <div className="card card-pad"><div className="eyebrow">Open reports</div><div style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, marginTop: 4, color: "var(--danger)" }}>{reports.filter((r) => r.status === "OPEN").length}</div><div className="muted" style={{ fontSize: ".82rem" }}>need a decision</div></div>
          <div className="card card-pad"><div className="eyebrow">Active listings</div><div style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, marginTop: 4 }}>{counts}</div><div className="muted" style={{ fontSize: ".82rem" }}>live now</div></div>
          <div className="card card-pad"><div className="eyebrow">Total users</div><div style={{ fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 700, marginTop: 4 }}>{users.length}</div><div className="muted" style={{ fontSize: ".82rem" }}>registered</div></div>
        </div>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        <AdminTabs
          tabs={[
            {
              key: "moderation",
              label: "Moderation",
              badge: pendingListings.length || undefined,
              content: (
                <div className="card card-pad">
                  <h3 style={{ marginBottom: 14 }}>Listing moderation</h3>
                  {pendingListings.length === 0 ? (
                    <p className="muted">No listings awaiting review. 🎉</p>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Listing</th><th>Keyholder</th><th>Rent</th><th>Lease</th><th>Decision</th></tr></thead>
                      <tbody>
                        {pendingListings.map((l) => (
                          <tr key={l.id}>
                            <td><a href={`/admin/listings/${l.id}`}><strong style={{ color: "var(--leaf)" }}>{l.title}</strong></a><div className="muted" style={{ fontSize: ".8rem" }}>{l.city} · {l.barangay}</div></td>
                            <td>{l.owner.fullName}</td>
                            <td className="tabular">{peso(Number(l.monthlyRent))}</td>
                            <td>{l.minimumLeaseMonths} mo</td>
                            <td className="actions">
                              <a className="btn btn-gold btn-sm" href={`/admin/listings/${l.id}`}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>
                                Review
                              </a>
                              <form action={moderateListing}><input type="hidden" name="listingId" value={l.id} /><input type="hidden" name="action" value="publish" /><button className="btn btn-primary btn-sm" type="submit">Publish</button></form>
                              <form action={moderateListing}><input type="hidden" name="listingId" value={l.id} /><input type="hidden" name="action" value="reject" /><button className="btn btn-danger btn-sm" type="submit">Reject</button></form>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ),
            },
            {
              key: "active",
              label: "Active listings",
              badge: activeListings.length || undefined,
              content: (
                <ActiveListings
                  listings={activeListings.map((l) => ({
                    id: l.id,
                    title: l.title,
                    city: l.city,
                    barangay: l.barangay,
                    ownerName: l.owner.fullName,
                    rent: Number(l.monthlyRent),
                    lease: l.minimumLeaseMonths,
                  }))}
                />
              ),
            },
            {
              key: "reports",
              label: "Reports",
              badge: reports.filter((r) => r.status === "OPEN" || r.status === "REVIEWING").length || undefined,
              content: (
                <div className="card card-pad">
                  <h3 style={{ marginBottom: 14 }}>Reports</h3>
                  {reports.length === 0 ? (
                    <p className="muted">No reports filed.</p>
                  ) : (
                    <table className="table">
                      <thead><tr><th>Target</th><th>Reason &amp; details</th><th>Reporter</th><th>Status</th><th>Decision</th></tr></thead>
                      <tbody>
                        {reports.map((r) => {
                          const open = r.status === "OPEN" || r.status === "REVIEWING";
                          const statusClass = r.status === "RESOLVED" ? "ok" : r.status === "DISMISSED" ? "draft" : r.status === "REVIEWING" ? "info" : "pending";
                          return (
                            <tr key={r.id}>
                              <td>
                                {r.listing ? (
                                  <a href={`/admin/listings/${r.listing.id}`}><strong style={{ color: "var(--leaf)" }}>{r.listing.title}</strong></a>
                                ) : (
                                  <span className="muted">Listing removed</span>
                                )}
                                {r.reportedUser && <div className="muted" style={{ fontSize: ".8rem" }}>User: {r.reportedUser.fullName}</div>}
                              </td>
                              <td>
                                <span className="status rejected">{cap(r.reason.replace(/_/g, " "))}</span>
                                {r.description && <div className="muted" style={{ fontSize: ".82rem", marginTop: 4, maxWidth: 320 }}>{r.description}</div>}
                              </td>
                              <td>{r.reporter.fullName}<div className="muted" style={{ fontSize: ".78rem" }}>{new Date(r.createdAt).toLocaleDateString("en-PH")}</div></td>
                              <td><span className={`status ${statusClass}`}>{cap(r.status)}</span></td>
                              <td className="actions">
                                {open ? (
                                  <>
                                    <form action={updateReport}><input type="hidden" name="reportId" value={r.id} /><input type="hidden" name="action" value="resolve" /><button className="btn btn-primary btn-sm" type="submit">Resolve</button></form>
                                    <form action={updateReport}><input type="hidden" name="reportId" value={r.id} /><input type="hidden" name="action" value="dismiss" /><button className="btn btn-ghost btn-sm" type="submit">Dismiss</button></form>
                                  </>
                                ) : (
                                  <span className="muted" style={{ fontSize: ".8rem" }}>Closed</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              ),
            },
            {
              key: "users",
              label: "Users",
              content: (
                <UsersTable
                  users={users.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, verificationStatus: u.verificationStatus }))}
                  currentUserId={user.id}
                />
              ),
            },
            {
              key: "audit",
              label: "Audit log",
              content: (
                <div className="card card-pad">
                  <h3 style={{ marginBottom: 14 }}>Audit log</h3>
                  {audit.length === 0 ? (
                    <p className="muted">No admin actions logged yet.</p>
                  ) : (
                    <table className="table">
                      <tbody>
                        {audit.map((a) => (
                          <tr key={a.id}><td className="muted" style={{ width: 160 }}>{new Date(a.createdAt).toLocaleString("en-PH")}</td><td><strong>{a.admin.fullName}</strong> — {a.action.replace(/_/g, " ")} {a.targetType} {a.targetId?.slice(0, 8)}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ),
            },
          ]}
        />
      </main>

      <footer><div className="wrap"><div className="foot-base"><span>© 2026 Balaymo · Admin</span><a href="/">Public site</a></div></div></footer>
    </>
  );
}
