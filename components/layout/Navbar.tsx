"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/learn", label: "Aprender" },
  { href: "/practice", label: "Praticar" },
  { href: "/profile", label: "Perfil" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg select-none"
              style={{
                background: "var(--accent-red)",
                color: "#fff",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              ♦
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-geist-mono)",
              }}
            >
              ruby<span style={{ color: "var(--accent-red)" }}>dojo</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    color: isActive
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                    background: isActive
                      ? "var(--bg-elevated)"
                      : "transparent",
                    borderBottom: isActive
                      ? "2px solid var(--accent-red)"
                      : "2px solid transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
