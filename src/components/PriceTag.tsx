'use client';

interface PriceTagProps {
  chg: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceTag({ chg, size = 'md' }: PriceTagProps) {
  const sizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  let text: string;
  let color: string;

  if (chg > 0) {
    text = `▲ +${chg.toFixed(2)}%`;
    color = '#FF2D2D';
  } else if (chg < 0) {
    text = `▼ ${chg.toFixed(2)}%`;
    color = '#2D6CFF';
  } else {
    text = `— 0.00%`;
    color = '#999999';
  }

  return (
    <span className={`font-mono font-bold ${sizeClass}`} style={{ color }}>
      {text}
    </span>
  );
}
