"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Code2, Trophy, User } from "lucide-react";
import { useSession } from "next-auth/react";

const publicLinks = [
  { href: "/learn/modules", label: "Aprender", icon: BookOpen },
  { href: "/practice", label: "Praticar", icon: Code2 },
];

const authLinks = [
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/profile", label: "Perfil", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const links = [...publicLinks, ...(session?.user ? authLinks : [])];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        background: "var(--bg-sidebar)",
        borderTop: "1px solid var(--border-subtle)",
        height: "4rem",
        paddingBottom: "env(safe-area-inset-bottom, 0)",
      }}
    >
      {links.map(({ href, label, icon: Icon }) => {
        const isActive =
          pathname === href ||
          pathname.startsWith(href + "/") ||
          (href === "/learn/modules" && pathname.startsWith("/learn/"));
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all"
            style={{
              color: isActive ? "var(--accent-red)" : "var(--text-muted)",
              textDecoration: "none",
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
            <span
              className="text-xs font-medium"
              style={{ fontSize: "0.65rem", letterSpacing: "0.01em" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
