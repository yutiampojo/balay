import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import SiteNav from "@/app/components/SiteNav";
import KeyholderForm from "./KeyholderForm";

export const dynamic = "force-dynamic";

export default async function KeyholderPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/keyholder");
  if (user.role === "OWNER") redirect("/owner");

  return (
    <>
      <SiteNav />

      <section style={{ background: "var(--ink)", color: "#fff", padding: "56px 0 50px" }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1.3fr .7fr", gap: 48, alignItems: "center" }}>
          <div>
            <p className="eyebrow" style={{ color: "var(--gold-soft)" }}>For users who want to list</p>
            <h1 style={{ fontSize: "clamp(2.1rem,4vw,3rem)", color: "#fff", marginTop: 8 }}>Become a Keyholder</h1>
            <p style={{ color: "rgba(255,255,255,.78)", marginTop: 16, fontSize: "1.1rem", maxWidth: "50ch" }}>
              Every Balay account can rent. To <em>list</em> a property, you verify once and earn the Keyholder badge — proof to tenants that you&apos;re a real, authorized owner.
            </p>
            <div style={{ display: "flex", gap: 24, marginTop: 28, flexWrap: "wrap" }}>
              <div><div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>~5 min</div><div style={{ color: "rgba(255,255,255,.6)", fontSize: ".84rem" }}>to apply</div></div>
              <div><div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>1–2 days</div><div style={{ color: "rgba(255,255,255,.6)", fontSize: ".84rem" }}>admin review</div></div>
              <div><div style={{ fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 700 }}>₱0</div><div style={{ color: "rgba(255,255,255,.6)", fontSize: ".84rem" }}>basic verification</div></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ background: "linear-gradient(140deg,#1c4d3e,#0e2a22)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 22, padding: 30, textAlign: "center", boxShadow: "var(--shadow-lg)", width: 260 }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: "var(--gold-soft)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8"><path d="m15 7 5 5-5 5M3 12h17" /><circle cx="5" cy="12" r="2.4" fill="var(--gold)" /></svg>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem" }}>Keyholder</div>
              <div style={{ color: "rgba(255,255,255,.6)", fontSize: ".82rem", marginTop: 4 }}>Verified to list</div>
              <div style={{ marginTop: 16, display: "grid", gap: 8, textAlign: "left", fontSize: ".84rem", color: "rgba(255,255,255,.82)" }}>
                <div>✓ Identity confirmed</div><div>✓ Authorized to lease</div><div>✓ Listing tools unlocked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="wrap-narrow" style={{ padding: "48px 24px" }}>
        <div className="stepper">
          <div className="s done"><div className="n">Step 1</div>Identity</div>
          <div className="s active"><div className="n">Step 2</div>Property authority</div>
          <div className="s"><div className="n">Step 3</div>Confirm &amp; submit</div>
        </div>
        <KeyholderForm fullName={user.fullName} />
      </main>

      <footer>
        <div className="wrap">
          <p className="disclaimer">Verification confirms identity and authority to lease for trust and safety. It is not legal advice and does not make Balay a party to any lease. Keyholders remain solely responsible for the legality, accuracy, and availability of their listings.</p>
          <div className="foot-base"><span>© 2026 Balay</span><a href="/dashboard">Back to dashboard</a></div>
        </div>
      </footer>
    </>
  );
}
