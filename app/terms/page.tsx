import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Balaymo",
  description: "The terms that govern your use of Balaymo, a listing and rental-management platform for medium and long-term residential rentals in the Philippines.",
};

const s: React.CSSProperties = { maxWidth: "70ch" };

export default function TermsPage() {
  return (
    <>
      <div className="wrap pagehead">
        <div className="eyebrow">Legal</div>
        <h1>Terms of Service</h1>
        <p>Last updated: July 7, 2026</p>
      </div>

      <main className="wrap" style={{ paddingBottom: 72 }}>
        <div className="banner" style={{ background: "var(--gold-soft)", marginBottom: 24, maxWidth: "70ch" }}>
          This is a starting template and does not constitute legal advice. Have it reviewed by a Philippine lawyer before you rely on it.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, color: "var(--ink)", lineHeight: 1.7 }}>
          <section style={s}>
            <h2>1. About Balaymo</h2>
            <p>Balaymo (“we”, “us”) is an online listing and rental-management platform that helps property owners (“Keyholders”) and prospective tenants connect for medium and long-term residential rentals in the Philippines, typically for leases of three (3) months or more. By accessing or using Balaymo, you agree to these Terms.</p>
          </section>

          <section style={s}>
            <h2>2. Our role — what Balaymo is and isn&apos;t</h2>
            <p>Balaymo provides tools and trust checks. We do <strong>not</strong> own, operate, inspect, guarantee, or broker the listed properties, and we are <strong>not</strong> a real estate broker, agent, legal adviser, or property manager. We are not a party to any lease or agreement between a Keyholder and a tenant. Keyholders set their own lease terms and are solely responsible for the accuracy, legality, and availability of their listings.</p>
          </section>

          <section style={s}>
            <h2>3. Eligibility &amp; accounts</h2>
            <p>You must be at least 18 years old and able to enter into a binding contract. You are responsible for keeping your account credentials secure and for all activity under your account. Provide accurate information and keep it up to date.</p>
          </section>

          <section style={s}>
            <h2>4. Listings &amp; verification</h2>
            <p>Keyholders are responsible for the content of their listings. Verification badges indicate that we performed certain identity or ownership checks for trust and safety; they are not a guarantee of a property&apos;s condition, legality, or a Keyholder&apos;s conduct, and do not make Balaymo a party to any lease. Listings may be reviewed before they are published, and we may remove or suspend any listing at our discretion.</p>
          </section>

          <section style={s}>
            <h2>5. Applications, inquiries &amp; decisions</h2>
            <p>Keyholders decide on applications directly. Balaymo does not approve, rank, negotiate, or make decisions on either side&apos;s behalf. Any lease, payment, or arrangement is strictly between the Keyholder and the tenant.</p>
          </section>

          <section style={s}>
            <h2>6. Payments</h2>
            <p>Unless expressly stated, Balaymo does not collect rent, deposits, or broker fees, and does not process payments between users. Never send money before viewing and verifying a unit and the person you are dealing with.</p>
          </section>

          <section style={s}>
            <h2>7. Acceptable use</h2>
            <p>You agree not to post false, misleading, or unlawful content; harass, scam, or defraud other users; scrape or misuse the platform; or use Balaymo for anything other than genuine medium and long-term residential rentals. We may suspend or terminate accounts that violate these Terms.</p>
          </section>

          <section style={s}>
            <h2>8. Disclaimers &amp; limitation of liability</h2>
            <p>Balaymo is provided “as is,” without warranties of any kind. To the maximum extent permitted by law, we are not liable for any loss or damage arising from your dealings with other users, the condition or legality of any property, or your use of the platform.</p>
          </section>

          <section style={s}>
            <h2>9. Changes &amp; termination</h2>
            <p>We may update these Terms or modify or discontinue the service at any time. Continued use after changes means you accept the updated Terms. You may stop using Balaymo at any time.</p>
          </section>

          <section style={s}>
            <h2>10. Governing law</h2>
            <p>These Terms are governed by the laws of the Republic of the Philippines. Disputes are subject to the exclusive jurisdiction of the appropriate courts in the Philippines.</p>
          </section>

          <section style={s}>
            <h2>11. Contact</h2>
            <p>Questions about these Terms? Email us at <a href="mailto:hello@balaymo.com" style={{ color: "var(--leaf)" }}>hello@balaymo.com</a>.</p>
          </section>
        </div>
      </main>
    </>
  );
}
