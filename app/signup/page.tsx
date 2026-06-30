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
    // If email confirmation is OFF, a session exists immediately.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setMsg("Check your email to confirm your account, then log in.");
    }
  }

  return (
    <main className="wrap-narrow" style={{ paddingTop: 60, paddingBottom: 60, maxWidth: 460 }}>
      <a className="brand" href="/" style={{ marginBottom: 24 }}>
        <svg className="mark" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="9" fill="#13322A" />
          <path d="M16 7l7 6v11a1 1 0 0 1-1 1h-4v-6h-4v6h-4a1 1 0 0 1-1-1V13l7-6z" fill="#fff" />
          <circle cx="22.5" cy="9.5" r="3.4" fill="#A9761D" stroke="#13322A" strokeWidth="1.4" />
        </svg>
        Balay
      </a>
      <div className="card card-pad">
        <h1 style={{ fontSize: "1.6rem", marginBottom: 4 }}>Create your account</h1>
        <p className="muted" style={{ fontSize: ".92rem", marginBottom: 20 }}>
          Find a home, or list your property.
        </p>

        {err && <div className="banner" style={{ background: "var(--danger-soft)", marginBottom: 16, fontSize: ".88rem" }}>{err}</div>}
        {msg && <div className="banner green" style={{ marginBottom: 16, fontSize: ".88rem" }}>{msg}</div>}

        <form onSubmit={onSubmit}>
          <div className="field-group">
            <label>Full name</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="field-group">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input className="input" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
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
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="muted" style={{ fontSize: ".88rem", marginTop: 16, textAlign: "center" }}>
          Already have an account? <a href="/login" style={{ color: "var(--leaf)", fontWeight: 600 }}>Log in</a>
        </p>
      </div>
    </main>
  );
}
