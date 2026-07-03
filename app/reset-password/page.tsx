"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState<null | boolean>(null); // recovery session present?
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  // Establish the recovery session, tolerating either delivery path:
  //  1) via /auth/callback, which already exchanged the code → session cookie set
  //  2) directly here with a ?code= (or a #recovery token) still in the URL
  useEffect(() => {
    const supabase = createClient();

    // Fires when Supabase auto-detects a recovery token in the URL hash.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) setReady(true);
    });

    (async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState({}, "", url.pathname); // strip the code from the address bar
        setReady(!error);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      setReady(!!user);
    })();

    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) { setErr("Use at least 8 characters."); return; }
    if (password !== confirm) { setErr("Those passwords don’t match."); return; }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
    setTimeout(() => { router.push("/rentals"); router.refresh(); }, 1400);
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
          Choose a <span>new password</span> and you&apos;re back in.
        </p>
        <p style={{ color: "rgba(255,255,255,.55)", fontSize: ".84rem" }}>
          Use at least 8 characters. Don&apos;t reuse a password from another site.
        </p>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          {ready === false ? (
            <>
              <h1>Link expired</h1>
              <p className="muted" style={{ margin: "8px 0 22px" }}>
                This reset link is invalid or has already been used. Request a fresh one.
              </p>
              <a className="btn btn-primary btn-block btn-lg" href="/forgot-password">Send a new link</a>
            </>
          ) : done ? (
            <>
              <h1>Password updated</h1>
              <div className="banner green" style={{ margin: "12px 0", fontSize: ".9rem" }}>
                Your password has been changed. Taking you to Balaymo…
              </div>
            </>
          ) : (
            <>
              <h1>Set a new password</h1>
              <p className="muted" style={{ margin: "8px 0 26px" }}>Almost done — pick something you&apos;ll remember.</p>

              {err && <div className="banner" style={{ background: "var(--danger-soft)", marginBottom: 16, fontSize: ".88rem" }}>{err}</div>}

              <form onSubmit={onSubmit}>
                <div className="field-group">
                  <label>New password</label>
                  <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                </div>
                <div className="field-group">
                  <label>Confirm new password</label>
                  <input className="input" type="password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
                </div>
                <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy || ready === null}>
                  {ready === null ? "Verifying link…" : busy ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}

          <p className="muted" style={{ textAlign: "center", marginTop: 24, fontSize: ".92rem" }}>
            <a href="/login" style={{ color: "var(--leaf)", fontWeight: 600 }}>Back to log in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
