// Approximate coordinates for the map — privacy-safe (never the exact address).
// City centers + a deterministic per-listing offset so pins spread across the
// area without revealing a real location.

const CITY_CENTERS: Record<string, [number, number]> = {
  "Quezon City": [14.676, 121.0437],
  Makati: [14.5547, 121.0244],
  Taguig: [14.5176, 121.0509],
  "Cebu City": [10.3157, 123.8854],
  "Davao City": [7.1907, 125.4553],
  Baguio: [16.4023, 120.596],
};

// Fallback: geographic center of the Philippines.
const DEFAULT_CENTER: [number, number] = [12.8797, 121.774];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Deterministic pseudo-random in [-1, 1] from a seed string.
function unit(seed: string): number {
  return (hash(seed) % 2000) / 1000 - 1;
}

export function approxCoords(listing: { id: string; city: string; barangay: string }): [number, number] {
  const base = CITY_CENTERS[listing.city] ?? DEFAULT_CENTER;
  const r = 0.02; // ~2km scatter so pins are approximate, not exact
  const dLat = unit(listing.id + listing.barangay) * r;
  const dLng = unit(listing.barangay + listing.id) * r;
  return [base[0] + dLat, base[1] + dLng];
}

export function cityCenter(city: string): [number, number] {
  return CITY_CENTERS[city] ?? DEFAULT_CENTER;
}

// Geocode "barangay, city, Philippines" to real coordinates via OpenStreetMap
// Nominatim (free, no key). Adds a small privacy jitter (~200–400m) so the pin
// is an approximate area, never the exact address. Falls back to city center.
export async function geocodeArea(city: string, barangay: string): Promise<[number, number]> {
  const seed = `${barangay}|${city}`;
  const fallback = CITY_CENTERS[city] ?? DEFAULT_CENTER;
  try {
    const q = encodeURIComponent(`${barangay}, ${city}, Philippines`);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, {
      headers: { "User-Agent": "Balaymo/1.0 (rental marketplace)" },
      // no cache: we store the result ourselves
    });
    if (!res.ok) return jitter(fallback, seed);
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) return jitter(fallback, seed);
    return jitter([parseFloat(data[0].lat), parseFloat(data[0].lon)], seed);
  } catch {
    return jitter(fallback, seed);
  }
}

// deterministic ~200–400m privacy offset
function jitter([lat, lng]: [number, number], seed: string): [number, number] {
  const r = 0.0035;
  return [lat + unit(seed + "a") * r, lng + unit(seed + "b") * r];
}
