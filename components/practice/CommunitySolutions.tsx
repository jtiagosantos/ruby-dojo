"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const CodeEditor = dynamic(() => import("@/components/practice/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-lg h-64 flex items-center justify-center"
      style={{ background: "var(--bg-code)", border: "1px solid var(--border-default)" }}
    >
      <span style={{ color: "var(--text-muted)" }}>Carregando...</span>
    </div>
  ),
});

export interface CommunitySolution {
  id: string;
  code: string;
  createdAt: Date;
  user: { name: string | null; image: string | null };
}

interface Props {
  solutions: CommunitySolution[];
}

export default function CommunitySolutions({ solutions }: Props) {
  const [selected, setSelected] = useState<CommunitySolution | null>(
    solutions[0] ?? null
  );

  if (solutions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="text-4xl opacity-30">👥</div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Nenhuma solução da comunidade ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Author list */}
      <div className="flex flex-wrap gap-2">
        {solutions.map((sol) => {
          const isActive = selected?.id === sol.id;
          return (
            <button
              key={sol.id}
              onClick={() => setSelected(sol)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: isActive ? "var(--accent-red)" : "var(--bg-elevated)",
                color: isActive ? "#fff" : "var(--text-secondary)",
                border: `1px solid ${isActive ? "var(--accent-red)" : "var(--border-subtle)"}`,
              }}
            >
              {sol.user.image ? (
                <Image
                  src={sol.user.image}
                  alt={sol.user.name ?? ""}
                  width={18}
                  height={18}
                  className="rounded-full shrink-0"
                />
              ) : (
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.3)" : "var(--accent-red)",
                    color: "#fff",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                  }}
                >
                  {(sol.user.name ?? "U")[0].toUpperCase()}
                </div>
              )}
              {sol.user.name ?? "Usuário"}
            </button>
          );
        })}
      </div>

      {/* Selected solution */}
      {selected && (
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Enviado em{" "}
              {new Date(selected.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <div
            className="rounded-lg overflow-hidden flex-1"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <CodeEditor value={selected.code} onChange={() => {}} height="380px" readOnly />
          </div>
        </div>
      )}
    </div>
  );
}
