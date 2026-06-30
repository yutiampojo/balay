import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SiteNav from "@/app/components/SiteNav";
import { moderateListing } from "./actions";

export const dynamic = "force-dynamic";

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");
const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function AdminConsole() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/dashboard");

  const [pendingListings, reports, users, audit, counts] = await Promise.all([
    prisma.listing.findMany({ where: { listingStatus: "PENDING_REVIEW" }, orderBy: { createdAt: "desc" }, include: { owner: { select: { fullName: true } } } }),
    prisma.report.findMany({ orderBy: { createdAt: "desc" }, include: { listing: { select: { title: true } }, reporter: { select: { fullName: true } } } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { admin: { select: { fullName: true } } } }),
    prisma.listing.count({ where: { listingStatus: "PUBLISHED" } }),
  ]);

  return (
    <>
      <SiteNav />

      <div className="wrap pagehead">
        <h1>Trust &amp; safety console</h1>
        <p>Review verifications, moderate listings, and keep Balay compliant. Nothing reaches the public until an admin approves it.</p>
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
        {/* listing moderation */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 14 }}>Listing moderation</h3>
          {pendingListings.length === 0 ? (
            <p className="muted">No listings awaiting review. 🎉</p>
          ) : (
            <table className="table">
              <thead><tr><th>Listing</th><th>Keyholder</th><th>Rent</th><th>Lease</th><th>Decision</th></tr></thead>
              <tbody>
                {pendingListings.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.title}</strong><div className="muted" style={{ fontSize: ".8rem" }}>{l.city} · {l.barangay}</div></td>
                    <td>{l.owner.fullName}</td>
                    <td className="tabular">{peso(Number(l.monthlyRent))}</td>
                    <td>{l.minimumLeaseMonths} mo</td>
                    <td className="actions">
                      <form action={moderateListing}><input type="hidden" name="listingId" value={l.id} /><input type="hidden" name="action" value="publish" /><button className="btn btn-primary btn-sm" type="submit">Publish</button></form>
                      <form action={moderateListing}><input type="hidden" name="listingId" value={l.id} /><input type="hidden" name="action" value="reject" /><button className="btn btn-danger btn-sm" type="submit">Reject</button></form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* reports */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 14 }}>Reports</h3>
          {reports.length === 0 ? (
            <p className="muted">No reports filed.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Reported listing</th><th>Reason</th><th>Reporter</th><th>Status</th></tr></thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}><td>{r.listing?.title ?? "—"}</td><td><span className="status rejected">{cap(r.reason.replace(/_/g, " "))}</span></td><td>{r.reporter.fullName}</td><td><span className="status pending">{cap(r.status)}</span></td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* users */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 14 }}>Users</h3>
          <table className="table">
            <thead><tr><th>User</th><th>Role</th><th>Verification</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}><td><strong>{u.fullName}</strong><div className="muted" style={{ fontSize: ".8rem" }}>{u.email}</div></td><td><span className="status draft">{cap(u.role)}</span></td><td><span className={`status ${u.verificationStatus === "VERIFIED" ? "ok" : "pending"}`}>{cap(u.verificationStatus.replace(/_/g, " "))}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* audit log */}
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
      </main>

      <footer><div className="wrap"><div className="foot-base"><span>© 2026 Balay · Admin</span><a href="/">Public site</a></div></div></footer>
    </>
  );
}
