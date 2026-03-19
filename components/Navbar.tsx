"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const sections = [
  { label: "Model", href: "#model" },
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#usecases" },
];

function PraediumMark({ size = 22 }: { size?: number }) {
  // Rounded parallelogram outline — matches the brand symbol in the logo
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 36 46" fill="none">
      <defs>
        <linearGradient id="nm" x1="0" y1="46" x2="36" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#e879f9" />
        </linearGradient>
      </defs>
      {/* Rounded parallelogram outline — stroke only, no fill */}
      <path
        d="M17 4 L28 4 Q34 4 32 11 L23 40 Q21 46 14 46 L4 46 Q-2 46 0 39 L9 10 Q11 4 17 4 Z"
        fill="none"
        stroke="url(#nm)"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled || !isHome
          ? "bg-black/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <PraediumMark size={24} />
          <span className="text-white font-semibold text-base tracking-tight">Praedium</span>
        </Link>

        {/* Section nav — only on home */}
        {isHome && (
          <nav className="hidden md:flex items-center gap-1">
            {sections.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="px-3.5 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        )}

        {/* Right nav */}
        <nav className="flex items-center gap-2">
          {pathname !== "/" && (
            <Link href="/" className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              Overview
            </Link>
          )}
          {pathname !== "/analyze" && (
            <Link href="/analyze" className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors hidden md:block">
              Analyze
            </Link>
          )}
          {pathname !== "/compare" && (
            <Link href="/compare" className="text-sm text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors hidden md:block">
              Compare
            </Link>
          )}
          <Link
            href="/analyze"
            className="ml-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-lg shadow-violet-900/40 hover:shadow-violet-900/60 hover:-translate-y-px"
          >
            Analyze Loan
          </Link>
        </nav>
      </div>
    </header>
  );
}
