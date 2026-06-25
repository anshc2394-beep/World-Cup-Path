import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = { title: "WorldCupPath 2026", description: "Predict, simulate, and explain every route through the expanded 48-team World Cup." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">Skip to main content</a>
        <Nav />
        <main id="main" className="relative z-10">{children}</main>
        <footer className="shell relative z-10 my-10 border-t border-[var(--border)] py-8 text-sm text-slate-400">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <span>Unofficial fan-made educational project. Not affiliated with FIFA.</span>
            <span className="font-data text-xs uppercase tracking-[0.16em] text-slate-500">WorldCupPath 2026</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
