// Contact numbers must be re-verified every 3 months to stay "active".
export const PHONE_TTL_DAYS = 90;

export type PhoneStatus = "none" | "verified" | "expired";

export function phoneStatus(phoneNumber: string | null, verifiedAt: Date | null): PhoneStatus {
  if (!phoneNumber || !verifiedAt) return "none";
  const ageDays = (Date.now() - new Date(verifiedAt).getTime()) / 86_400_000;
  return ageDays > PHONE_TTL_DAYS ? "expired" : "verified";
}

export function daysUntilExpiry(verifiedAt: Date | null): number | null {
  if (!verifiedAt) return null;
  const ageDays = (Date.now() - new Date(verifiedAt).getTime()) / 86_400_000;
  return Math.max(0, Math.ceil(PHONE_TTL_DAYS - ageDays));
}

// Normalize a PH mobile number to +63XXXXXXXXXX, or null if invalid.
export function normalizePHPhone(raw: string): string | null {
  const d = raw.replace(/[^\d+]/g, "");
  if (/^09\d{9}$/.test(d)) return "+63" + d.slice(1);
  if (/^\+639\d{9}$/.test(d)) return d;
  if (/^639\d{9}$/.test(d)) return "+" + d;
  return null;
}
