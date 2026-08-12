import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import { DifficultyBadge } from "@/components/ui/Badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trilha de Aprendizado — Ruby Dojo",
  description: "Todos os módulos de aprendizado de Ruby em português",
};

export default async function ModulesPage() {
  const [session, modules] = await Promise.all([
    auth(),
    prisma.module.findMany({
      orderBy: { order: "asc" },
      include: {
        challenges: { select: { id: true, difficulty: true } },
      },
    }),
  ]);

  const userId = session?.user?.id;
  let solvedChallengeIds = new Set<string>();

  if (userId) {
    const passedSubs = await prisma.submission.findMany({
      where: { userId, passed: true },
      select: { challengeId: true },
      distinct: ["challengeId"],
    });
    solvedChallengeIds = new Set(passedSubs.map((s) => s.challengeId));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <nav className="flex items-center gap-2 text-xs mb-4">
          <Link
            href="/learn"
            className="hover:text-red-400 transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Início
          </Link>
          <span style={{ color: "var(--text-muted)" }}>/</span>
          <span style={{ color: "var(--text-secondary)" }}>Trilha de aprendizado</span>
        </nav>
        <h1 className="text-4xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
          Trilha de aprendizado
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          {modules.length} módulos em ordem progressiva. Siga a trilha do início ao fim para
          uma experiência de aprendizado completa.
        </p>
      </div>

      {/* Modules list */}
      <div className="relative">
        {/* Vertical connector line */}
        <div
          className="absolute left-6 top-8 bottom-8 w-px"
          style={{ background: "var(--border-subtle)" }}
        />

        <div className="space-y-4">
          {modules.map((module, index) => {
            const total = module.challenges.length;
            const solved = module.challenges.filter((c) =>
              solvedChallengeIds.has(c.id)
            ).length;
            const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
            const done = pct === 100;
            const started = solved > 0;

            const diffCounts = {
              beginner: module.challenges.filter((c) => c.difficulty === "beginner").length,
              intermediate: module.challenges.filter((c) => c.difficulty === "intermediate").length,
              advanced: module.challenges.filter((c) => c.difficulty === "advanced").length,
            };

            return (
              <div key={module.id} className="relative flex gap-6">
                {/* Step indicator */}
                <div className="relative z-10 shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: done
                        ? "var(--success)"
                        : started
                        ? "var(--accent-red)"
                        : "var(--bg-elevated)",
                      border: `2px solid ${done ? "var(--success)" : started ? "var(--accent-red)" : "var(--border-default)"}`,
                      color: done || started ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {done ? "✓" : String(index + 1).padStart(2, "0")}
                  </div>
                </div>

                {/* Card */}
                <Link
                  href={`/learn/${module.slug}`}
                  className="group flex-1 rounded-xl p-6 transition-all"
                  style={{
                    background: "var(--bg-surface)",
                    border: `1px solid ${started ? "var(--border-default)" : "var(--border-subtle)"}`,
                    textDecoration: "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{ background: "var(--bg-elevated)" }}
                      >
                        {module.icon}
                      </div>
                      <div>
                        <h2
                          className="font-semibold group-hover:text-red-400 transition-colors"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {module.title}
                        </h2>
                        <p
                          className="text-xs mt-0.5 line-clamp-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {module.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    {total > 0 && (
                      <div className="shrink-0 text-right">
                        <div
                          className="text-sm font-bold font-mono"
                          style={{
                            color: done
                              ? "var(--success)"
                              : started
                              ? "var(--accent-red)"
                              : "var(--text-muted)",
                          }}
                        >
                          {solved}/{total}
                        </div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                          desafios
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {total > 0 && (
                    <div
                      className="h-1 rounded-full mb-3 overflow-hidden"
                      style={{ background: "var(--bg-elevated)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: done
                            ? "var(--success)"
                            : "var(--accent-red)",
                        }}
                      />
                    </div>
                  )}

                  {/* Difficulty breakdown */}
                  {total > 0 && (
                    <div className="flex items-center gap-3">
                      {diffCounts.beginner > 0 && (
                        <span className="text-xs" style={{ color: "var(--diff-beginner)" }}>
                          {diffCounts.beginner} iniciante{diffCounts.beginner !== 1 ? "s" : ""}
                        </span>
                      )}
                      {diffCounts.intermediate > 0 && (
                        <span className="text-xs" style={{ color: "var(--diff-intermediate)" }}>
                          {diffCounts.intermediate} intermediário{diffCounts.intermediate !== 1 ? "s" : ""}
                        </span>
                      )}
                      {diffCounts.advanced > 0 && (
                        <span className="text-xs" style={{ color: "var(--diff-advanced)" }}>
                          {diffCounts.advanced} avançado{diffCounts.advanced !== 1 ? "s" : ""}
                        </span>
                      )}
                      {total === 0 && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Sem desafios
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
