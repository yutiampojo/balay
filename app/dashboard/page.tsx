import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PhoneReminder from "@/app/components/PhoneReminder";
import ReviewForm from "@/app/components/ReviewForm";
import { getReviewableTenancies } from "@/lib/reviews";

const fmtRange = (a: Date, b: Date | null) => {
  const o = (d: Date) => new Date(d).toLocaleDateString("en-PH", { month: "short", year: "numeric" });
  return `${o(a)} – ${b ? o(b) : "now"}`;
};

export const dynamic = "force-dynamic";

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const isOwner = user.role === "OWNER";

  // Renting view — the same for everyone (owners can rent too).
  const [applications, inquiries] = await Promise.all([
    prisma.application.findMany({
      where: { tenantId: user.id },
      include: { listing: { select: { id: true, title: true, city: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inquiry.findMany({
      where: { tenantId: user.id },
      include: { listing: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Past stays this user can review (as the tenant).
  const pastStays = (await getReviewableTenancies(user.id)).filter((t) => t.asTenant);

  return (
    <>

      <div className="wrap pagehead">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div className="avatar" style={{ width: 56, height: 56, overflow: "hidden" }}>
            {user.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
            )}
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem" }}>{user.fullName}</h1>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <span className="status ok">Renter</span>
              {isOwner && <span className="keyholder-badge" style={{ padding: ".26rem .6rem", fontSize: ".76rem" }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 7 5 5-5 5M4 12h16" /></svg>Keyholder</span>}
            </div>
          </div>
        </div>
      </div>

      <PhoneReminder />

      {/* dual-role switch banner */}
      <div className="wrap" style={{ marginBottom: 24 }}>
        <div className="banner gold">
          <span className="ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="M15 7l5 5-5 5M4 12h16" /></svg></span>
          {isOwner ? (
            <>
              <div className="grow">You&apos;re also a <strong>Keyholder</strong>. Manage your listings and applications in your hosting dashboard.</div>
              <a className="btn btn-gold btn-sm" href="/owner">Go to hosting →</a>
            </>
          ) : (
            <>
              <div className="grow">Want to list your own place? Become a <strong>host</strong> — you keep this renter account.</div>
              <a className="btn btn-gold btn-sm" href="/keyholder">Become a host →</a>
            </>
          )}
        </div>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        <div className="grid-3" style={{ marginBottom: 24 }}>
          <StatCard label="My applications" value={applications.length} sub="submitted" />
          <StatCard label="My inquiries" value={inquiries.length} sub="sent to owners" />
          <StatCard label="Verification" value={user.verificationStatus === "VERIFIED" ? "✓" : "—"} sub={user.verificationStatus.toLowerCase()} />
        </div>

        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 14 }}>My applications</h3>
          {applications.length === 0 ? (
            <p className="muted">No applications yet. <a href="/rentals" style={{ color: "var(--leaf)" }}>Browse homes →</a></p>
          ) : (
            <div className="table-scroll"><table className="table">
              <thead><tr><th>Listing</th><th>Status</th></tr></thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id}>
                    <td><a href={`/rentals/${a.listing.id}`}><strong style={{ color: "var(--leaf)" }}>{a.listing.title}</strong></a><div className="muted" style={{ fontSize: ".8rem" }}>{a.listing.city}</div></td>
                    <td><span className={`status ${a.status === "ACCEPTED" ? "ok" : a.status === "REJECTED" ? "rejected" : "info"}`}>{cap(a.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>

        {pastStays.length > 0 && (
          <div className="card card-pad" style={{ marginBottom: 24 }}>
            <h3 style={{ marginBottom: 4 }}>Your past stays</h3>
            <p className="muted" style={{ fontSize: ".86rem", marginBottom: 16 }}>Share how it went — your review helps other renters.</p>
            <div style={{ display: "grid", gap: 16 }}>
              {pastStays.map((t) => (
                <div key={t.id} style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                    <div>
                      <a href={`/rentals/${t.listing.id}`}><strong style={{ color: "var(--leaf)" }}>{t.listing.title}</strong></a>
                      <div className="muted" style={{ fontSize: ".8rem" }}>{t.listing.city} · {fmtRange(t.startedAt, t.endedAt)}</div>
                    </div>
                  </div>
                  <ReviewForm tenancyId={t.id} asTenant={true} counterpartyName={t.counterpartyName} existing={t.existing} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card card-pad">
          <h3 style={{ marginBottom: 14 }}>My inquiries</h3>
          {inquiries.length === 0 ? (
            <p className="muted">No inquiries sent yet.</p>
          ) : (
            <div className="table-scroll"><table className="table">
              <tbody>
                {inquiries.map((i) => (
                  <tr key={i.id}><td><strong>{i.listing.title}</strong></td><td><span className="status ok">{cap(i.status)}</span></td></tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
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
