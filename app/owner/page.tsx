import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SiteNav from "@/app/components/SiteNav";
import { decideApplication } from "./actions";

export const dynamic = "force-dynamic";

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");
const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function OwnerDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/owner");
  if (user.role !== "OWNER") redirect("/keyholder");

  const [listings, applications, inquiries] = await Promise.all([
    prisma.listing.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" }, include: { _count: { select: { applications: true } } } }),
    prisma.application.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" }, include: { listing: { select: { title: true } }, tenant: { select: { fullName: true } } } }),
    prisma.inquiry.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" }, include: { listing: { select: { title: true } }, tenant: { select: { fullName: true } } } }),
  ]);

  const published = listings.filter((l) => l.listingStatus === "PUBLISHED").length;
  const pending = applications.filter((a) => a.status === "PENDING").length;

  return (
    <>
      <SiteNav />

      <div className="wrap pagehead">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div className="avatar" style={{ width: 56, height: 56 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
            </div>
            <div>
              <h1 style={{ fontSize: "1.8rem" }}>{user.fullName}</h1>
              <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                <span className="keyholder-badge" style={{ padding: ".3rem .7rem", fontSize: ".78rem" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 7 5 5-5 5M4 12h16" /></svg>Verified Keyholder</span>
              </div>
            </div>
          </div>
          <a className="btn btn-gold" href="/owner/listings/new"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" /></svg>Create a listing</a>
        </div>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        <div className="grid-3" style={{ marginBottom: 24 }}>
          <div className="card card-pad"><div className="eyebrow">Active listings</div><div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, marginTop: 6 }}>{published}</div><div className="muted" style={{ fontSize: ".84rem" }}>{listings.length - published} pending review</div></div>
          <div className="card card-pad"><div className="eyebrow">New applications</div><div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, marginTop: 6 }}>{pending}</div><div className="muted" style={{ fontSize: ".84rem" }}>need a decision</div></div>
          <div className="card card-pad"><div className="eyebrow">Open inquiries</div><div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, marginTop: 6 }}>{inquiries.length}</div><div className="muted" style={{ fontSize: ".84rem" }}>from interested tenants</div></div>
        </div>

        {/* listings */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 14 }}>My listings</h3>
          {listings.length === 0 ? (
            <p className="muted">No listings yet. <a href="/owner/listings/new" style={{ color: "var(--leaf)" }}>Create your first listing →</a></p>
          ) : (
            <table className="table">
              <thead><tr><th>Listing</th><th>Rent</th><th>Lease</th><th>Status</th><th>Apps</th><th></th></tr></thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id}>
                    <td><strong>{l.title}</strong><div className="muted" style={{ fontSize: ".8rem" }}>{l.city} · {l.barangay}</div></td>
                    <td className="tabular">{peso(Number(l.monthlyRent))}</td>
                    <td>{l.minimumLeaseMonths} mo</td>
                    <td><span className={`status ${l.listingStatus === "PUBLISHED" ? "ok" : "pending"}`}>{cap(l.listingStatus.replace("_", " "))}</span></td>
                    <td>{l._count.applications}</td>
                    <td>{l.listingStatus === "PUBLISHED" && <a className="btn btn-ghost btn-sm" href={`/rentals/${l.id}`}>View</a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* applications */}
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <div className="banner green" style={{ marginBottom: 18 }}><span className="ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--leaf)" strokeWidth="2"><path d="M12 8v5M12 16h.01" /><circle cx="12" cy="12" r="9" /></svg></span><div className="grow">You decide on every application directly. Balay never auto-approves, ranks, or negotiates for either side.</div></div>
          <h3 style={{ marginBottom: 14 }}>Applications</h3>
          {applications.length === 0 ? (
            <p className="muted">No applications yet.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Applicant</th><th>Listing</th><th>Type</th><th>Status</th><th>Decision</th></tr></thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td>{a.tenant.fullName}</td>
                    <td>{a.listing.title}</td>
                    <td>{cap(a.tenantType.replace("_", " "))}</td>
                    <td><span className={`status ${a.status === "ACCEPTED" ? "ok" : a.status === "REJECTED" ? "rejected" : a.status === "SHORTLISTED" ? "info" : "pending"}`}>{cap(a.status)}</span></td>
                    <td className="actions">
                      {a.status !== "ACCEPTED" && a.status !== "REJECTED" && (
                        <>
                          <form action={decideApplication}><input type="hidden" name="applicationId" value={a.id} /><input type="hidden" name="status" value="SHORTLISTED" /><button className="btn btn-primary btn-sm" type="submit">Shortlist</button></form>
                          <form action={decideApplication}><input type="hidden" name="applicationId" value={a.id} /><input type="hidden" name="status" value="ACCEPTED" /><button className="btn btn-gold btn-sm" type="submit">Accept</button></form>
                          <form action={decideApplication}><input type="hidden" name="applicationId" value={a.id} /><input type="hidden" name="status" value="REJECTED" /><button className="btn btn-danger btn-sm" type="submit">Decline</button></form>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* inquiries */}
        <div className="card card-pad">
          <h3 style={{ marginBottom: 14 }}>Inquiries</h3>
          {inquiries.length === 0 ? (
            <p className="muted">No inquiries yet.</p>
          ) : (
            <table className="table">
              <thead><tr><th>From</th><th>Listing</th><th>Intended lease</th><th>Status</th></tr></thead>
              <tbody>
                {inquiries.map((i) => (
                  <tr key={i.id}><td>{i.tenant.fullName}</td><td>{i.listing.title}</td><td>{i.intendedLeaseMonths ? `${i.intendedLeaseMonths} mo` : "—"}</td><td><span className="status info">{cap(i.status)}</span></td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <footer>
        <div className="wrap">
          <p className="disclaimer">Balay is a listing and rental-management tool, not a real estate broker, agent, or property manager. Keyholders set their own lease terms and remain responsible for the legality, accuracy, and availability of their listings.</p>
          <div className="foot-base"><span>© 2026 Balay</span><a href="/rentals">Browse homes</a></div>
        </div>
      </footer>
    </>
  );
}
