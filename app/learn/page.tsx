import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";

export const metadata = {
  title: "Aprender Ruby — Ruby Dojo",
  description: "Módulos de aprendizado de Ruby em português",
};

export default async function LearnPage() {
  const [session, modules, totalChallenges] = await Promise.all([
    auth(),
    prisma.module.findMany({
      orderBy: { order: "asc" },
      select: { id: true, slug: true, title: true, description: true, icon: true, order: true },
    }),
    prisma.challenge.count(),
  ]);

  const userId = session?.user?.id;

  let solvedCount = 0;
  let lessonsCount = 0;
  let score = 0;
  let rankLabel = "Novato";

  if (userId) {
    const [userSession, passedSubs] = await Promise.all([
      prisma.userSession.findUnique({ where: { userId } }),
      prisma.submission.findMany({
        where: { userId, passed: true },
        select: { challengeId: true, challenge: { select: { moduleId: true } } },
        distinct: ["challengeId"],
      }),
    ]);

    score = userSession?.score ?? 0;
    solvedCount = passedSubs.length;

    const moduleIdsSeen = new Set(passedSubs.map((s) => s.challenge.moduleId).filter(Boolean));
    lessonsCount = moduleIdsSeen.size;

    rankLabel =
      score >= 500
        ? "Mestre Ruby"
        : score >= 200
        ? "Desenvolvedor Ruby"
        : score >= 50
        ? "Aprendiz Ruby"
        : "Novato";
  }

  const featuredModules = modules.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Módulos de Aprendizado
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          Aprenda Ruby do zero com módulos bem estruturados, exemplos práticos e
          explicações em português. Siga a ordem sugerida para melhor aprendizado.
        </p>
      </div>

      {/* User stats — big numbers (only when authenticated) */}
      {userId && <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div
          className="rounded-xl p-6 flex flex-col"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <span className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Pontos
          </span>
          <span className="text-5xl font-bold leading-none flex-1" style={{ color: "var(--accent-red)" }}>
            {score}
          </span>
          <span className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>pts acumulados</span>
        </div>

        <div
          className="rounded-xl p-6 flex flex-col"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <span className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Ranking
          </span>
          <span className="text-2xl font-bold leading-tight flex-1" style={{ color: "#a78bfa" }}>
            {rankLabel}
          </span>
          <span className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
            {score >= 500 ? "nível máximo" : score >= 200 ? "próximo: Mestre Ruby" : score >= 50 ? "próximo: Desenvolvedor" : "próximo: Aprendiz Ruby"}
          </span>
        </div>

        <div
          className="rounded-xl p-6 flex flex-col"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <span className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Exercícios
          </span>
          <span className="text-5xl font-bold leading-none flex-1" style={{ color: "var(--success)" }}>
            {solvedCount}
          </span>
          <span className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>de {totalChallenges} resolvidos</span>
        </div>

        <div
          className="rounded-xl p-6 flex flex-col"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}
        >
          <span className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
            Lições
          </span>
          <span className="text-5xl font-bold leading-none flex-1" style={{ color: "var(--accent-blue)" }}>
            {lessonsCount}
          </span>
          <span className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>de {modules.length} módulos</span>
        </div>
      </div>}

      {/* Trilha de aprendizado */}
      <div className="mb-12">
        <h2
          className="text-xl font-semibold mb-5"
          style={{ color: "var(--text-primary)" }}
        >
          Trilha de aprendizado
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {featuredModules.map((module, index) => (
            <Link
              key={module.id}
              href={`/learn/${module.slug}`}
              className="group rounded-xl p-5 flex flex-col transition-all"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                textDecoration: "none",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: "var(--bg-elevated)" }}
                >
                  {module.icon}
                </div>
                <span
                  className="text-xs font-mono font-medium px-2 py-0.5 rounded"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}
                >
                  #{String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3
                className="text-sm font-semibold mb-1 group-hover:text-red-400 transition-colors"
                style={{ color: "var(--text-primary)" }}
              >
                {module.title}
              </h3>
              <p
                className="text-xs leading-relaxed flex-1 mb-3 line-clamp-5"
                style={{ color: "var(--text-secondary)" }}
              >
                {module.description}
              </p>
              <span
                className="text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                style={{ color: "var(--accent-red-light)" }}
              >
                Estudar →
              </span>
            </Link>
          ))}

          {/* CTA — ver trilha completa */}
          <Link
            href="/learn/modules"
            className="group rounded-xl p-5 flex flex-col items-center justify-center gap-3 transition-all"
            style={{
              background: "transparent",
              border: "1px dashed var(--border-default)",
              textDecoration: "none",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-transform group-hover:scale-110"
              style={{ background: "var(--bg-elevated)" }}
            >
              →
            </div>
            <span
              className="text-sm font-semibold text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              Ver trilha completa
            </span>
            <span className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
              {modules.length} módulos no total
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
