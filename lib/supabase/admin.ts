import { createClient } from "@supabase/supabase-js";

// Service-role Supabase client — SERVER ONLY. Never import this into a client
// component. It bypasses Row Level Security, so it's used for privileged admin
// operations: signing URLs for private verification docs, deleting auth users.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const VERIFICATION_BUCKET = "verification-docs";
