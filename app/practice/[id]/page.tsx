import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { DifficultyBadge } from "@/components/ui/Badge";
import ChallengeClient from "@/components/practice/ChallengeClient";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submission?: string }>;
}

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { id } = await params;
  const challenge = await prisma.challenge.findUnique({ where: { id } });
  if (!challenge) return { title: "Desafio não encontrado — Ruby Dojo" };
  return {
    title: `${challenge.title} — Ruby Dojo`,
    description: challenge.description.slice(0, 160),
  };
}

export default async function ChallengePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { submission: submissionId } = await searchParams;

  const [challenge, session] = await Promise.all([
    prisma.challenge.findUnique({
      where: { id },
      include: { module: { select: { title: true, slug: true, icon: true } } },
    }),
    auth(),
  ]);

  if (!challenge) notFound();

  const userId = session!.user!.id!;

  // Check if user has solved this challenge
  const bestSubmission = await prisma.submission.findFirst({
    where: { challengeId: id, userId, passed: true },
    orderBy: { createdAt: "desc" },
  });

  // If coming from a submission link, load that submission's code
  const submissionCode = submissionId
    ? await prisma.submission.findFirst({
        where: { id: submissionId, userId },
        select: { code: true },
      }).then((s) => s?.code ?? null)
    : null;

  // Community solutions — only visible if the current user has already solved this challenge
  const communitySolutions = bestSubmission
    ? await prisma.submission.findMany({
        where: {
          challengeId: id,
          passed: true,
          userId: { not: userId },
        },
        orderBy: { createdAt: "asc" },
        distinct: ["userId"],
        select: {
          id: true,
          code: true,
          createdAt: true,
          user: { select: { name: true, image: true } },
        },
      })
    : [];

  // Get adjacent challenges
  const moduleId = challenge.moduleId;
  const adjacent = moduleId
    ? await prisma.challenge.findMany({
        where: { moduleId },
        orderBy: { order: "asc" },
        select: { id: true, title: true, order: true },
      })
    : [];
  const currentIdx = adjacent.findIndex((c) => c.id === id);
  const prevChallenge = currentIdx > 0 ? adjacent[currentIdx - 1] : null;
  const nextChallenge = currentIdx < adjacent.length - 1 ? adjacent[currentIdx + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link href="/practice" style={{ color: "var(--text-muted)" }}>
          Praticar
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        {challenge.module && (
          <>
            <Link
              href={`/learn/${challenge.module.slug}`}
              style={{ color: "var(--text-muted)" }}
            >
              {challenge.module.title}
            </Link>
            <span style={{ color: "var(--text-muted)" }}>/</span>
          </>
        )}
        <span style={{ color: "var(--text-secondary)" }}>{challenge.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_560px] gap-6 lg:min-h-[600px]">
        {/* Left: Description */}
        <div className="flex flex-col min-w-0">
          {/* Challenge header */}
          <div
            className="rounded-xl p-6 mb-4"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1
                  className="text-2xl font-bold mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  {challenge.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <DifficultyBadge difficulty={challenge.difficulty} />
                  <span
                    className="text-sm font-mono font-semibold"
                    style={{ color: "var(--accent-red-light)" }}
                  >
                    +{challenge.points} pontos
                  </span>
                  {bestSubmission && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: "rgba(34,197,94,0.15)",
                        color: "var(--success)",
                        border: "1px solid rgba(34,197,94,0.3)",
                      }}
                    >
                      ✓ Resolvido
                    </span>
                  )}
                </div>
              </div>
              {challenge.module && (
                <Link
                  href={`/learn/${challenge.module.slug}`}
                  className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{
                    background: "var(--bg-elevated)",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <span>{challenge.module.icon}</span>
                  <span>Ver módulo</span>
                </Link>
              )}
            </div>
          </div>

          {/* Description */}
          <div
            className="rounded-xl p-6 lg:flex-1 lg:overflow-y-auto"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h2
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: "var(--text-muted)" }}
            >
              Descrição
            </h2>
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {challenge.description}
              </ReactMarkdown>
            </div>
          </div>

          {/* Navigation */}
          {(prevChallenge || nextChallenge) && (
            <div className="flex flex-col sm:flex-row items-stretch gap-3 mt-4">
              {prevChallenge && (
                <Link
                  href={`/practice/${prevChallenge.id}`}
                  className="flex-1 rounded-xl p-4 text-left"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                    ← Anterior
                  </div>
                  <div className="text-sm font-medium truncate" style={{ color: "var(--text-secondary)" }}>
                    {prevChallenge.title}
                  </div>
                </Link>
              )}
              {nextChallenge && (
                <Link
                  href={`/practice/${nextChallenge.id}`}
                   className="flex-1 rounded-xl p-4 sm:text-right"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                    Próximo →
                  </div>
                  <div className="text-sm font-medium truncate" style={{ color: "var(--text-secondary)" }}>
                    {nextChallenge.title}
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right: Editor */}
        <ChallengeClient
          challengeId={id}
          starterCode={challenge.starterCode}
          initialCode={submissionCode ?? undefined}
          communitySolutions={communitySolutions}
        />
      </div>
    </div>
  );
}
