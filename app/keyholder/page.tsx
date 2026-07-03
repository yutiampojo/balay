import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import HostWizard from "./HostWizard";

export const dynamic = "force-dynamic";

export default async function KeyholderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/keyholder");

  return (
    <>

      <section style={{ background: "var(--ink)", color: "#fff", padding: "52px 0 44px" }}>
        <div className="wrap">
          <p className="eyebrow" style={{ color: "var(--gold-soft)" }}>Become a host</p>
          <h1 style={{ fontSize: "clamp(2rem,4vw,2.8rem)", color: "#fff", marginTop: 8 }}>List your place on Balaymo</h1>
          <p style={{ color: "rgba(255,255,255,.78)", marginTop: 14, fontSize: "1.08rem", maxWidth: "56ch" }}>
            A few quick questions about your property and you&apos;re done. You keep your renter account — hosting is just added on top.
          </p>
        </div>
      </section>

      <main className="wrap-narrow" style={{ padding: "40px 24px 56px" }}>
        <HostWizard />
      </main>

      <footer>
        <div className="wrap">
          <p className="disclaimer">Verification confirms identity and authority to lease for trust and safety. It is not legal advice and does not make Balaymo a party to any lease. Keyholders remain solely responsible for the legality, accuracy, and availability of their listings.</p>
          <div className="foot-base"><span>© 2026 Balaymo</span><a href="/dashboard">Back to dashboard</a></div>
        </div>
      </footer>
    </>
  );
}
