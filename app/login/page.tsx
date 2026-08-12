import { signIn } from "@/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Gem, BookOpen, Code2 } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const [session, params] = await Promise.all([auth(), searchParams]);

  if (session) {
    redirect(params.callbackUrl ?? "/learn");
  }

  const callbackUrl = params.callbackUrl ?? "/learn";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div
            style={{
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "0.625rem",
              background: "var(--accent-red)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Gem size={20} />
          </div>
          <span
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontWeight: 700,
              fontSize: "1.375rem",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            ruby<span style={{ color: "var(--accent-red)" }}>dojo</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <h1
            className="text-2xl font-bold mb-2 text-center"
            style={{ color: "var(--text-primary)" }}
          >
            Entre para praticar Ruby
          </h1>
          <p
            className="text-sm text-center mb-8 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Faça login com sua conta GitHub para resolver desafios e acompanhar
            seu progresso.
          </p>

          {/* GitHub sign in */}
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: callbackUrl });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-xl font-semibold text-sm transition-all cursor-pointer"
              style={{
                background: "var(--text-primary)",
                color: "var(--bg-primary)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
              Entrar com GitHub
            </button>
          </form>

          {/* Divider */}
          <div
            className="my-6"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          />

          {/* Public content note */}
          <div className="space-y-3">
            <p
              className="text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              Disponível sem login
            </p>
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--bg-elevated)" }}
              >
                <BookOpen size={13} style={{ color: "var(--accent-blue)" }} />
              </div>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Conteúdo teórico e módulos de aprendizado
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "var(--bg-elevated)" }}
              >
                <Code2 size={13} style={{ color: "var(--text-muted)" }} />
              </div>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Listagem de desafios (resolução requer login)
              </span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Ao entrar, você concorda em usar a plataforma para fins de aprendizado.
        </p>
      </div>
    </div>
  );
}
