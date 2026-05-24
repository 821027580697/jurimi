export function calcSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += data[i - j];
    result.push(sum / period);
  }
  return result;
}

export function calcEMA(data: number[], period: number): number[] {
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
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff; else avgLoss += Math.abs(diff);
  }
  avgGain /= period; avgLoss /= period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

export function calcRSISeries(closes: number[], period = 14): number[] {
  const result: number[] = [];
  if (closes.length < period + 1) return result;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) avgGain += diff; else avgLoss += Math.abs(diff);
  }
  avgGain /= period; avgLoss /= period;
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }
  return result;
}

export function calcMACD(closes: number[]): {
  macd: number; signal: number; histogram: number;
  crossover: 'golden' | 'dead' | 'none';
} | null {
  if (closes.length < 35) return null;
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const offset = ema12.length - ema26.length;
  const macdLine: number[] = [];
  for (let i = 0; i < ema26.length; i++) macdLine.push(ema12[i + offset] - ema26[i]);
  const signalLine = calcEMA(macdLine, 9);
  if (signalLine.length < 2) return null;
  const macd = macdLine[macdLine.length - 1];
  const signal = signalLine[signalLine.length - 1];
  const histogram = macd - signal;
  const prevHist = macdLine[macdLine.length - 2] - signalLine[signalLine.length - 2];
  let crossover: 'golden' | 'dead' | 'none' = 'none';
  if (prevHist < 0 && histogram >= 0) crossover = 'golden';
  else if (prevHist > 0 && histogram <= 0) crossover = 'dead';
  return { macd, signal, histogram, crossover };
}

export function calcMACDSeries(closes: number[]): {
  macdLine: number[]; signalLine: number[]; histogram: number[]; offset: number;
} | null {
  if (closes.length < 35) return null;
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const off = ema12.length - ema26.length;
  const macdLine: number[] = [];
  for (let i = 0; i < ema26.length; i++) macdLine.push(ema12[i + off] - ema26[i]);
  const signalLine = calcEMA(macdLine, 9);
  const sigOff = macdLine.length - signalLine.length;
  const histogram: number[] = [];
  for (let i = 0; i < signalLine.length; i++) histogram.push(macdLine[i + sigOff] - signalLine[i]);
  const totalOffset = 26 - 1 + sigOff;
  return { macdLine: macdLine.slice(sigOff), signalLine, histogram, offset: totalOffset };
}

export function calcMFI(highs: number[], lows: number[], closes: number[], volumes: number[], period = 14): number | null {
  const len = Math.min(highs.length, lows.length, closes.length, volumes.length);
  if (len < period + 1) return null;
  const tp: number[] = [];
  for (let i = 0; i < len; i++) tp.push((highs[i] + lows[i] + closes[i]) / 3);
  let posFlow = 0, negFlow = 0;
  for (let i = len - period; i < len; i++) {
    const mf = tp[i] * volumes[i];
    if (tp[i] > tp[i - 1]) posFlow += mf; else if (tp[i] < tp[i - 1]) negFlow += mf;
  }
  if (negFlow === 0) return 100;
  return 100 - 100 / (1 + posFlow / negFlow);
}

export function calcBollingerB(closes: number[], period = 20): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period;
  const std = Math.sqrt(variance);
  if (std === 0) return 0.5;
  return (closes[closes.length - 1] - (mean - 2 * std)) / (4 * std);
}

export function calcStochastic(highs: number[], lows: number[], closes: number[], kPeriod = 14, dPeriod = 3): { k: number; d: number } | null {
  if (closes.length < kPeriod + dPeriod) return null;
  const kValues: number[] = [];
  for (let i = kPeriod - 1; i < closes.length; i++) {
    let hh = -Infinity, ll = Infinity;
    for (let j = 0; j < kPeriod; j++) { hh = Math.max(hh, highs[i - j]); ll = Math.min(ll, lows[i - j]); }
    kValues.push(hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100);
  }
  const dValues = calcSMA(kValues, dPeriod);
  return { k: kValues[kValues.length - 1], d: dValues[dValues.length - 1] };
}

export function calcStochasticSeries(highs: number[], lows: number[], closes: number[], kPeriod = 14, dPeriod = 3): { k: number[]; d: number[]; offset: number } | null {
  if (closes.length < kPeriod + dPeriod) return null;
  const kValues: number[] = [];
  for (let i = kPeriod - 1; i < closes.length; i++) {
    let hh = -Infinity, ll = Infinity;
    for (let j = 0; j < kPeriod; j++) { hh = Math.max(hh, highs[i - j]); ll = Math.min(ll, lows[i - j]); }
    kValues.push(hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100);
  }
  const dValues = calcSMA(kValues, dPeriod);
  return { k: kValues.slice(dPeriod - 1), d: dValues, offset: kPeriod - 1 + dPeriod - 1 };
}

export function calcOBV(closes: number[], volumes: number[]): number[] {
  const obv: number[] = [0];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) obv.push(obv[i - 1] + volumes[i]);
    else if (closes[i] < closes[i - 1]) obv.push(obv[i - 1] - volumes[i]);
    else obv.push(obv[i - 1]);
  }
  return obv;
}

export function calcWilliamsR(highs: number[], lows: number[], closes: number[], period = 14): number | null {
  if (closes.length < period) return null;
  let hh = -Infinity, ll = Infinity;
  for (let i = closes.length - period; i < closes.length; i++) {
    hh = Math.max(hh, highs[i]); ll = Math.min(ll, lows[i]);
  }
  if (hh === ll) return -50;
  return ((hh - closes[closes.length - 1]) / (hh - ll)) * -100;
}

export function calcATR(highs: number[], lows: number[], closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;
  const trs: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }
  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trs.length; i++) atr = (atr * (period - 1) + trs[i]) / period;
  return atr;
}

export function calcCCI(highs: number[], lows: number[], closes: number[], period = 20): number | null {
  if (closes.length < period) return null;
  const tp: number[] = [];
  for (let i = 0; i < closes.length; i++) tp.push((highs[i] + lows[i] + closes[i]) / 3);
  const slice = tp.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const md = slice.reduce((a, b) => a + Math.abs(b - mean), 0) / period;
  if (md === 0) return 0;
  return (tp[tp.length - 1] - mean) / (0.015 * md);
}

export function calcADX(highs: number[], lows: number[], closes: number[], period = 14): number | null {
  if (closes.length < period * 2 + 1) return null;
  const pdm: number[] = [], ndm: number[] = [], trs: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const up = highs[i] - highs[i - 1], dn = lows[i - 1] - lows[i];
    pdm.push(up > dn && up > 0 ? up : 0);
    ndm.push(dn > up && dn > 0 ? dn : 0);
    trs.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1])));
  }
  let smPDM = pdm.slice(0, period).reduce((a, b) => a + b, 0);
  let smNDM = ndm.slice(0, period).reduce((a, b) => a + b, 0);
  let smTR = trs.slice(0, period).reduce((a, b) => a + b, 0);
  const dx: number[] = [];
  for (let i = period; i < pdm.length; i++) {
    smPDM = smPDM - smPDM / period + pdm[i];
    smNDM = smNDM - smNDM / period + ndm[i];
    smTR = smTR - smTR / period + trs[i];
    const pdi = smTR === 0 ? 0 : (smPDM / smTR) * 100;
    const ndi = smTR === 0 ? 0 : (smNDM / smTR) * 100;
    dx.push(pdi + ndi === 0 ? 0 : (Math.abs(pdi - ndi) / (pdi + ndi)) * 100);
  }
  if (dx.length < period) return null;
  let adx = dx.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < dx.length; i++) adx = (adx * (period - 1) + dx[i]) / period;
  return adx;
}
