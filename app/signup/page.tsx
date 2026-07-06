"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("TENANT");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setBusy(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });
    setBusy(false);

    if (error) {
      setErr(error.message);
      return;
    }
    if (data.session) {
      router.push("/rentals");
      router.refresh();
    } else {
      setMsg("Check your email to confirm your account, then log in.");
    }
  }

  return (
    <div className="auth">
      <div className="auth-aside">
        <a className="brand" href="/">
          <img className="mark" src="/logo-mark-white.png" alt="" width="30" height="30" />
          Balaymo
        </a>
        <p className="auth-quote">
          One account to <span>rent a home</span> or list your own — verified, monthly, from three months.
        </p>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".84rem" }}>
          3-month+ rentals for reviewers, students, professionals, and long stays.
        </p>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="muted" style={{ margin: "8px 0 26px" }}>Find a home, or list your property.</p>

          {err && <div className="banner" style={{ background: "var(--danger-soft)", marginBottom: 16, fontSize: ".88rem" }}>{err}</div>}
          {msg && <div className="banner green" style={{ marginBottom: 16, fontSize: ".88rem" }}>{msg}</div>}

          <form onSubmit={onSubmit}>
            <div className="field-group">
              <label>Full name</label>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Email</label>
              <input className="input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input className="input" type="password" placeholder="••••••••" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <span className="sub">At least 6 characters.</span>
            </div>
            <div className="field-group">
              <label>I want to…</label>
              <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="TENANT">Rent a home (Tenant)</option>
                <option value="OWNER">List my property (Owner)</option>
              </select>
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy}>
              {busy ? <><span className="spinner" aria-hidden="true" />Creating…</> : "Create account"}
            </button>
          </form>

          <p className="muted" style={{ textAlign: "center", marginTop: 24, fontSize: ".92rem" }}>
            Already have an account? <a href="/login" style={{ color: "var(--leaf)", fontWeight: 600 }}>Log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
