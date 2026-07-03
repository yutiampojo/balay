// Resolve a stored photoUrl to a usable src.
// Uploaded photos are absolute Supabase Storage URLs; seeded ones are
// relative paths served from /public.
export function photoSrc(url: string): string {
  if (!url) return "";
  return /^https?:\/\//.test(url) ? url : `/${url}`;
}
