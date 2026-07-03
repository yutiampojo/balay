"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Remembers the previously-active tab ACROSS client-side navigations. The nav
// re-mounts on each route change, but this module variable survives (the JS
// isn't reloaded), so we can slide the dot from the old tab to the new one.
let lastActiveKey: string | null = null;

export type NavTab = {
  key: string;
  href: string;
  label: React.ReactNode; // icon + text, built on the server
  badge?: number;
};

// Which tab the current URL belongs to (nav lives in a persistent layout, so
// it can't be told the active tab by the page — it derives it from the path).
// `keys` is the set of tabs actually shown, so we can pick a sensible fallback
// (e.g. the keyholder wizard belongs to "Hosting" for logged-in hosts).
function activeKeyFor(pathname: string, keys: Set<string>): string | null {
  if (pathname.startsWith("/rentals")) return "rentals";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/owner")) return "hosting";
  if (pathname.startsWith("/keyholder")) return keys.has("hosting") ? "hosting" : "keyholder";
  if (pathname.startsWith("/saved")) return "saved";
  if (pathname.startsWith("/messages")) return "messages";
  if (pathname.startsWith("/admin")) return "admin";
  return null;
}

export default function NavTabs({ tabs }: { tabs: NavTab[] }) {
  const keys = new Set(tabs.map((t) => t.key));
  const activeKey = activeKeyFor(usePathname(), keys);
  const wrapRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [dot, setDot] = useState<{ x: number; show: boolean; animate: boolean }>({ x: 0, show: false, animate: false });

  const centerOf = (key: string | null) => {
    const wrap = wrapRef.current;
    const el = key ? linkRefs.current[key] : null;
    if (!wrap || !el) return null;
    const w = wrap.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    if (b.width === 0) return null; // hidden (mobile) — skip
    return b.left - w.left + b.width / 2;
  };

  useLayoutEffect(() => {
    const target = centerOf(activeKey);
    if (target == null) {
      setDot((d) => ({ ...d, show: false }));
      return;
    }
    const from = lastActiveKey && lastActiveKey !== activeKey ? centerOf(lastActiveKey) : null;
    if (from != null) {
      // place at the previous tab (no transition), then slide to the new one
      setDot({ x: from, show: true, animate: false });
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setDot({ x: target, show: true, animate: true }))
      );
    } else {
      setDot({ x: target, show: true, animate: false });
    }
    lastActiveKey = activeKey;

    const onResize = () => {
      const t = centerOf(activeKey);
      if (t != null) setDot({ x: t, show: true, animate: false });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, tabs.length]);

  return (
    <div className="navlinks" ref={wrapRef}>
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          ref={(el) => { linkRefs.current[t.key] = el; }}
          className={t.key === activeKey ? "current" : undefined}
          aria-current={t.key === activeKey ? "page" : undefined}
        >
          {t.label}
          {t.badge ? <span className="nav-badge">{t.badge}</span> : null}
        </Link>
      ))}
      {dot.show && (
        <span
          className="nav-dot"
          style={{ transform: `translateX(${dot.x - 3}px)`, transition: dot.animate ? undefined : "none" }}
        />
      )}
    </div>
  );
}
