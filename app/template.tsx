// Re-mounts on every navigation, so the entry animation replays on each
// route change (including post-login/signup redirects).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
