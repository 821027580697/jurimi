'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickData, HistogramData, Time } from 'lightweight-charts';

interface ChartProps {
  symbol: string;
  isKorean?: boolean;
}

function generateCandleData(basePrice: number, days: number): {
  candles: CandlestickData<Time>[];
  volumes: HistogramData<Time>[];
} {
  const candles: CandlestickData<Time>[] = [];
  const volumes: HistogramData<Time>[] = [];
  let price = basePrice * 0.7;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const volatility = 0.03;
    const trend = 0.001;
    const open = price;
    const change = (Math.random() - 0.48 + trend) * volatility * price;
    const close = open + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.015);
    const low = Math.min(open, close) * (1 - Math.random() * 0.015);
    price = close;

    const time = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` as Time;

    candles.push({ time, open, high, low, close });
    volumes.push({
      time,
      value: Math.floor(Math.random() * 5000000 + 500000),
      color: close >= open ? 'rgba(255, 45, 45, 0.3)' : 'rgba(45, 108, 255, 0.3)',
    });
  }

  return { candles, volumes };
}

export default function Chart({ symbol, isKorean }: ChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const [period, setPeriod] = useState('1Y');
  const [showMA, setShowMA] = useState(true);
  const [showBB, setShowBB] = useState(true);
  const [showVol, setShowVol] = useState(true);

  const periodDays: Record<string, number> = { '1D': 1, '1W': 7, '1M': 30, '3M': 90, '1Y': 365 };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!chartRef.current) return;

    chartRef.current.innerHTML = '';

    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333333',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#e5e5e5' },
      timeScale: { borderColor: '#e5e5e5', timeVisible: false },
    });

    chartInstance.current = chart;

    const basePrice = isKorean ? 14655 : 238.16;
    const days = periodDays[period] || 365;
    const { candles, volumes } = generateCandleData(basePrice, days);

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#ffffff',
      downColor: '#2D6CFF',
      borderUpColor: '#FF2D2D',
      borderDownColor: '#2D6CFF',
      wickUpColor: '#FF2D2D',
      wickDownColor: '#2D6CFF',
    });
    candleSeries.setData(candles);

    if (showMA && candles.length > 20) {
      const ma5 = calculateMA(candles, 5);
      const ma20 = calculateMA(candles, 20);
      const ma60 = calculateMA(candles, 60);

      const ma5Series = chart.addLineSeries({ color: '#FF2D2D', lineWidth: 1, priceLineVisible: false });
      ma5Series.setData(ma5);

      const ma20Series = chart.addLineSeries({ color: '#2D6CFF', lineWidth: 1, priceLineVisible: false });
      ma20Series.setData(ma20);

      if (ma60.length > 0) {
        const ma60Series = chart.addLineSeries({ color: '#00C176', lineWidth: 1, priceLineVisible: false });
        ma60Series.setData(ma60);
      }
    }

    if (showBB && candles.length > 20) {
      const bb = calculateBB(candles, 20);
      const bbUpper = chart.addLineSeries({
        color: 'rgba(156, 39, 176, 0.4)', lineWidth: 1, priceLineVisible: false,
      });
      bbUpper.setData(bb.upper);

      const bbLower = chart.addLineSeries({
        color: 'rgba(156, 39, 176, 0.4)', lineWidth: 1, priceLineVisible: false,
      });
      bbLower.setData(bb.lower);
    }

    if (showVol) {
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: { type: 'volume' },
        priceScaleId: 'volume',
      });
      volumeSeries.setData(volumes);
      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartRef.current) {
        chart.applyOptions({ width: chartRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol, period, showMA, showBB, showVol, isKorean]);

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {Object.keys(periodDays).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1 text-xs rounded-full font-bold ${
              period === p ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {p === '1D' ? '1일' : p === '1W' ? '1주' : p === '1M' ? '1월' : p === '3M' ? '3월' : '1년'}
          </button>
        ))}
      </div>
      <div ref={chartRef} className="w-full rounded-lg overflow-hidden border border-gray-100" />
      <div className="flex gap-2 mt-2">
        <button
          onClick={() => setShowMA(!showMA)}
          className={`text-[11px] px-2 py-1 rounded ${showMA ? 'bg-black text-white' : 'bg-gray-100'}`}
        >
          {showMA ? '✅' : '⬜'} 이평선
        </button>
        <button
          onClick={() => setShowBB(!showBB)}
          className={`text-[11px] px-2 py-1 rounded ${showBB ? 'bg-black text-white' : 'bg-gray-100'}`}
        >
          {showBB ? '✅' : '⬜'} 볼린저
        </button>
        <button
          onClick={() => setShowVol(!showVol)}
          className={`text-[11px] px-2 py-1 rounded ${showVol ? 'bg-black text-white' : 'bg-gray-100'}`}
        >
          {showVol ? '✅' : '⬜'} 거래량
        </button>
      </div>
    </div>
  );
}

function calculateMA(
  candles: CandlestickData<Time>[],
  period: number
): { time: Time; value: number }[] {
  const result: { time: Time; value: number }[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    result.push({ time: candles[i].time, value: sum / period });
  }
  return result;
}

function calculateBB(
  candles: CandlestickData<Time>[],
  period: number
): { upper: { time: Time; value: number }[]; lower: { time: Time; value: number }[] } {
  const upper: { time: Time; value: number }[] = [];
  const lower: { time: Time; value: number }[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    const ma = sum / period;
    let variance = 0;
    for (let j = 0; j < period; j++) {
      variance += Math.pow(candles[i - j].close - ma, 2);
    }
    const std = Math.sqrt(variance / period);
    upper.push({ time: candles[i].time, value: ma + 2 * std });
    lower.push({ time: candles[i].time, value: ma - 2 * std });
  }

  return { upper, lower };
}
