interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  color?: "red" | "green" | "blue";
}

const colorMap = {
  red: "var(--accent-red)",
  green: "var(--success)",
  blue: "var(--accent-blue)",
};

export default function ProgressBar({
  value,
  label,
  showPercent = true,
  color = "red",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full h-2"
        style={{ background: "var(--bg-elevated)" }}
      >
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${clampedValue}%`,
            background: colorMap[color],
          }}
        />
      </div>
    </div>
  );
}
