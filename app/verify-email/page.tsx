import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check your email — Balaymo" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;

  return (
    <div className="auth">
      <div className="auth-aside">
        <a className="brand" href="/">
          <img className="mark" src="/logo-mark-white.png" alt="" width="30" height="30" />
          Balaymo
        </a>
        <p className="auth-quote">
          Almost there — <span>confirm your email</span> to activate your account.
        </p>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".84rem" }}>
          The confirmation link is valid for a short time and can only be used once.
        </p>
      </div>

      <div className="auth-main">
        <div className="auth-card" style={{ textAlign: "center" }}>
          <div
            style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--mist)", color: "var(--leaf)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
          </div>

          <h1>Check your email</h1>
          <p className="muted" style={{ margin: "10px 0 24px" }}>
            We sent a confirmation link to{" "}
            {email ? <strong style={{ color: "var(--ink)", overflowWrap: "anywhere" }}>{email}</strong> : "your inbox"}. Click it to
            activate your account, then log in.
          </p>

          <a className="btn btn-primary btn-block btn-lg" href="/login">Back to log in</a>

          <p className="muted" style={{ marginTop: 22, fontSize: ".92rem" }}>
            Didn&apos;t get it? Check your spam folder, or{" "}
            <a href="/signup" style={{ color: "var(--leaf)", fontWeight: 600 }}>try again</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
