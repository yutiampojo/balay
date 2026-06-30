import { createClient } from "@/lib/supabase/server";

// Auth-aware top nav. Server Component — reads the session directly.
export default async function SiteNav({ current }: { current?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const loggedIn = !!user;
  const firstName =
    (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ||
    user?.email?.split("@")[0];

  const linkClass = (name: string) => (current === name ? "current" : undefined);

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <a className="brand" href="/">
          <svg className="mark" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="9" fill="#13322A" />
            <path d="M16 7l7 6v11a1 1 0 0 1-1 1h-4v-6h-4v6h-4a1 1 0 0 1-1-1V13l7-6z" fill="#fff" />
            <circle cx="22.5" cy="9.5" r="3.4" fill="#A9761D" stroke="#13322A" strokeWidth="1.4" />
          </svg>
          Balay
        </a>
        <nav className="navlinks">
          <a href="/rentals" className={linkClass("rentals")}>Browse homes</a>
          {loggedIn && <a href="/dashboard" className={linkClass("dashboard")}>Dashboard</a>}
          <a href="/messages" className={linkClass("messages")}>Messages</a>
          {!loggedIn && <a href="/keyholder">List your property</a>}
        </nav>
        <div className="nav-cta">
          {loggedIn ? (
            <>
              <a className="avatar-btn" href="/dashboard">
                <span className="avatar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
                </span>
                {firstName}
              </a>
              <form action="/logout" method="post">
                <button className="btn btn-ghost btn-sm" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <a className="btn btn-ghost" href="/login">Log in</a>
              <a className="btn btn-primary" href="/signup">Sign up</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
