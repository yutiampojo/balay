"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavTab } from "./NavTabs";

// Hamburger menu for phones. The desktop `.navlinks` are hidden under 680px, so
// this drawer is the only way to reach the nav on mobile (plus the auth actions,
// which also move here since `.nav-cta` is hidden on mobile).
export default function MobileMenu({
  tabs,
  loggedIn,
  firstName,
}: {
  tabs: NavTab[];
  loggedIn: boolean;
  firstName?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll and close on Escape while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        className="menu-btn"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
        </svg>
      </button>

      {open && (
        <>
          <div className="mobile-menu-ov" onClick={() => setOpen(false)} />
          <nav className="mobile-menu">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={t.href}
                onClick={() => setOpen(false)}
                className={pathname.startsWith(t.href) ? "current" : undefined}
              >
                {t.label}
                {t.badge ? <span className="nav-badge">{t.badge}</span> : null}
              </Link>
            ))}
            <div className="mobile-menu-auth">
              {loggedIn ? (
                <>
                  <Link className="btn btn-ghost btn-block" href="/profile" onClick={() => setOpen(false)}>
                    Profile{firstName ? ` · ${firstName}` : ""}
                  </Link>
                  <form action="/logout" method="post">
                    <button type="submit" className="btn btn-ghost btn-block">Log out</button>
                  </form>
                </>
              ) : (
                <>
                  <Link className="btn btn-ghost btn-block" href="/login" onClick={() => setOpen(false)}>Log in</Link>
                  <Link className="btn btn-primary btn-block" href="/signup" onClick={() => setOpen(false)}>Sign up</Link>
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
