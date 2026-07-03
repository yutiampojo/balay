import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NavTabs, { type NavTab } from "@/app/components/NavTabs";
import MobileMenu from "@/app/components/MobileMenu";

// Tab icons (stroke inherits currentColor so they follow active/hover state).
const I = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7M5 10v10h14V10" /></svg>,
  grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  key: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3L22 7l-3-3" /></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>,
  chat: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 3v6c0 4-3 7-7 8-4-1-7-4-7-8V6z" /></svg>,
};

// Auth-aware top nav. Server Component — reads the current user (with role).
// Rendered once in the root layout so it persists across navigations (the
// active-tab dot slides seamlessly; page-level loading skeletons don't touch it).
export default async function SiteNav() {
  const user = await getCurrentUser();
  const loggedIn = !!user;
  const isAdmin = user?.role === "ADMIN";
  const firstName = user?.fullName?.split(" ")[0];

  const unread = user
    ? await prisma.message.count({
        where: {
          readAt: null,
          senderId: { not: user.id },
          conversation: { OR: [{ participantAId: user.id }, { participantBId: user.id }] },
        },
      })
    : 0;

  const tabs: NavTab[] = [
    { key: "rentals", href: "/rentals", label: <>{I.home}Browse homes</> },
    ...(loggedIn && !isAdmin
      ? [
          { key: "dashboard", href: "/dashboard", label: <>{I.grid}Renting</> },
          { key: "hosting", href: "/owner", label: <>{I.key}Hosting</> },
          { key: "saved", href: "/saved", label: <>{I.heart}Saved</> },
        ]
      : []),
    ...(loggedIn ? [{ key: "messages", href: "/messages", label: <>{I.chat}Messages</>, badge: unread }] : []),
    ...(isAdmin ? [{ key: "admin", href: "/admin", label: <>{I.shield}Admin</> }] : []),
    ...(!loggedIn ? [{ key: "keyholder", href: "/keyholder", label: <>{I.key}List your property</> }] : []),
  ];

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link className="brand" href="/">
          <svg className="mark" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="9" fill="#13322A" />
            <path d="M16 7l7 6v11a1 1 0 0 1-1 1h-4v-6h-4v6h-4a1 1 0 0 1-1-1V13l7-6z" fill="#fff" />
            <circle cx="22.5" cy="9.5" r="3.4" fill="#A9761D" stroke="#13322A" strokeWidth="1.4" />
          </svg>
          Balaymo
        </Link>
        <NavTabs tabs={tabs} />
        <div className="nav-cta">
          {loggedIn ? (
            <>
              <Link className="avatar-btn" href="/profile">
                <span className="avatar" style={{ overflow: "hidden" }}>
                  {user.profilePhotoUrl ? (
                    <img src={user.profilePhotoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>
                  )}
                </span>
                {firstName}
              </Link>
              <form action="/logout" method="post">
                <button className="btn btn-ghost btn-sm" type="submit">Log out</button>
              </form>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" href="/login">Log in</Link>
              <Link className="btn btn-primary" href="/signup">Sign up</Link>
            </>
          )}
        </div>
        <MobileMenu tabs={tabs} loggedIn={loggedIn} firstName={firstName} />
      </div>
    </header>
  );
}
