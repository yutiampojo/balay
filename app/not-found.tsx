import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found — Balaymo" };

export default function NotFound() {
  return (
    <div
      className="wrap"
      style={{ minHeight: "62vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "56px 24px", gap: 6 }}
    >
      <img src="/logo-mark.png" alt="" width={48} height={48} style={{ marginBottom: 10 }} />
      <h1 style={{ fontSize: "1.9rem", color: "var(--ink)" }}>Page not found</h1>
      <p className="muted" style={{ maxWidth: "42ch", margin: "6px 0 22px" }}>
        That page doesn&apos;t exist, or the listing may have been rented or removed.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <a className="btn btn-primary" href="/rentals">Browse homes</a>
        <a className="btn btn-ghost" href="/">Go home</a>
      </div>
    </div>
  );
}
