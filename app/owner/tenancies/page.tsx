import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const fmt = (d: Date | null) => (d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }) : null);

function duration(start: Date, end: Date | null) {
  const ms = (end ? new Date(end).getTime() : Date.now()) - new Date(start).getTime();
  const days = Math.max(0, Math.round(ms / 86_400_000));
  if (days < 31) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.floor(days / 30.44);
  const remDays = days - Math.round(months * 30.44);
  return `${months} mo${remDays > 0 ? ` ${remDays} d` : ""}`;
}

const STATUS = {
  ACTIVE: { label: "Active", cls: "info" },
  COMPLETED: { label: "Completed", cls: "ok" },
  ENDED_EARLY: { label: "Ended early", cls: "rejected" },
} as const;

export default async function TenancyHistory() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/owner/tenancies");
  if (user.role !== "OWNER") redirect("/keyholder");

  const tenancies = await prisma.tenancy.findMany({
    where: { ownerId: user.id },
    orderBy: { startedAt: "desc" },
    include: {
      listing: { select: { id: true, title: true, city: true, barangay: true } },
      tenant: { select: { fullName: true, email: true } },
    },
  });

  const active = tenancies.filter((t) => t.status === "ACTIVE").length;

  return (
    <>
      <div className="wrap pagehead">
        <div className="crumbs"><a href="/owner">Hosting</a> <span>›</span> <span>Tenancy history</span></div>
        <h1>Tenancy history</h1>
        <p>A record of every tenant who has occupied your properties — {tenancies.length} total, {active} active.</p>
      </div>

      <main className="wrap" style={{ paddingBottom: 64 }}>
        <div className="card card-pad">
          {tenancies.length === 0 ? (
            <p className="muted">No tenancies yet. When you accept an applicant, their tenancy is recorded here.</p>
          ) : (
            <table className="table">
              <thead>
                <tr><th>Property</th><th>Tenant</th><th>Period</th><th>Duration</th><th>Agreed term</th><th>Status</th><th>Reason</th></tr>
              </thead>
              <tbody>
                {tenancies.map((t) => {
                  const s = STATUS[t.status];
                  return (
                    <tr key={t.id}>
                      <td><a href={`/rentals/${t.listing.id}`}><strong style={{ color: "var(--leaf)" }}>{t.listing.title}</strong></a><div className="muted" style={{ fontSize: ".78rem" }}>{t.listing.city} · {t.listing.barangay}</div></td>
                      <td>{t.tenant.fullName}<div className="muted" style={{ fontSize: ".78rem" }}>{t.tenant.email}</div></td>
                      <td>{fmt(t.startedAt)} → {fmt(t.endedAt) ?? <span className="muted">ongoing</span>}</td>
                      <td>{duration(t.startedAt, t.endedAt)}</td>
                      <td>{t.agreedLeaseMonths} mo</td>
                      <td><span className={`status ${s.cls}`}>{s.label}</span></td>
                      <td className="muted" style={{ fontSize: ".84rem" }}>{t.endReason || (t.status === "ACTIVE" ? "—" : "No reason given")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
