import React from "react";

type BadgeVariant = "beginner" | "intermediate" | "advanced" | "default" | "blue" | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  beginner: {
    background: "rgba(34, 197, 94, 0.15)",
    color: "#22c55e",
    border: "1px solid rgba(34, 197, 94, 0.3)",
  },
  intermediate: {
    background: "rgba(245, 158, 11, 0.15)",
    color: "#f59e0b",
    border: "1px solid rgba(245, 158, 11, 0.3)",
  },
  advanced: {
    background: "rgba(239, 68, 68, 0.15)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.3)",
  },
  default: {
    background: "var(--bg-elevated)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border-default)",
  },
  blue: {
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    border: "1px solid rgba(59, 130, 246, 0.3)",
  },
  purple: {
    background: "rgba(124, 58, 237, 0.15)",
    color: "#a78bfa",
    border: "1px solid rgba(124, 58, 237, 0.3)",
  },
};

const difficultyLabel: Partial<Record<BadgeVariant, string>> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export default function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const variant = difficulty as BadgeVariant;
  const label = difficultyLabel[variant] ?? difficulty;
  return <Badge variant={variant}>{label}</Badge>;
}
