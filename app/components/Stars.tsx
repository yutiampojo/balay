// Display-only star rating. Renders 5 stars filled to `value` (supports halves).
export default function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, lineHeight: 1 }} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i)); // 0..1 for this star
        return (
          <span key={i} style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
            <Star size={size} color="var(--line, #d8dcd9)" />
            <span style={{ position: "absolute", inset: 0, width: `${fill * 100}%`, overflow: "hidden" }}>
              <Star size={size} color="#f5a623" />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function Star({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: "block" }}>
      <path d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.9l-5.81 3.06 1.11-6.47-4.7-4.58 6.5-.95L12 2.5z" />
    </svg>
  );
}
