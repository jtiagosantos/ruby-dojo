"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Difficulty = "all" | "beginner" | "intermediate" | "advanced";

const options: { value: Difficulty; label: string; color: string; bg: string }[] = [
  { value: "all", label: "Todos", color: "var(--text-secondary)", bg: "var(--bg-elevated)" },
  { value: "beginner", label: "Iniciante", color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  { value: "intermediate", label: "Intermediário", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { value: "advanced", label: "Avançado", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
];

export default function DifficultyFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = (searchParams.get("difficulty") ?? "all") as Difficulty;

  function setFilter(value: Difficulty) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("difficulty");
    } else {
      params.set("difficulty", value);
    }
    router.push(`/practice?${params.toString()}`);
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {options.map((opt) => {
        const isActive = current === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: isActive ? 600 : 400,
              cursor: "pointer",
              border: isActive ? `1px solid ${opt.color}` : "1px solid var(--border-subtle)",
              background: isActive ? opt.bg : "transparent",
              color: isActive ? opt.color : "var(--text-muted)",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
