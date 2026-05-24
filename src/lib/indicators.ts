export function calcSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j];
    result.push(sum / period);
  }
  return result;
}

function calcEMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const result: number[] = [];
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(ema);
  for (let i = period; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
    result.push(ema);
  }
  return result;
}

export function calcRSI(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff;
    else avgLoss += Math.abs(diff);
  }
  avgGain /= period;
  avgLoss /= period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calcMACD(closes: number[]): {
  macd: number;
  signal: number;
  histogram: number;
  crossover: 'golden' | 'dead' | 'none';
} | null {
  if (closes.length < 35) return null;
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const offset = ema12.length - ema26.length;
  const macdLine: number[] = [];
  for (let i = 0; i < ema26.length; i++) {
    macdLine.push(ema12[i + offset] - ema26[i]);
  }
  const signalLine = calcEMA(macdLine, 9);
  if (signalLine.length < 2) return null;
  const macd = macdLine[macdLine.length - 1];
  const signal = signalLine[signalLine.length - 1];
  const histogram = macd - signal;
  const prevHistogram =
    macdLine[macdLine.length - 2] - signalLine[signalLine.length - 2];
  let crossover: 'golden' | 'dead' | 'none' = 'none';
  if (prevHistogram < 0 && histogram >= 0) crossover = 'golden';
  else if (prevHistogram > 0 && histogram <= 0) crossover = 'dead';
  return { macd, signal, histogram, crossover };
}

export function calcMFI(
  highs: number[],
  lows: number[],
  closes: number[],
  volumes: number[],
  period = 14
): number | null {
  const len = Math.min(highs.length, lows.length, closes.length, volumes.length);
  if (len < period + 1) return null;
  const tp: number[] = [];
  for (let i = 0; i < len; i++) {
    tp.push((highs[i] + lows[i] + closes[i]) / 3);
  }
  let posFlow = 0;
  let negFlow = 0;
  const start = len - period;
  for (let i = start; i < len; i++) {
    const mf = tp[i] * volumes[i];
    if (tp[i] > tp[i - 1]) posFlow += mf;
    else if (tp[i] < tp[i - 1]) negFlow += mf;
  }
  if (negFlow === 0) return 100;
  const mfr = posFlow / negFlow;
  return 100 - 100 / (1 + mfr);
}

export function calcBollingerB(
  closes: number[],
  period = 20
): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
  const std = Math.sqrt(variance);
  if (std === 0) return 0.5;
  const upper = mean + 2 * std;
  const lower = mean - 2 * std;
  return (closes[closes.length - 1] - lower) / (upper - lower);
}
