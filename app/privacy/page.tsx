import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Balaymo",
  description: "How Balaymo collects, uses, and protects your personal information under the Philippine Data Privacy Act of 2012 (RA 10173).",
};

const s: React.CSSProperties = { maxWidth: "70ch" };

export default function PrivacyPage() {
  return (
    <>
      <div className="wrap pagehead">
        <div className="eyebrow">Legal</div>
        <h1>Privacy Policy</h1>
        <p>Last updated: July 7, 2026</p>
      </div>

      <main className="wrap" style={{ paddingBottom: 72 }}>
        <div className="banner" style={{ background: "var(--gold-soft)", marginBottom: 24, maxWidth: "70ch" }}>
          This is a starting template and does not constitute legal advice. Have it reviewed by a Philippine lawyer / your Data Protection Officer before you rely on it.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22, color: "var(--ink)", lineHeight: 1.7 }}>
          <section style={s}>
            <p>Balaymo (“we”, “us”) respects your privacy. This policy explains what personal information we collect, why, and your rights under the <strong>Philippine Data Privacy Act of 2012 (RA 10173)</strong> and its implementing rules.</p>
          </section>

          <section style={s}>
            <h2>1. Information we collect</h2>
            <p>Account details (name, email, and, if provided, phone number and profile photo); listing information you submit as a Keyholder; verification information (e.g., identity or ownership documents you upload); messages and inquiries you send through the platform; and technical data such as your IP address and device/browser information used to operate and secure the service.</p>
          </section>

          <section style={s}>
            <h2>2. How we use your information</h2>
            <p>To create and manage your account; to publish and manage listings; to enable messaging, applications, and tenancies; to perform trust-and-safety and verification checks; to send transactional emails (such as sign-up confirmation and password resets); to prevent fraud and abuse; and to comply with legal obligations.</p>
          </section>

          <section style={s}>
            <h2>3. Legal basis</h2>
            <p>We process your information based on your consent, the performance of our contract with you (providing the service), our legitimate interests (security and improvement of the platform), and compliance with law.</p>
          </section>

          <section style={s}>
            <h2>4. Sharing</h2>
            <p>We share limited information between users as needed for the service to work — for example, your name and message are shown to a Keyholder when you inquire. We use trusted service providers to host and run Balaymo, including <strong>Supabase</strong> (database and authentication) and <strong>Vercel</strong> (hosting), and <strong>Resend</strong> (email delivery). We do not sell your personal information.</p>
          </section>

          <section style={s}>
            <h2>5. Storage &amp; security</h2>
            <p>Your data is stored on our providers&apos; infrastructure with access controls and encryption in transit. We retain personal information for as long as your account is active or as needed to provide the service and comply with legal obligations.</p>
          </section>

          <section style={s}>
            <h2>6. Your rights</h2>
            <p>Under the Data Privacy Act, you have the right to be informed, to access, to object, to correct, to erasure or blocking, and to data portability, as well as the right to lodge a complaint with the National Privacy Commission. To exercise these rights, contact us using the details below.</p>
          </section>

          <section style={s}>
            <h2>7. Cookies</h2>
            <p>We use essential cookies to keep you signed in and to keep the platform secure. We do not use third-party advertising cookies.</p>
          </section>

          <section style={s}>
            <h2>8. Children</h2>
            <p>Balaymo is not directed to individuals under 18, and we do not knowingly collect their personal information.</p>
          </section>

          <section style={s}>
            <h2>9. Changes</h2>
            <p>We may update this policy from time to time. We will post the updated version here with a new “last updated” date.</p>
          </section>

          <section style={s}>
            <h2>10. Contact</h2>
            <p>For privacy questions or to exercise your rights, email <a href="mailto:privacy@balaymo.com" style={{ color: "var(--leaf)" }}>privacy@balaymo.com</a>.</p>
          </section>
        </div>
      </main>
    </>
  );
}
