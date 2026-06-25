"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Menu, Trophy, X } from "lucide-react";
import { useState } from "react";

type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/groups", label: "Groups" },
  { href: "/third-place", label: "Third-place", shortLabel: "Third" },
  { href: "/bracket", label: "Bracket" },
  { href: "/simulations", label: "Simulations", shortLabel: "Sims" },
  { href: "/teams", label: "Teams" },
  { href: "/about-model", label: "About Model", shortLabel: "Model" },
];

const mobileNavItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/simulator", label: "Start Simulator", shortLabel: "Start" },
  ...navItems.filter((item) => item.href !== "/"),
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function classNames(...classes: Array<string | false>) {
  return classes.filter(Boolean).join(" ");
}

function NavLink({ item, active, mobile = false, onNavigate }: { item: NavItem; active: boolean; mobile?: boolean; onNavigate?: () => void }) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={classNames(
        "rounded-xl border transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
        mobile
          ? "flex min-h-12 items-center justify-between border-[var(--border)] bg-slate-950/70 px-4 py-3 text-sm"
          : "border-transparent px-3 py-2 text-sm",
        active
          ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
          : "text-slate-300 hover:border-slate-600 hover:bg-slate-900/80 hover:text-white",
      )}
      href={item.href}
      onClick={onNavigate}
    >
      <span>{mobile ? item.label : item.shortLabel ?? item.label}</span>
      {mobile && active ? <span className="font-data text-[10px] uppercase tracking-[0.18em] text-cyan-300">Active</span> : null}
    </Link>
  );
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const simulatorActive = isActivePath(pathname, "/simulator");
  const mobileMenuId = "primary-mobile-navigation";

  return (
    <header className="shell sticky top-[calc(env(safe-area-inset-top)+0.75rem)] z-50 pt-3">
      <nav
        aria-label="Primary navigation"
        className="overflow-hidden rounded-3xl border border-white/10 bg-[#071523ee] shadow-[0_20px_70px_rgb(0_0_0_/_32%)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <Link
            aria-current={pathname === "/" ? "page" : undefined}
            className="group flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1.5 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            href="/"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-300 shadow-[0_0_28px_rgb(245_158_11_/_18%)]">
              <Trophy aria-hidden="true" size={21} />
            </span>
            <span className="min-w-0">
              <span className="font-display block truncate text-2xl font-bold leading-none">
                WorldCupPath <span className="text-cyan-300">2026</span>
              </span>
              <span className="font-data mt-1 hidden text-[10px] uppercase tracking-[0.18em] text-slate-400 sm:block">
                Tournament control room
              </span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => (
              <NavLink key={item.href} active={isActivePath(pathname, item.href)} item={item} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              aria-current={simulatorActive ? "page" : undefined}
              className={classNames(
                "button text-sm focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                simulatorActive ? "border-amber-200 bg-amber-300 text-slate-950" : "button-primary",
              )}
              href="/simulator"
              onClick={() => setOpen(false)}
            >
              <Activity aria-hidden="true" size={16} />
              <span className="hidden sm:inline">Start Simulator</span>
              <span className="sm:hidden">Start</span>
            </Link>
            <button
              aria-controls={mobileMenuId}
              aria-expanded={open}
              aria-label={open ? "Close navigation menu" : "Open navigation menu"}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-slate-950/70 text-slate-100 transition-colors duration-200 hover:border-cyan-300/50 hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 xl:hidden"
              type="button"
              onClick={() => setOpen((current) => !current)}
            >
              {open ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
            </button>
          </div>
        </div>

        <div
          className={classNames(
            "grid border-t border-white/10 transition-[grid-template-rows] duration-200 xl:hidden",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div id={mobileMenuId} className="overflow-hidden">
            <div className="grid gap-2 px-3 pb-4 pt-2 sm:grid-cols-2">
              {mobileNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  active={isActivePath(pathname, item.href)}
                  item={item}
                  mobile
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
