"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const supabase = createClient();
    // The recovery link routes through /auth/callback, which exchanges the code
    // for a session, then drops the user on /reset-password to set a new password.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/callback?next=/reset-password`,
    });
    setBusy(false);
    if (error) {
      // Supabase can return an unhelpful/empty error body (e.g. "{}") when the
      // send itself fails; never surface raw server text to the user.
      console.error("Password reset request failed:", error);
      setErr("We couldn't send the reset link right now. Please try again in a moment.");
    } else {
      setSent(true);
    }
  }

  return (
    <div className="auth">
      <div className="auth-aside">
        <a className="brand" href="/">
          <svg className="mark" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="9" fill="#fff" />
            <path d="M16 7l7 6v11a1 1 0 0 1-1 1h-4v-6h-4v6h-4a1 1 0 0 1-1-1V13l7-6z" fill="#13322A" />
            <circle cx="22.5" cy="9.5" r="3.4" fill="#A9761D" stroke="#fff" strokeWidth="1.4" />
          </svg>
          Balaymo
        </a>
        <p className="auth-quote">
          Locked out? <span>No problem</span> — we&apos;ll email you a secure link to reset your password.
        </p>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".84rem" }}>
          The link is valid for a short time and can only be used once.
        </p>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h1>Reset your password</h1>
          <p className="muted" style={{ margin: "8px 0 26px" }}>
            Enter the email on your account and we&apos;ll send a reset link.
          </p>

          {err && <div className="banner" style={{ background: "var(--danger-soft)", marginBottom: 16, fontSize: ".88rem" }}>{err}</div>}

          {sent ? (
            <div className="banner green" style={{ marginBottom: 16, fontSize: ".9rem" }}>
              <span style={{ overflowWrap: "anywhere" }}>
                If an account exists for <strong>{email}</strong>, a reset link is on its way. Check your inbox (and spam).
              </span>
            </div>
          ) : (
            <form onSubmit={onSubmit}>
              <div className="field-group">
                <label>Email</label>
                <input className="input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
                {busy ? <><span className="spinner" aria-hidden="true" />Sending…</> : "Send reset link"}
              </button>
            </form>
          )}

          <p className="muted" style={{ textAlign: "center", marginTop: 24, fontSize: ".92rem" }}>
            Remembered it? <a href="/login" style={{ color: "var(--leaf)", fontWeight: 600 }}>Back to log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
