import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SiteNav from "@/app/components/SiteNav";

export const dynamic = "force-dynamic";

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isOwner = user.role === "OWNER";
  const isAdmin = user.role === "ADMIN";

  // Owner: their listings + applications received. Tenant: their applications + inquiries.
  const [listings, applications, inquiries] = await Promise.all([
    isOwner
      ? prisma.listing.findMany({ where: { ownerId: user.id }, orderBy: { createdAt: "desc" } })
      : Promise.resolve([]),
    prisma.application.findMany({
      where: isOwner ? { ownerId: user.id } : { tenantId: user.id },
      include: { listing: { select: { title: true, city: true } }, tenant: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    isOwner
      ? Promise.resolve([])
      : prisma.inquiry.findMany({
          where: { tenantId: user.id },
          include: { listing: { select: { title: true } } },
          orderBy: { createdAt: "desc" },
        }),
  ]);

  return (
    <>
      <SiteNav current="dashboard" />

      <div className="wrap pagehead">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="avatar" style={{ width: 56, height: 56 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem" }}>{user.fullName}</h1>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span className="status ok">{user.role.charAt(0) + user.role.slice(1).toLowerCase()} account</span>
              {user.verificationStatus === "VERIFIED" && <span className="status ok">Verified</span>}
            </div>
          </div>
        </div>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        {isAdmin && (
          <div className="banner gold" style={{ marginBottom: 24 }}>
            <div className="grow">You&apos;re signed in as <strong>Admin</strong>. Admin console coming next.</div>
          </div>
        )}

        {/* stat cards */}
        <div className="grid-3" style={{ marginBottom: 24 }}>
          {isOwner ? (
            <>
              <StatCard label="My listings" value={listings.length} sub="published & drafts" />
              <StatCard label="Applications received" value={applications.length} sub="across listings" />
              <StatCard label="Verification" value={user.verificationStatus === "VERIFIED" ? "✓" : "—"} sub={user.verificationStatus.toLowerCase()} />
            </>
          ) : (
            <>
              <StatCard label="My applications" value={applications.length} sub="submitted" />
              <StatCard label="My inquiries" value={inquiries.length} sub="sent to owners" />
              <StatCard label="Verification" value={user.verificationStatus === "VERIFIED" ? "✓" : "—"} sub={user.verificationStatus.toLowerCase()} />
            </>
          )}
        </div>

        {isOwner && (
          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 14 }}>My listings</h3>
            {listings.length === 0 ? (
              <p className="muted">No listings yet. <a href="/keyholder" style={{ color: "var(--leaf)" }}>List your property →</a></p>
            ) : (
              <table className="table">
                <thead><tr><th>Title</th><th>City</th><th>Rent</th><th>Status</th></tr></thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l.id}>
                      <td><a href={`/rentals/${l.id}`}><strong>{l.title}</strong></a></td>
                      <td className="muted">{l.city}</td>
                      <td className="tabular">{peso(Number(l.monthlyRent))}</td>
                      <td><span className="status ok">{l.listingStatus.toLowerCase()}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 14 }}>{isOwner ? "Applications received" : "My applications"}</h3>
          {applications.length === 0 ? (
            <p className="muted">Nothing here yet.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Listing</th>{isOwner && <th>Applicant</th>}<th>Status</th></tr></thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.listing.title}</strong><div className="muted" style={{ fontSize: ".8rem" }}>{a.listing.city}</div></td>
                    {isOwner && <td>{a.tenant.fullName}</td>}
                    <td><span className="status info">{a.status.toLowerCase()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!isOwner && (
          <div className="card card-pad">
            <h3 style={{ marginBottom: 14 }}>My inquiries</h3>
            {inquiries.length === 0 ? (
              <p className="muted">No inquiries sent yet. <a href="/rentals" style={{ color: "var(--leaf)" }}>Browse homes →</a></p>
            ) : (
              <table className="table">
                <tbody>
                  {inquiries.map((i) => (
                    <tr key={i.id}><td><strong>{i.listing.title}</strong></td><td><span className="status ok">{i.status.toLowerCase()}</span></td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub: string }) {
  return (
    <div className="card card-pad">
      <div className="eyebrow">{label}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, marginTop: 6 }}>{value}</div>
      <div className="muted" style={{ fontSize: ".84rem" }}>{sub}</div>
    </div>
  );
}
