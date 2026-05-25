export const EXCHANGE_RATE = 1448.5;

export function formatKRW(value: number): string {
  return `${Math.round(value).toLocaleString("ko-KR")}원`;
}

export function formatUSD(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatManWon(value: number): string {
  const man = value / 10000;
  if (man >= 1000) return `${(man / 10000).toFixed(2)}억원`;
  return `${Math.round(man).toLocaleString("ko-KR")}만원`;
}

export function formatNativePrice(value: number, isUsd?: boolean): string {
  return isUsd ? formatUSD(value) : formatKRW(value);
}

export function toKRW(value: number, isUsd?: boolean): number {
  return isUsd ? value * EXCHANGE_RATE : value;
}

export function formatChange(change: number): { text: string; color: string } {
  if (change > 0) return { text: `▲ +${change.toFixed(2)}%`, color: "#FF2D2D" };
  if (change < 0) return { text: `▼ ${change.toFixed(2)}%`, color: "#2D6CFF" };
  return { text: "— 0.00%", color: "#999999" };
}

export function formatChangeCompact(change: number): { text: string; color: string } {
  if (change > 0) return { text: `+${change.toFixed(2)}%`, color: "#FF2D2D" };
  if (change < 0) return { text: `${change.toFixed(2)}%`, color: "#2D6CFF" };
  return { text: "0.00%", color: "#999999" };
}

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function calcDDay(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00+09:00");
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / 86400000);
}

export function formatDDay(d: number): string {
  if (d === 0) return "D-Day";
  if (d > 0) return `D-${d}`;
  return `D+${Math.abs(d)}`;
}
