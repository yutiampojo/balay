import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import SiteNav from "@/app/components/SiteNav";
import NavGate from "@/app/components/NavGate";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: "Balaymo — Move light. Live easy.",
  description: "Balaymo — medium and long-term residential rentals in the Philippines. Move light. Live easy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable}`}>
      <body>
        {/* Nav lives here (outside the route/template) so it stays mounted across
            navigations — immune to page-level loading.tsx suspense. */}
        <NavGate>
          <SiteNav />
        </NavGate>
        {children}
      </body>
    </html>
  );
}
