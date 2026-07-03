"use client";

import { useEffect, useState } from "react";

export type AdminTab = { key: string; label: string; badge?: number; content: React.ReactNode };

// Sub-tab switcher for the admin console. Sections are server-rendered and
// passed as `content`; all stay mounted (hidden when inactive) so client state
// like the Active-listings search survives tab switches. The active tab is
// mirrored to the URL hash so server-action redirects can land back on it.
export default function AdminTabs({ tabs }: { tabs: AdminTab[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  useEffect(() => {
    const fromHash = window.location.hash.replace("#", "");
    if (fromHash && tabs.some((t) => t.key === fromHash)) setActive(fromHash);
  }, [tabs]);

  const select = (key: string) => {
    setActive(key);
    history.replaceState(null, "", `#${key}`); // no scroll jump
  };

  return (
    <>
      <div className="tabs admin-subtabs">
        {tabs.map((t) => (
          <button key={t.key} type="button" className={`tab${active === t.key ? " active" : ""}`} onClick={() => select(t.key)}>
            {t.label}
            {t.badge ? <span className="count">{t.badge}</span> : null}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.key} hidden={active !== t.key}>
          {t.content}
        </div>
      ))}
    </>
  );
}
