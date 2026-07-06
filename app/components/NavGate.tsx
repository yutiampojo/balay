"use client";

import { usePathname } from "next/navigation";

// Hides the shared nav on full-screen auth pages, which have no top nav.
const HIDE_ON = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email"];

export default function NavGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(p + "/"))) return null;
  return <>{children}</>;
}
