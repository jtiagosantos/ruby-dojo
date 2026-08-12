import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import { DifficultyBadge } from "@/components/ui/Badge";
import DifficultyFilter from "@/components/practice/DifficultyFilter";

export const metadata = {
  title: "Praticar Ruby — Ruby Dojo",
  description: "Desafios de código Ruby para praticar e aprender",
};

type Difficulty = "beginner" | "intermediate" | "advanced";

const difficultyConfig: Record<Difficulty, { label: string; color: string; bg: string }> = {
  beginner: { label: "Iniciante", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  intermediate: { label: "Intermediário", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  advanced: { label: "Avançado", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ difficulty?: string }>;
}) {
  const params = await searchParams;
  const selectedDifficulty = params.difficulty as Difficulty | undefined;

  const allChallenges = await prisma.challenge.findMany({
    orderBy: [{ moduleId: "asc" }, { order: "asc" }],
    include: {
      module: { select: { title: true, slug: true, icon: true } },
    },
  });

  // Apply filter
  const challenges = selectedDifficulty
    ? allChallenges.filter((c) => c.difficulty === selectedDifficulty)
    : allChallenges;

  // Group by difficulty for display
  const byDifficulty = {
    beginner: challenges.filter((c) => c.difficulty === "beginner"),
    intermediate: challenges.filter((c) => c.difficulty === "intermediate"),
    advanced: challenges.filter((c) => c.difficulty === "advanced"),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-4xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Desafios de Prática
        </h1>
        <p className="text-lg max-w-2xl" style={{ color: "var(--text-secondary)" }}>
          Escreva sua solução em Ruby, execute os testes e veja se você passou.
          Comece pelos desafios de iniciante e avance gradualmente.
        </p>
      </div>

      {/* Filter */}
      <div
        className="flex items-center gap-4 mb-8 pb-6"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
          Filtrar por nível:
        </span>
        <Suspense fallback={null}>
          <DifficultyFilter />
        </Suspense>
      </div>

      {/* Challenges by difficulty */}
      <div className="space-y-12">
        {(Object.keys(byDifficulty) as Difficulty[]).map((diff) => {
          const group = byDifficulty[diff];
          if (group.length === 0) return null;
          const config = difficultyConfig[diff];

          return (
            <section key={diff}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-2 h-6 rounded-full"
                  style={{ background: config.color }}
                />
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {config.label}
                </h2>
                <span
                  className="text-sm px-2 py-0.5 rounded-full"
                  style={{
                    background: config.bg,
                    color: config.color,
                    border: `1px solid ${config.color}33`,
                  }}
                >
                  {group.length}
                </span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.map((challenge) => (
                  <Link
                    key={challenge.id}
                    href={`/practice/${challenge.id}`}
                    className="group rounded-xl p-6 flex flex-col transition-all"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      textDecoration: "none",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <DifficultyBadge difficulty={challenge.difficulty} />
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{ color: "var(--text-muted)" }}
                      >
                        +{challenge.points}pts
                      </span>
                    </div>

                    <h3
                      className="text-base font-semibold mb-2 group-hover:text-red-400 transition-colors leading-snug"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {challenge.title}
                    </h3>

                    <p
                      className="text-sm flex-1 mb-4 line-clamp-2 leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {challenge.description.replace(/[#*`]/g, "").slice(0, 120)}...
                    </p>

                    {challenge.module && (
                      <div
                        className="flex items-center gap-1.5 text-xs pt-3"
                        style={{
                          borderTop: "1px solid var(--border-subtle)",
                          color: "var(--text-muted)",
                        }}
                      >
                        <span>{challenge.module.icon}</span>
                        <span>{challenge.module.title}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}

        {challenges.length === 0 && (
          <div
            className="text-center py-16 rounded-xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-muted)",
            }}
          >
            Nenhum desafio encontrado para este nível.
          </div>
        )}
      </div>
    </div>
  );
}
