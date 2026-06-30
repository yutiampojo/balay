import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/app/components/SiteNav";
import ListingForm from "./ListingForm";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/owner/listings/new");
  if (user.role !== "OWNER") redirect("/keyholder");

  return (
    <>
      <SiteNav />
      <div className="wrap pagehead">
        <div className="crumbs"><a href="/dashboard">Dashboard</a> <span>›</span> <span>New listing</span></div>
        <h1>Create a listing</h1>
      </div>

      <main className="wrap-narrow" style={{ padding: "8px 24px 56px" }}>
        <div className="banner green" style={{ marginBottom: 24 }}>
          <span className="ico"><span className="keyholder-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 7 5 5-5 5M4 12h16" /></svg>Verified Keyholder</span></span>
          <div className="grow">You&apos;re listing as <strong>{user.fullName}</strong>. This listing needs admin review before it goes public.</div>
        </div>
        <ListingForm />
      </main>

      <footer><div className="wrap"><div className="foot-base"><span>© 2026 Balay</span><a href="/dashboard">Back to dashboard</a></div></div></footer>
    </>
  );
}
