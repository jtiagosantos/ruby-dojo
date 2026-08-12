import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ranking — Ruby Dojo",
  description: "Classificação dos usuários do Ruby Dojo por pontuação",
};

export default async function RankingPage() {
  const session = await auth();
  const currentUserId = session!.user!.id!;

  const leaders = await prisma.userSession.findMany({
    orderBy: { score: "desc" },
    take: 50,
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  const rankLabel = (score: number) =>
    score >= 500
      ? "Mestre Ruby"
      : score >= 200
      ? "Desenvolvedor Ruby"
      : score >= 50
      ? "Aprendiz Ruby"
      : "Novato";

  const medalColor = (position: number) => {
    if (position === 1) return "#FFD700";
    if (position === 2) return "#C0C0C0";
    if (position === 3) return "#CD7F32";
    return "var(--text-muted)";
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Ranking
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Os desenvolvedores com mais pontos no Ruby Dojo
        </p>
      </div>

      {/* Podium — top 3 */}
      {leaders.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 mb-8 items-end">
          {/* 2nd place */}
          <div
            className="flex flex-col items-center p-4 rounded-xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              opacity: leaders[1] ? 1 : 0,
            }}
          >
            <span className="text-2xl mb-2">🥈</span>
            {leaders[1]?.user.image ? (
              <Image
                src={leaders[1].user.image}
                alt={leaders[1].user.name ?? ""}
                width={40}
                height={40}
                className="rounded-full mb-2"
                style={{ border: "2px solid #C0C0C0" }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                style={{ background: "var(--accent-red)", color: "#fff" }}
              >
                {(leaders[1]?.user.name ?? "U")[0].toUpperCase()}
              </div>
            )}
            <span
              className="text-xs font-semibold text-center truncate w-full"
              style={{ color: "var(--text-primary)" }}
            >
              {leaders[1]?.user.name ?? "—"}
            </span>
            <span
              className="text-lg font-bold font-mono mt-1"
              style={{ color: "#C0C0C0" }}
            >
              {leaders[1]?.score ?? 0}
              <span className="text-xs font-normal">pts</span>
            </span>
          </div>

          {/* 1st place */}
          <div
            className="flex flex-col items-center p-4 rounded-xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid rgba(255,215,0,0.4)",
            }}
          >
            <span className="text-2xl mb-2">🥇</span>
            {leaders[0]?.user.image ? (
              <Image
                src={leaders[0].user.image}
                alt={leaders[0].user.name ?? ""}
                width={48}
                height={48}
                className="rounded-full mb-2"
                style={{ border: "2px solid #FFD700" }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2"
                style={{ background: "var(--accent-red)", color: "#fff" }}
              >
                {(leaders[0]?.user.name ?? "U")[0].toUpperCase()}
              </div>
            )}
            <span
              className="text-xs font-semibold text-center truncate w-full"
              style={{ color: "var(--text-primary)" }}
            >
              {leaders[0]?.user.name ?? "—"}
            </span>
            <span
              className="text-xl font-bold font-mono mt-1"
              style={{ color: "#FFD700" }}
            >
              {leaders[0]?.score ?? 0}
              <span className="text-xs font-normal">pts</span>
            </span>
          </div>

          {/* 3rd place */}
          <div
            className="flex flex-col items-center p-4 rounded-xl"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span className="text-2xl mb-2">🥉</span>
            {leaders[2]?.user.image ? (
              <Image
                src={leaders[2].user.image}
                alt={leaders[2].user.name ?? ""}
                width={40}
                height={40}
                className="rounded-full mb-2"
                style={{ border: "2px solid #CD7F32" }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                style={{ background: "var(--accent-red)", color: "#fff" }}
              >
                {(leaders[2]?.user.name ?? "U")[0].toUpperCase()}
              </div>
            )}
            <span
              className="text-xs font-semibold text-center truncate w-full"
              style={{ color: "var(--text-primary)" }}
            >
              {leaders[2]?.user.name ?? "—"}
            </span>
            <span
              className="text-lg font-bold font-mono mt-1"
              style={{ color: "#CD7F32" }}
            >
              {leaders[2]?.score ?? 0}
              <span className="text-xs font-normal">pts</span>
            </span>
          </div>
        </div>
      )}

      {/* Full list */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {leaders.length === 0 ? (
          <div className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
            Nenhum usuário no ranking ainda.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {leaders.map((entry, index) => {
              const position = index + 1;
              const isCurrentUser = entry.user.id === currentUserId;
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 px-5 py-3"
                  style={{
                    background: isCurrentUser
                      ? "rgba(239,68,68,0.05)"
                      : "transparent",
                    borderLeft: isCurrentUser
                      ? "2px solid var(--accent-red)"
                      : "2px solid transparent",
                  }}
                >
                  {/* Position */}
                  <span
                    className="w-7 text-sm font-bold font-mono text-right shrink-0"
                    style={{ color: medalColor(position) }}
                  >
                    {position <= 3 ? ["🥇", "🥈", "🥉"][position - 1] : `#${position}`}
                  </span>

                  {/* Avatar */}
                  {entry.user.image ? (
                    <Image
                      src={entry.user.image}
                      alt={entry.user.name ?? ""}
                      width={32}
                      height={32}
                      className="rounded-full shrink-0"
                      style={{ border: "1px solid var(--border-default)" }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: "var(--accent-red)", color: "#fff" }}
                    >
                      {(entry.user.name ?? "U")[0].toUpperCase()}
                    </div>
                  )}

                  {/* Name + rank */}
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm font-medium truncate block"
                      style={{ color: isCurrentUser ? "var(--accent-red-light)" : "var(--text-primary)" }}
                    >
                      {entry.user.name ?? "Usuário"}
                      {isCurrentUser && (
                        <span
                          className="ml-2 text-xs font-normal"
                          style={{ color: "var(--text-muted)" }}
                        >
                          (você)
                        </span>
                      )}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {rankLabel(entry.score)}
                    </span>
                  </div>

                  {/* Score */}
                  <span
                    className="text-sm font-bold font-mono shrink-0"
                    style={{ color: position <= 3 ? medalColor(position) : "var(--text-secondary)" }}
                  >
                    {entry.score}
                    <span className="text-xs font-normal ml-0.5">pts</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
