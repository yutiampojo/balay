import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { decideApplication } from "@/app/owner/actions";

export const dynamic = "force-dynamic";

const cap = (s: string) => s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");
const statusClass = (s: string) => (s === "ACCEPTED" ? "ok" : s === "REJECTED" ? "rejected" : s === "SHORTLISTED" ? "info" : "pending");

export default async function ApplicationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/owner/applications/${id}`);

  const app = await prisma.application.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, city: true, barangay: true } },
      tenant: { select: { fullName: true, email: true, phoneNumber: true, verificationStatus: true } },
      documents: true,
    },
  });
  if (!app) notFound();
  if (app.ownerId !== user.id) redirect("/owner"); // only the listing's owner

  // Companion inquiry (stay details) — shares listing + tenant.
  const inquiry = await prisma.inquiry.findFirst({
    where: { listingId: app.listingId, tenantId: app.tenantId },
    orderBy: { createdAt: "desc" },
  });

  const decided = app.status === "ACCEPTED" || app.status === "REJECTED";

  return (
    <>
      <div className="wrap pagehead">
        <div className="crumbs"><a href="/owner">Hosting</a> <span>›</span> <span>Application</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <h1>{app.tenant.fullName}</h1>
          <span className={`status ${statusClass(app.status)}`}>{cap(app.status)}</span>
        </div>
        <p style={{ marginTop: 6 }}>Applied for <a href={`/rentals/${app.listing.id}`} style={{ color: "var(--leaf)", fontWeight: 600 }}>{app.listing.title}</a> · {app.listing.city} · {app.listing.barangay}</p>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        <div className="split">
          <div>
            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 14 }}>Applicant</h3>
              <div className="spec-list">
                <div className="it"><span>Full name</span><span>{app.tenant.fullName}</span></div>
                <div className="it"><span>Email</span><span>{app.tenant.email}</span></div>
                <div className="it"><span>Contact</span><span>{app.tenant.phoneNumber || "—"}</span></div>
                <div className="it"><span>Account</span><span>{cap(app.tenant.verificationStatus)}</span></div>
              </div>
            </div>

            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 14 }}>Application details</h3>
              <div className="spec-list">
                <div className="it"><span>Tenant type</span><span>{cap(app.tenantType)}</span></div>
                <div className="it"><span>Employment</span><span>{app.employmentStatus || "—"}</span></div>
                <div className="it"><span>Income range</span><span>{app.incomeRange || "—"}</span></div>
                <div className="it"><span>Consent given</span><span>{app.consentGiven ? "Yes" : "No"}</span></div>
                <div className="it"><span>Submitted</span><span>{new Date(app.createdAt).toLocaleDateString("en-PH")}</span></div>
              </div>
              {app.message && (
                <div style={{ marginTop: 16 }}>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>Message from applicant</div>
                  <p className="muted">{app.message}</p>
                </div>
              )}
            </div>

            <div className="card card-pad" style={{ marginBottom: 20 }}>
              <h3 style={{ marginBottom: 14 }}>Intended stay</h3>
              <div className="spec-list">
                <div className="it"><span>Preferred move-in</span><span>{inquiry?.preferredMoveInDate ? new Date(inquiry.preferredMoveInDate).toLocaleDateString("en-PH") : "—"}</span></div>
                <div className="it"><span>Lease length</span><span>{inquiry?.intendedLeaseMonths ? `${inquiry.intendedLeaseMonths} months` : "—"}</span></div>
                <div className="it"><span>Occupants</span><span>{inquiry?.numberOfOccupants ?? "—"}</span></div>
              </div>
            </div>

            <div className="card card-pad">
              <h3 style={{ marginBottom: 14 }}>Documents</h3>
              {app.documents.length === 0 ? (
                <p className="muted">No documents attached to this application.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {app.documents.map((d) => (
                    <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 10 }}>
                      <span>{cap(d.type)}{d.fileName ? ` · ${d.fileName}` : ""}</span>
                      <a className="btn btn-ghost btn-sm" href={d.fileUrl} target="_blank" rel="noopener noreferrer">Open</a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="aside-sticky">
            <div className="card card-pad">
              <div className="eyebrow">Your decision</div>
              <div style={{ marginTop: 10, marginBottom: 14 }}><span className={`status ${statusClass(app.status)}`}>{cap(app.status)}</span></div>
              {decided ? (
                <p className="muted" style={{ fontSize: ".86rem" }}>You&apos;ve already {app.status.toLowerCase()} this application.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <form action={decideApplication}><input type="hidden" name="applicationId" value={app.id} /><input type="hidden" name="status" value="SHORTLISTED" /><button className="btn btn-primary btn-block" type="submit">Shortlist</button></form>
                  <form action={decideApplication}><input type="hidden" name="applicationId" value={app.id} /><input type="hidden" name="status" value="ACCEPTED" /><button className="btn btn-gold btn-block" type="submit">Accept</button></form>
                  <form action={decideApplication}><input type="hidden" name="applicationId" value={app.id} /><input type="hidden" name="status" value="REJECTED" /><button className="btn btn-danger btn-block" type="submit">Decline</button></form>
                </div>
              )}
              <p className="muted" style={{ fontSize: ".78rem", marginTop: 14 }}>You decide directly — Balaymo never auto-approves or ranks applicants.</p>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
