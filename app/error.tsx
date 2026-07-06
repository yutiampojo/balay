"use client";

import { useEffect } from "react";

// Branded error boundary for the app (replaces Next.js's raw default screen).
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div
      className="wrap"
      style={{ minHeight: "62vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "56px 24px", gap: 6 }}
    >
      <img src="/logo-mark.png" alt="" width={48} height={48} style={{ marginBottom: 10 }} />
      <h1 style={{ fontSize: "1.9rem", color: "var(--ink)" }}>Something went wrong</h1>
      <p className="muted" style={{ maxWidth: "42ch", margin: "6px 0 22px" }}>
        A hiccup on our end — not you. You can try again, or head back home.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button className="btn btn-primary" onClick={reset}>Try again</button>
        <a className="btn btn-ghost" href="/">Go home</a>
      </div>
    </div>
  );
}
