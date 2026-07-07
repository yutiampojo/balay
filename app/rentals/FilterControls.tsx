"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const HISTORY_KEY = "balaymo:searchHistory";
const HISTORY_MAX = 8;

const CITIES = ["Quezon City", "Makati", "Taguig", "Cebu City", "Davao City", "Baguio"];
const TYPES = [
  { v: "HOUSE", l: "House", i: "🏠" }, { v: "CONDO", l: "Condo", i: "🏙️" },
  { v: "APARTMENT", l: "Apartment", i: "🏢" }, { v: "TOWNHOUSE", l: "Townhouse", i: "🏘️" },
  { v: "STUDIO", l: "Studio", i: "🛋️" }, { v: "ROOM", l: "Room", i: "🚪" },
  { v: "BEDSPACE", l: "Bedspace", i: "🛏️" }, { v: "DORMITORY", l: "Dorm", i: "🏨" },
];
const BEDS = [{ v: 0, l: "Any" }, { v: 1, l: "1+" }, { v: 2, l: "2+" }, { v: 3, l: "3+" }, { v: 4, l: "4+" }];
const LEASES = [{ v: 0, l: "Any" }, { v: 3, l: "3 mo+" }, { v: 6, l: "6 mo+" }, { v: 12, l: "1 yr+" }, { v: 24, l: "2 yr+" }];
const AMENITIES = ["Air conditioning", "Fiber-ready internet", "24/7 security", "Parking", "Gym", "Pool"];

export type Initial = {
  q: string; city: string; type: string; minBeds: number;
  minRent: number; maxRent: number; minLease: number; amenities: string[]; verifiedOnly: boolean; sort: string; view: string;
};

type Suggest = { id: string; title: string; city: string; barangay: string };

export default function FilterControls({ initial, suggestions }: { initial: Initial; suggestions: Suggest[] }) {
  const router = useRouter();
  const [q, setQ] = useState(initial.q);
  const [qOpen, setQOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [sort, setSort] = useState(initial.sort);
  const [open, setOpen] = useState(false);

  // Recent searches live in the browser (per-device, no login needed).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore corrupt/blocked storage */ }
  }, []);

  function pushHistory(term: string) {
    const t = term.trim();
    if (!t) return;
    setHistory((prev) => {
      const next = [t, ...prev.filter((h) => h.toLowerCase() !== t.toLowerCase())].slice(0, HISTORY_MAX);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }
  function removeHistory(term: string) {
    setHistory((prev) => {
      const next = prev.filter((h) => h !== term);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }
  function clearHistory() {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  }

  // draft state (only applied on "Show homes")
  const [city, setCity] = useState(initial.city);
  const [cityInput, setCityInput] = useState(initial.city);
  const [cityOpen, setCityOpen] = useState(false);
  const [type, setType] = useState(initial.type);
  const [minBeds, setMinBeds] = useState(initial.minBeds);
  const [minLease, setMinLease] = useState(initial.minLease);
  const [minRent, setMinRent] = useState(initial.minRent ? String(initial.minRent) : "");
  const [maxRent, setMaxRent] = useState(initial.maxRent ? String(initial.maxRent) : "");
  const [amenities, setAmenities] = useState<string[]>(initial.amenities);
  const [verified, setVerified] = useState(initial.verifiedOnly);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const toggleAmenity = (a: string) => setAmenities((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]));

  function buildUrl(over: Partial<Record<string, string>> = {}) {
    const p = new URLSearchParams();
    const set = (k: string, v: string | number | boolean) => { if (v && v !== "0") p.set(k, String(v)); };
    set("q", over.q ?? q);
    set("city", over.city ?? city);
    set("type", over.type ?? type);
    set("minBeds", over.minBeds ?? minBeds);
    set("minRent", over.minRent ?? minRent);
    set("maxRent", over.maxRent ?? maxRent);
    set("minLease", over.minLease ?? minLease);
    if (verified) p.set("verifiedOnly", "true");
    if (amenities.length) p.set("amenities", amenities.join(","));
    const s = over.sort ?? sort;
    if (s && s !== "new") p.set("sort", s);
    if (initial.view === "map") p.set("view", "map"); // stay on the map when filtering
    const qs = p.toString();
    return qs ? `/rentals?${qs}` : "/rentals";
  }

  function chooseCity(val: string) {
    setCity(val);
    setCityInput(val);
    setCityOpen(false);
    router.push(buildUrl({ city: val }));
  }
  const citySuggestions = CITIES.filter((c) => c.toLowerCase().includes(cityInput.trim().toLowerCase()));

  const qTrim = q.trim().toLowerCase();
  const qMatches = qTrim
    ? suggestions.filter((s) => `${s.title} ${s.city} ${s.barangay}`.toLowerCase().includes(qTrim)).slice(0, 6)
    : [];
  // Recent searches to show: filtered by what's typed, excluding an exact echo.
  const recent = history
    .filter((h) => (qTrim ? h.toLowerCase().includes(qTrim) && h.toLowerCase() !== qTrim : true))
    .slice(0, 5);
  const runSearch = (term: string = q) => {
    pushHistory(term);
    setQ(term);
    router.push(buildUrl({ q: term }));
    setQOpen(false);
  };

  const apply = () => { router.push(buildUrl()); setOpen(false); };
  const clearAll = () => {
    setCity(""); setType(""); setMinBeds(0); setMinLease(0); setMinRent(""); setMaxRent(""); setAmenities([]); setVerified(false);
  };

  const activeCount =
    (city ? 1 : 0) + (type ? 1 : 0) + (minBeds ? 1 : 0) + (minLease ? 1 : 0) +
    (minRent || maxRent ? 1 : 0) + (amenities.length ? 1 : 0) + (verified ? 1 : 0);

  return (
    <>
      <div className="rentals-topbar">
        <div className="topbar-search-wrap" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setQOpen(false); }}>
          <form className="topbar-search" onSubmit={(e) => { e.preventDefault(); runSearch(); }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            <input className="input" type="search" aria-label="Search listings" value={q} placeholder="Search by keyword, place, or “1 bedroom”…"
              onChange={(e) => { setQ(e.target.value); setQOpen(true); }}
              onFocus={() => setQOpen(true)}
              onKeyDown={(e) => { if (e.key === "Escape") setQOpen(false); }}
            />
          </form>
          {qOpen && (qTrim || recent.length > 0) && (
            <div className="q-suggest">
              {recent.length > 0 && (
                <div className="q-recent">
                  <div className="q-recent-head">
                    <span>Recent searches</span>
                    <button type="button" className="q-clear" onMouseDown={(e) => e.preventDefault()} onClick={clearHistory}>Clear</button>
                  </div>
                  {recent.map((h) => (
                    <div key={h} className="q-item q-recent-item" onMouseDown={(e) => e.preventDefault()} onClick={() => runSearch(h)} role="button" tabIndex={0}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                      <span className="q-text"><strong>{h}</strong></span>
                      <button type="button" className="q-remove" aria-label={`Remove ${h}`} onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); removeHistory(h); }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              {qTrim && qMatches.map((s) => (
                <a key={s.id} href={`/rentals/${s.id}`} target="_blank" rel="noopener noreferrer" className="q-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7M5 10v10h14V10" /></svg>
                  <span className="q-text"><strong>{s.title}</strong><small>{s.city} · {s.barangay}</small></span>
                </a>
              ))}
              {qTrim && (
                <button type="button" className="q-item q-run" onMouseDown={(e) => e.preventDefault()} onClick={() => runSearch()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                  Search “{q.trim()}”
                </button>
              )}
            </div>
          )}
        </div>
        <div className="topbar-right">
          <div className="city-combo" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setCityOpen(false); }}>
            <svg className="city-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
            <input
              className="city-input"
              value={cityInput}
              placeholder="Any city"
              aria-label="City"
              onChange={(e) => { setCityInput(e.target.value); setCityOpen(true); }}
              onFocus={() => setCityOpen(true)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); chooseCity(cityInput.trim()); } else if (e.key === "Escape") setCityOpen(false); }}
            />
            {cityInput && <button type="button" className="city-clear" aria-label="Clear city" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseCity("")}>✕</button>}
            {cityOpen && (
              <div className="city-suggest">
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseCity("")}>All cities</button>
                {citySuggestions.map((c) => (
                  <button type="button" key={c} onMouseDown={(e) => e.preventDefault()} onClick={() => chooseCity(c)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>{c}
                  </button>
                ))}
                {citySuggestions.length === 0 && cityInput.trim() && (
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => chooseCity(cityInput.trim())}>Search “{cityInput.trim()}”</button>
                )}
              </div>
            )}
          </div>
          <select className="pretty-select" aria-label="Sort" value={sort} onChange={(e) => { setSort(e.target.value); router.push(buildUrl({ sort: e.target.value })); }}>
            <option value="new">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
          <button type="button" className="btn btn-ghost filters-btn" onClick={() => setOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
            Filters{activeCount > 0 && <span className="count-badge">{activeCount}</span>}
          </button>
        </div>
      </div>

      {open && (
        <div className="filter-modal-overlay" onClick={() => setOpen(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <header className="fm-head">
              <button className="fm-x" onClick={() => setOpen(false)} aria-label="Close">✕</button>
              <h2>Filters</h2>
            </header>

            <div className="fm-body">
              <section className="fm-section">
                <h3>Property type</h3>
                <div className="fm-pills">
                  <button type="button" className={`chip${type === "" ? " active" : ""}`} onClick={() => setType("")}>Any</button>
                  {TYPES.map((t) => (
                    <button type="button" key={t.v} className={`chip${type === t.v ? " active" : ""}`} onClick={() => setType(t.v)}>{t.i} {t.l}</button>
                  ))}
                </div>
              </section>

              <section className="fm-section">
                <h3>Price range <span className="fm-sub">Monthly rent (₱)</span></h3>
                <div className="fm-price">
                  <label className="fm-price-field"><span>Minimum</span><input className="input" type="number" inputMode="numeric" placeholder="No min" value={minRent} onChange={(e) => setMinRent(e.target.value)} /></label>
                  <span className="fm-dash">–</span>
                  <label className="fm-price-field"><span>Maximum</span><input className="input" type="number" inputMode="numeric" placeholder="No max" value={maxRent} onChange={(e) => setMaxRent(e.target.value)} /></label>
                </div>
              </section>

              <section className="fm-section">
                <h3>Bedrooms</h3>
                <div className="fm-pills">
                  {BEDS.map((b) => <button type="button" key={b.v} className={`chip${minBeds === b.v ? " active" : ""}`} onClick={() => setMinBeds(b.v)}>{b.l}</button>)}
                </div>
              </section>

              <section className="fm-section">
                <h3>Lease length</h3>
                <div className="fm-pills">
                  {LEASES.map((x) => <button type="button" key={x.v} className={`chip${minLease === x.v ? " active" : ""}`} onClick={() => setMinLease(x.v)}>{x.l}</button>)}
                </div>
              </section>


              <section className="fm-section">
                <h3>Amenities</h3>
                <div className="fm-pills">
                  {AMENITIES.map((a) => <button type="button" key={a} className={`chip${amenities.includes(a) ? " active" : ""}`} onClick={() => toggleAmenity(a)}>{a}</button>)}
                </div>
              </section>

              <section className="fm-section">
                <label className="fm-toggle">
                  <span><strong>Verified only</strong><br /><span className="fm-sub">Show homes with verified owner &amp; unit</span></span>
                  <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
                </label>
              </section>
            </div>

            <footer className="fm-foot">
              <button type="button" className="fm-clear" onClick={clearAll}>Clear all</button>
              <button type="button" className="btn btn-primary" onClick={apply}>Show homes</button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
