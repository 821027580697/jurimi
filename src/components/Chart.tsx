'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, IChartApi, CandlestickData, HistogramData, Time } from 'lightweight-charts';
import { fetchCandles, toFinnhubSymbol, CandleData } from '@/lib/api';

interface ChartProps {
  symbol: string;
  isKorean?: boolean;
  onCandlesLoaded?: (data: CandleData) => void;
}

const PERIOD_DAYS: Record<string, number> = { '1W': 7, '1M': 30, '3M': 90, '1Y': 365 };

function generateFallbackCandles(basePrice: number, days: number): CandleData {
  const c: number[] = [], h: number[] = [], l: number[] = [], o: number[] = [], t: number[] = [], v: number[] = [];
  let price = basePrice * 0.7;
  const now = Math.floor(Date.now() / 1000);
  for (let i = days; i >= 0; i--) {
    const ts = now - i * 86400;
    const d = new Date(ts * 1000);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const open = price;
    const change = (Math.random() - 0.48 + 0.001) * 0.03 * price;
    const close = open + change;
    price = close;
    o.push(open);
    c.push(close);
    h.push(Math.max(open, close) * (1 + Math.random() * 0.015));
    l.push(Math.min(open, close) * (1 - Math.random() * 0.015));
    t.push(ts);
    v.push(Math.floor(Math.random() * 5000000 + 500000));
  }
  return { o, h, l, c, t, v, s: 'fallback' };
}

export default function Chart({ symbol, isKorean, onCandlesLoaded }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const [period, setPeriod] = useState('1Y');
  const [showMA, setShowMA] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showVol, setShowVol] = useState(true);
  const [rawCandles, setRawCandles] = useState<CandleData | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const finnSym = toFinnhubSymbol(symbol, !isKorean);
      const data = await fetchCandles(finnSym, 'D', 400);
      if (cancelled) return;
      if (data) {
        setRawCandles(data);
        setIsLive(true);
        onCandlesLoaded?.(data);
      } else {
        const fb = generateFallbackCandles(isKorean ? 50000 : 150, 400);
        setRawCandles(fb);
        setIsLive(false);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, isKorean]);

  const slicedData = useMemo(() => {
    if (!rawCandles) return null;
    const days = PERIOD_DAYS[period] || 365;
    const cutoff = Math.floor(Date.now() / 1000) - days * 86400;
    const startIdx = rawCandles.t.findIndex(ts => ts >= cutoff);
    const idx = startIdx >= 0 ? startIdx : 0;
    return {
      o: rawCandles.o.slice(idx),
      h: rawCandles.h.slice(idx),
      l: rawCandles.l.slice(idx),
      c: rawCandles.c.slice(idx),
      t: rawCandles.t.slice(idx),
      v: rawCandles.v.slice(idx),
      s: rawCandles.s,
    };
  }, [rawCandles, period]);

  useEffect(() => {
    if (!chartRef.current || !slicedData || slicedData.c.length === 0) return;
    chartRef.current.innerHTML = '';

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 300,
      layout: { background: { color: '#ffffff' }, textColor: '#333', fontSize: 11 },
      grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#e5e5e5' },
      timeScale: { borderColor: '#e5e5e5', timeVisible: false },
    });
    chartInstance.current = chart;

    const candles: CandlestickData<Time>[] = slicedData.t.map((ts, i) => {
      const d = new Date(ts * 1000);
      const time = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` as Time;
      return { time, open: slicedData.o[i], high: slicedData.h[i], low: slicedData.l[i], close: slicedData.c[i] };
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#ffffff', downColor: '#2D6CFF',
      borderUpColor: '#FF2D2D', borderDownColor: '#2D6CFF',
      wickUpColor: '#FF2D2D', wickDownColor: '#2D6CFF',
    });
    candleSeries.setData(candles);

    if (showMA && candles.length > 20) {
      addMA(chart, candles, 5, '#FF2D2D');
      addMA(chart, candles, 20, '#2D6CFF');
      if (candles.length > 60) addMA(chart, candles, 60, '#00C176');
    }

    if (showBB && candles.length > 20) {
      addBB(chart, candles, 20);
    }

    if (showVol) {
      const volumes: HistogramData<Time>[] = slicedData.t.map((ts, i) => {
        const d = new Date(ts * 1000);
        const time = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` as Time;
        return {
          time,
          value: slicedData.v[i],
          color: slicedData.c[i] >= slicedData.o[i] ? 'rgba(255,45,45,0.3)' : 'rgba(45,108,255,0.3)',
        };
      });
      const volSeries = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: 'volume' });
      volSeries.setData(volumes);
      chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    }

    chart.timeScale().fitContent();
    const handleResize = () => { if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth }); };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); chart.remove(); };
  }, [slicedData, showMA, showBB, showVol]);

  if (loading) {
    return <div className="w-full h-[300px] bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-400 animate-pulse">차트 로딩 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          {Object.keys(PERIOD_DAYS).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs rounded-full font-bold ${period === p ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
              {p === '1W' ? '1주' : p === '1M' ? '1월' : p === '3M' ? '3월' : '1년'}
            </button>
          ))}
        </div>
        {isLive ? (
          <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
        ) : (
          <span className="text-[9px] font-bold bg-gray-300 text-white px-1.5 py-0.5 rounded">참고용</span>
        )}
      </div>
      <div ref={chartRef} className="w-full rounded-lg overflow-hidden border border-gray-100" />
      <div className="flex gap-2 mt-2">
        {[
          { key: 'ma', label: '이평선', val: showMA, set: setShowMA },
          { key: 'bb', label: '볼린저', val: showBB, set: setShowBB },
          { key: 'vol', label: '거래량', val: showVol, set: setShowVol },
        ].map(({ key, label, val, set }) => (
          <button key={key} onClick={() => set(!val)}
            className={`text-[11px] px-2 py-1 rounded ${val ? 'bg-black text-white' : 'bg-gray-100'}`}>
            {val ? '✅' : '⬜'} {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function addMA(chart: IChartApi, candles: CandlestickData<Time>[], period: number, color: string) {
  const data: { time: Time; value: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += candles[i - j].close;
    data.push({ time: candles[i].time, value: sum / period });
  }
  const series = chart.addLineSeries({ color, lineWidth: 1, priceLineVisible: false });
  series.setData(data);
}

function addBB(chart: IChartApi, candles: CandlestickData<Time>[], period: number) {
  const upper: { time: Time; value: number }[] = [];
  const lower: { time: Time; value: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += candles[i - j].close;
    const ma = sum / period;
    let variance = 0;
    for (let j = 0; j < period; j++) variance += (candles[i - j].close - ma) ** 2;
    const std = Math.sqrt(variance / period);
    upper.push({ time: candles[i].time, value: ma + 2 * std });
    lower.push({ time: candles[i].time, value: ma - 2 * std });
  }
  chart.addLineSeries({ color: 'rgba(156,39,176,0.4)', lineWidth: 1, priceLineVisible: false }).setData(upper);
  chart.addLineSeries({ color: 'rgba(156,39,176,0.4)', lineWidth: 1, priceLineVisible: false }).setData(lower);
}
