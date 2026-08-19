"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        color: "var(--text-muted)",
        cursor: "pointer",
      }}
    >
      <LogOut size={15} />
      Sair
    </button>
  );
}
