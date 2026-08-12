"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, Code2, User, Gem, LogOut, LogIn, Trophy } from "lucide-react";
// Note: lucide-react does not include a GitHub icon
import { useSession, signOut } from "next-auth/react";

const publicLinks = [
  { href: "/learn/modules", label: "Aprender", icon: <BookOpen size={18} /> },
  { href: "/practice", label: "Praticar", icon: <Code2 size={18} /> },
];

const authLinks = [
  { href: "/ranking", label: "Ranking", icon: <Trophy size={18} /> },
  { href: "/profile", label: "Perfil", icon: <User size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <aside
      style={{
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-subtle)",
        width: "220px",
        minWidth: "220px",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.5rem 1.25rem 1.25rem",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <Link
          href="/learn"
          style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}
        >
          <div
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "0.5rem",
              background: "var(--accent-red)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Gem size={18} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontWeight: 700,
              fontSize: "1.125rem",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            ruby<span style={{ color: "var(--accent-red)" }}>dojo</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "1rem 0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {[...publicLinks, ...(session?.user ? authLinks : [])].map((link) => {
          const isActive =
            pathname === link.href ||
            pathname.startsWith(link.href + "/") ||
            (link.href === "/learn/modules" && pathname.startsWith("/learn/"));
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.625rem 0.75rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-elevated)" : "transparent",
                borderLeft: isActive ? "2px solid var(--accent-red)" : "2px solid transparent",
                transition: "all 0.15s",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6 }}>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User / Auth footer */}
      <div
        style={{
          padding: "0.75rem",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        {status === "loading" ? (
          <div
            className="h-10 rounded-lg animate-pulse"
            style={{ background: "var(--bg-elevated)" }}
          />
        ) : session?.user ? (
          <div>
            {/* User info */}
            <Link
              href="/profile"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                marginBottom: "0.25rem",
              }}
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "Avatar"}
                  width={28}
                  height={28}
                  className="rounded-full shrink-0"
                  style={{ border: "1px solid var(--border-default)" }}
                />
              ) : (
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "var(--accent-red)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {(session.user.name ?? "U")[0].toUpperCase()}
                </div>
              )}
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {session.user.name}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {session.user.email}
                </div>
              </div>
            </Link>

            {/* Sign out */}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                width: "100%",
                padding: "0.5rem 0.5rem",
                borderRadius: "0.5rem",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                transition: "all 0.15s",
              }}
            >
              <LogOut size={14} />
              Sair
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 0.75rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <LogIn size={16} />
            Entrar
          </Link>
        )}
      </div>
    </aside>
  );
}
