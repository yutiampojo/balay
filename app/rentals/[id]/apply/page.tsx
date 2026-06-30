import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/app/components/SiteNav";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";

const peso = (n: number) => "₱" + n.toLocaleString("en-PH");

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/rentals/${id}/apply`);

  const listing = await prisma.listing.findFirst({
    where: { id, listingStatus: "PUBLISHED" },
    include: { owner: { select: { fullName: true } } },
  });
  if (!listing) notFound();

  return (
    <>
      <SiteNav />
      <div className="wrap pagehead">
        <div className="crumbs"><a href={`/rentals/${id}`}>{listing.title}</a> <span>›</span> <span>Apply</span></div>
        <h1>Apply to rent</h1>
      </div>

      <main className="wrap-narrow" style={{ padding: "8px 24px 56px" }}>
        <div className="card card-pad" style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
          <div className="thumb-grad" style={{ width: 84, height: 64, borderRadius: 12, flex: "0 0 auto" }} />
          <div className="grow">
            <strong>{listing.title}</strong>
            <div className="muted" style={{ fontSize: ".85rem" }}>{listing.city} · {listing.barangay} · {peso(Number(listing.monthlyRent))}/mo · {listing.minimumLeaseMonths}-month minimum</div>
          </div>
          <span className="keyholder-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 7 5 5-5 5M4 12h16" /></svg>Keyholder</span>
        </div>

        <ApplyForm listingId={listing.id} />
      </main>
    </>
  );
}
