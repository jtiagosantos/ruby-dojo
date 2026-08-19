import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Link from "next/link";
import Image from "next/image";
import { DifficultyBadge } from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import LogoutButton from "@/components/profile/LogoutButton";

export const metadata = {
  title: "Perfil — Ruby Dojo",
  description: "Seu progresso no Ruby Dojo",
};

export default async function ProfilePage() {
  // Session is guaranteed by middleware — /profile is a protected route
  const session = (await auth())!;
  const user = session.user!;
  const userId = user.id!;

  const [totalChallenges, allModules, userSession, passedSubs, recentSubmissions, allChallenges] =
    await Promise.all([
      prisma.challenge.count(),
      prisma.module.findMany({
        orderBy: { order: "asc" },
        include: { challenges: { select: { id: true } } },
      }),
      prisma.userSession.findUnique({ where: { userId } }),
      prisma.submission.findMany({
        where: { userId, passed: true },
        select: { challengeId: true },
        distinct: ["challengeId"],
      }),
      prisma.submission.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 15,
        include: {
          challenge: { select: { id: true, title: true, difficulty: true } },
        },
      }),
      prisma.challenge.findMany({ select: { id: true, difficulty: true } }),
    ]);

  const solvedChallengeIds = new Set(passedSubs.map((s) => s.challengeId));
  const solvedCount = solvedChallengeIds.size;
  const progressPercent =
    totalChallenges > 0 ? Math.round((solvedCount / totalChallenges) * 100) : 0;

  const difficultyStats = {
    beginner: { total: 0, solved: 0 },
    intermediate: { total: 0, solved: 0 },
    advanced: { total: 0, solved: 0 },
  };

  for (const c of allChallenges) {
    const diff = c.difficulty as keyof typeof difficultyStats;
    if (difficultyStats[diff]) {
      difficultyStats[diff].total++;
      if (solvedChallengeIds.has(c.id)) difficultyStats[diff].solved++;
    }
  }

  const difficultyConfig = {
    beginner: { label: "Iniciante", color: "#22c55e" },
    intermediate: { label: "Intermediário", color: "#f59e0b" },
    advanced: { label: "Avançado", color: "#ef4444" },
  };

  const score = userSession?.score ?? 0;
  const rankLabel =
    score >= 500
      ? "Mestre Ruby"
      : score >= 200
      ? "Desenvolvedor Ruby"
      : score >= 50
      ? "Aprendiz Ruby"
      : "Novato";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name ?? "Avatar"}
            width={56}
            height={56}
            className="rounded-full"
            style={{ border: "2px solid var(--border-default)" }}
          />
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            {user.name ?? "Usuário"}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {user.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Pontuação", value: score, unit: "pts", color: "var(--accent-red)" },
            { label: "Resolvidos", value: solvedCount, unit: `/${totalChallenges}`, color: "var(--success)" },
            { label: "Progresso", value: progressPercent, unit: "%", color: "var(--accent-blue)" },
            { label: "Rank", value: rankLabel, unit: "", color: "#a78bfa" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-5 text-center"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="text-2xl font-bold mb-1 font-mono"
                style={{ color: stat.color }}
              >
                {stat.value}
                <span className="text-sm font-normal">{stat.unit}</span>
              </div>
              <div className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Progresso Geral
          </h3>
          <ProgressBar
            value={progressPercent}
            label={`${solvedCount} de ${totalChallenges} desafios resolvidos`}
            color="red"
          />
          <div className="grid grid-cols-3 gap-4 mt-6">
            {(Object.keys(difficultyStats) as Array<keyof typeof difficultyStats>).map((diff) => {
              const stats = difficultyStats[diff];
              const config = difficultyConfig[diff];
              const pct = stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0;
              return (
                <div key={diff}>
                  <ProgressBar
                    value={pct}
                    label={config.label}
                    color={diff === "beginner" ? "green" : diff === "intermediate" ? "blue" : "red"}
                  />
                  <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {stats.solved}/{stats.total}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress by module */}
        <div
          className="rounded-xl p-6"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <h3
            className="text-sm font-semibold uppercase tracking-wider mb-5"
            style={{ color: "var(--text-muted)" }}
          >
            Progresso por Módulo
          </h3>
          <div className="space-y-4">
            {allModules.map((module) => {
              const total = module.challenges.length;
              const solved = module.challenges.filter((c) => solvedChallengeIds.has(c.id)).length;
              const pct = total > 0 ? Math.round((solved / total) * 100) : 0;
              return (
                <div key={module.id} className="flex items-center gap-4">
                  <Link
                    href={`/learn/${module.slug}`}
                    className="flex items-center gap-2 w-32 sm:w-48 shrink-0 truncate"
                  >
                    <span className="text-lg">{module.icon}</span>
                    <span
                      className="text-sm font-medium truncate hover:text-red-400 transition-colors"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {module.title}
                    </span>
                  </Link>
                  <div className="flex-1">
                    <ProgressBar value={pct} showPercent={false} color="blue" />
                  </div>
                  <span
                    className="text-xs font-mono w-12 text-right shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {solved}/{total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent submissions */}
        {recentSubmissions.length > 0 && (
          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wider mb-5"
              style={{ color: "var(--text-muted)" }}
            >
              Submissões Recentes
            </h3>
            <div className="space-y-2">
              {recentSubmissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/practice/${sub.challenge.id}?submission=${sub.id}`}
                  className="flex items-center justify-between p-3 rounded-lg transition-all"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{sub.passed ? "✅" : "❌"}</span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {sub.challenge.title}
                    </span>
                    <DifficultyBadge difficulty={sub.challenge.difficulty} />
                  </div>
                  <div className="flex items-center gap-3">
                    {sub.passed && (
                      <span className="text-xs font-mono" style={{ color: "var(--success)" }}>
                        +{sub.score}pts
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(sub.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
