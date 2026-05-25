"use client";

interface PriceTagProps {
  change: number;
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
}

export default function PriceTag({ change, size = "md", showArrow = true }: PriceTagProps) {
  const isUp = change > 0;
  const isDown = change < 0;
  const color = isUp ? "#FF2D2D" : isDown ? "#2D6CFF" : "#999999";
  const arrow = isUp ? "▲" : isDown ? "▼" : "—";
  const sign = isUp ? "+" : "";
  const fontSize = size === "lg" ? "text-[15px]" : size === "sm" ? "text-[11px]" : "text-[13px]";

  return (
    <span className={`font-mono font-bold ${fontSize}`} style={{ color }}>
      {showArrow && `${arrow} `}
      {sign}
      {change.toFixed(2)}%
    </span>
  );
}
