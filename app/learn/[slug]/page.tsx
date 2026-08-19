import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ModuleContent from "@/components/learn/ModuleContent";
import { DifficultyBadge } from "@/components/ui/Badge";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const module = await prisma.module.findUnique({ where: { slug } });
  if (!module) return { title: "Módulo não encontrado — Ruby Dojo" };
  return {
    title: `${module.title} — Ruby Dojo`,
    description: module.description,
  };
}

export default async function ModulePage({ params }: PageProps) {
  const { slug } = await params;

  const module = await prisma.module.findUnique({
    where: { slug },
    include: {
      challenges: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, difficulty: true, points: true },
        take: 3,
      },
    },
  });

  if (!module) notFound();

  // Next and previous modules
  const allModules = await prisma.module.findMany({
    orderBy: { order: "asc" },
    select: { slug: true, title: true, order: true },
  });
  const currentIndex = allModules.findIndex((m) => m.slug === slug);
  const prevModule = currentIndex > 0 ? allModules[currentIndex - 1] : null;
  const nextModule =
    currentIndex < allModules.length - 1 ? allModules[currentIndex + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8">
        <Link
          href="/learn"
          className="hover:text-red-400 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          Aprender
        </Link>
        <span style={{ color: "var(--text-muted)" }}>/</span>
        <span style={{ color: "var(--text-secondary)" }}>{module.title}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Main content */}
        <div className="min-w-0">
          {/* Module header */}
          <div
            className="rounded-xl p-4 sm:p-8 mb-8"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{ background: "var(--bg-elevated)" }}
              >
                {module.icon}
              </div>
              <div>
                <div
                  className="text-xs font-mono mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Módulo #{String(module.order).padStart(2, "0")}
                </div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {module.title}
                </h1>
              </div>
            </div>
            <p style={{ color: "var(--text-secondary)" }}>{module.description}</p>
          </div>

          {/* Content */}
          <div
            className="rounded-xl p-4 sm:p-8"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <ModuleContent content={module.content} />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 gap-4">
            {prevModule ? (
              <Link
                href={`/learn/${prevModule.slug}`}
                className="flex-1 rounded-xl p-5 text-left transition-all"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  ← Anterior
                </div>
                <div
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {prevModule.title}
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {nextModule ? (
              <Link
                href={`/learn/${nextModule.slug}`}
                className="flex-1 rounded-xl p-5 text-right transition-all"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  className="text-xs mb-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  Próximo →
                </div>
                <div
                  className="font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {nextModule.title}
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related challenges */}
          {module.challenges.length > 0 && (
            <div
              className="rounded-xl p-6"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <h3
                className="text-sm font-semibold mb-4 uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Desafios Relacionados
              </h3>
              <div className="space-y-3">
                {module.challenges.map((challenge) => (
                  <Link
                    key={challenge.id}
                    href={`/practice/${challenge.id}`}
                    className="block rounded-lg p-3 transition-all"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div
                      className="text-sm font-medium mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {challenge.title}
                    </div>
                    <div className="flex items-center justify-between">
                      <DifficultyBadge difficulty={challenge.difficulty} />
                      <span
                        className="text-xs font-mono"
                        style={{ color: "var(--text-muted)" }}
                      >
                        +{challenge.points}pts
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/practice"
                className="block text-center text-xs mt-4 py-2 rounded-lg transition-all"
                style={{
                  color: "var(--accent-red-light)",
                  background: "var(--bg-elevated)",
                }}
              >
                Ver todos os desafios →
              </Link>
            </div>
          )}

          {/* All modules */}
          <div
            className="rounded-xl p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <h3
              className="text-sm font-semibold mb-4 uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Todos os Módulos
            </h3>
            <div className="space-y-1 max-h-64 lg:max-h-none overflow-y-auto">
              {allModules.map((m) => (
                <Link
                  key={m.slug}
                  href={`/learn/${m.slug}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background:
                      m.slug === slug ? "var(--bg-elevated)" : "transparent",
                    color:
                      m.slug === slug
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                    borderLeft:
                      m.slug === slug
                        ? "2px solid var(--accent-red)"
                        : "2px solid transparent",
                  }}
                >
                  <span
                    className="text-xs font-mono w-5 shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {String(m.order).padStart(2, "0")}
                  </span>
                  <span className="truncate">{m.title}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
