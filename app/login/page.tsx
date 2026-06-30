"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keep, setKeep] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    router.push("/rentals");
    router.refresh();
  }

  async function onForgot() {
    if (!email) {
      setErr("Enter your email above first, then click Forgot.");
      return;
    }
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/login`,
    });
    if (error) setErr(error.message);
    else setMsg("Password reset link sent — check your email.");
  }

  async function onGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=/rentals` },
    });
    if (error) setErr("Google sign-in isn't enabled yet. Use email & password.");
  }

  async function onMagicLink() {
    if (!email) {
      setErr("Enter your email above first, then click Email link.");
      return;
    }
    setErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/rentals` },
    });
    if (error) setErr(error.message);
    else setMsg("Login link sent — check your email.");
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
          Balay
        </a>
        <p className="auth-quote">
          Homes for the <span>long stay</span> — verified, monthly, from three months.
        </p>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".84rem" }}>
          3-month+ rentals for reviewers, students, professionals, and long stays.
        </p>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="muted" style={{ margin: "8px 0 26px" }}>
            Log in to manage your rentals, applications, and listings.
          </p>

          {err && <div className="banner" style={{ background: "var(--danger-soft)", marginBottom: 16, fontSize: ".88rem" }}>{err}</div>}
          {msg && <div className="banner green" style={{ marginBottom: 16, fontSize: ".88rem" }}>{msg}</div>}

          <form onSubmit={onSubmit}>
            <div className="field-group">
              <label>Email</label>
              <input className="input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field-group">
              <label style={{ display: "flex", justifyContent: "space-between" }}>
                Password
                <a role="button" onClick={onForgot} style={{ fontWeight: 500, color: "var(--leaf)", cursor: "pointer" }}>Forgot?</a>
              </label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <label className="checkrow" style={{ margin: "4px 0 18px" }}>
              <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
              Keep me logged in on this device
            </label>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>

          <div className="divider">or</div>
          <div className="soc">
            <button type="button" className="btn btn-ghost" onClick={onGoogle}>Google</button>
            <button type="button" className="btn btn-ghost" onClick={onMagicLink}>Email link</button>
          </div>

          <p className="muted" style={{ textAlign: "center", marginTop: 24, fontSize: ".92rem" }}>
            New to Balay? <a href="/signup" style={{ color: "var(--leaf)", fontWeight: 600 }}>Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
