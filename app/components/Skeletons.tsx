// Shimmering placeholders shown instantly on navigation (via route loading.tsx)
// so page content feels immediate — the real content streams in behind it.
// (The nav is not skeletoned; it persists in the root layout.)

export function ListingCardSkeleton() {
  return (
    <div className="sk-card">
      <div className="sk sk-thumb" />
      <div className="sk-body">
        <div className="sk sk-line" style={{ width: "38%", height: 10 }} />
        <div className="sk sk-line" style={{ width: "82%", height: 16 }} />
        <div className="sk sk-line" style={{ width: "55%" }} />
        <div className="sk-foot">
          <div className="sk sk-line" style={{ width: "34%", height: 18 }} />
          <div className="sk sk-line" style={{ width: "22%", height: 18 }} />
        </div>
      </div>
    </div>
  );
}

export function ListingGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid" style={{ marginTop: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}

// A generic card/panel of shimmer lines for non-grid pages (dashboards, etc.).
export function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="sk-panel">
      <div className="sk sk-line" style={{ width: "45%", height: 16, marginBottom: 16 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="sk sk-line" style={{ width: `${90 - i * 12}%`, marginBottom: 12 }} />
      ))}
    </div>
  );
}

// Page header block (eyebrow + title + subtitle) used above skeleton grids.
export function PageHeadSkeleton() {
  return (
    <div className="wrap pagehead">
      <div className="sk sk-line" style={{ width: 120, height: 10, marginBottom: 12 }} />
      <div className="sk sk-line" style={{ width: 300, height: 30, maxWidth: "70%" }} />
      <div className="sk sk-line" style={{ width: 420, height: 14, marginTop: 14, maxWidth: "85%" }} />
    </div>
  );
}
