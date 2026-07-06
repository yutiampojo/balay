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
    if (error) {
      setBusy(false);
      setErr(error.message);
      return;
    }
    // Keep the button in its loading state through the navigation — the
    // /rentals page is server-rendered, so leave the spinner up until it lands.
    router.push("/rentals");
    router.refresh();
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
          <img className="mark" src="/logo-mark-white.png" alt="" width="30" height="30" />
          Balaymo
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
                <a href="/forgot-password" style={{ fontWeight: 500, color: "var(--leaf)" }}>Forgot?</a>
              </label>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <label className="checkrow" style={{ margin: "4px 0 18px" }}>
              <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
              Keep me logged in on this device
            </label>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
              {busy ? <><span className="spinner" aria-hidden="true" />Logging in…</> : "Log in"}
            </button>
          </form>

          <div className="divider">or</div>
          <div className="soc">
            <button type="button" className="btn btn-ghost" onClick={onGoogle}>Google</button>
            <button type="button" className="btn btn-ghost" onClick={onMagicLink}>Email link</button>
          </div>

          <p className="muted" style={{ textAlign: "center", marginTop: 24, fontSize: ".92rem" }}>
            New to Balaymo? <a href="/signup" style={{ color: "var(--leaf)", fontWeight: 600 }}>Create an account</a>
          </p>
        </div>
      </div>
    </div>
  );
}
