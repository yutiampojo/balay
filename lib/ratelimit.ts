import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Shared Redis-backed rate limiting for server actions. If Upstash env vars
// aren't set (e.g. local dev before setup), it fails OPEN — never blocks — so
// the app keeps working; once UPSTASH_REDIS_REST_URL/TOKEN are configured on
// Vercel, limits activate automatically.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN ? Redis.fromEnv() : null;

type Window = `${number} s` | `${number} m` | `${number} h`;

const cache = new Map<string, Ratelimit>();

function limiter(name: string, limit: number, window: Window): Ratelimit | null {
  if (!redis) return null;
  const key = `${name}:${limit}:${window}`;
  let rl = cache.get(key);
  if (!rl) {
    rl = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, window), prefix: `rl:${name}`, analytics: false });
    cache.set(key, rl);
  }
  return rl;
}

// Throws a friendly error when the caller exceeds `limit` per `window`.
// `identifier` should be a stable per-user (or per-IP) key.
export async function rateLimit(name: string, identifier: string, limit: number, window: Window) {
  const rl = limiter(name, limit, window);
  if (!rl) return; // not configured → allow
  const { success } = await rl.limit(identifier);
  if (!success) throw new Error("You're doing that too quickly. Please wait a moment and try again.");
}
