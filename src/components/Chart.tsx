'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, LineData, Time, LogicalRange, Logical } from 'lightweight-charts';
import { fetchSmartCandles, CandleData } from '@/lib/api';
import { calcRSISeries, calcMACDSeries, calcStochasticSeries } from '@/lib/indicators';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChartProps {
  symbol: string;
  isKorean?: boolean;
  onCandlesLoaded?: (data: CandleData) => void;
}

type Resolution = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M';
type SubIndicator = 'RSI' | 'MACD' | 'Stochastic';
type DrawingTool = 'horizontal' | 'trendline' | 'rectangle' | 'text' | 'pen' | null;

interface Drawing {
  type: 'horizontal' | 'trendline' | 'rectangle' | 'text' | 'pen';
  // Coordinates stored in logical (index) and price space
  points: { logicalIdx: number; price: number }[];
  text?: string;
  penPath?: { logicalIdx: number; price: number }[];
}

// ─── Constants ──────────────────────────────────────────────────────────────

const RESOLUTIONS: { label: string; value: Resolution }[] = [
  { label: '1분', value: '1' },
  { label: '5분', value: '5' },
  { label: '15분', value: '15' },
  { label: '30분', value: '30' },
  { label: '1시간', value: '60' },
  { label: '일', value: 'D' },
  { label: '주', value: 'W' },
  { label: '월', value: 'M' },
];

const RESOLUTION_DAYS: Record<Resolution, number> = {
  '1': 1, '5': 3, '15': 7, '30': 14, '60': 30, 'D': 365, 'W': 730, 'M': 1825,
};

const DRAWING_TOOLS: { label: string; value: DrawingTool }[] = [
  { label: '수평선', value: 'horizontal' },
  { label: '추세선', value: 'trendline' },
  { label: '사각형', value: 'rectangle' },
  { label: '텍스트', value: 'text' },
  { label: '펜', value: 'pen' },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function tsToTime(ts: number, resolution: Resolution): Time {
  const d = new Date(ts * 1000);
  if (['D', 'W', 'M'].includes(resolution)) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` as Time;
  }
  return ts as unknown as Time;
}

function generateFallbackCandles(basePrice: number, days: number, resolution: Resolution): CandleData {
  const c: number[] = [], h: number[] = [], l: number[] = [], o: number[] = [], t: number[] = [], v: number[] = [];
  let price = basePrice * 0.7;
  const now = Math.floor(Date.now() / 1000);
  const interval = ['D', 'W', 'M'].includes(resolution) ? 86400 : parseInt(resolution === '60' ? '60' : resolution) * 60;
  const count = Math.floor((days * 86400) / interval);
  for (let i = count; i >= 0; i--) {
    const ts = now - i * interval;
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

function addMA(chart: IChartApi, candles: CandlestickData<Time>[], period: number, color: string) {
  const data: LineData<Time>[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) sum += candles[i - j].close;
    data.push({ time: candles[i].time, value: sum / period });
  }
  const series = chart.addLineSeries({ color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false });
  series.setData(data);
}

function addBB(chart: IChartApi, candles: CandlestickData<Time>[], period: number) {
  const upper: LineData<Time>[] = [];
  const lower: LineData<Time>[] = [];
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
  chart.addLineSeries({ color: 'rgba(156,39,176,0.4)', lineWidth: 1, priceLineVisible: false, lastValueVisible: false }).setData(upper);
  chart.addLineSeries({ color: 'rgba(156,39,176,0.4)', lineWidth: 1, priceLineVisible: false, lastValueVisible: false }).setData(lower);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function Chart({ symbol, isKorean, onCandlesLoaded }: ChartProps) {
  const mainChartRef = useRef<HTMLDivElement>(null);
  const subChartRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const mainChartInstance = useRef<IChartApi | null>(null);
  const subChartInstance = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  const [resolution, setResolution] = useState<Resolution>('D');
  const [showMA, setShowMA] = useState(true);
  const [showBB, setShowBB] = useState(false);
  const [showVol, setShowVol] = useState(true);
  const [subIndicator, setSubIndicator] = useState<SubIndicator>('RSI');
  const [rawCandles, setRawCandles] = useState<CandleData | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Drawing state
  const [activeTool, setActiveTool] = useState<DrawingTool>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const drawingInProgress = useRef<Drawing | null>(null);
  const isDrawing = useRef(false);

  // ─── Data Fetching ──────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const days = RESOLUTION_DAYS[resolution];
      const data = await fetchSmartCandles(symbol, !isKorean, resolution, days);
      if (cancelled) return;
      if (data) {
        setRawCandles(data);
        setIsLive(true);
        onCandlesLoaded?.(data);
      } else {
        const fb = generateFallbackCandles(isKorean ? 50000 : 150, days, resolution);
        setRawCandles(fb);
        setIsLive(false);
        onCandlesLoaded?.(fb);
      }
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, isKorean, resolution]);

  // ─── Drawing Canvas ─────────────────────────────────────────────────────

  const redrawCanvas = useCallback(() => {
    const canvas = drawCanvasRef.current;
    const chart = mainChartInstance.current;
    const series = candleSeriesRef.current;
    if (!canvas || !chart || !series) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const timeScale = chart.timeScale();

    for (const drawing of [...drawings, ...(drawingInProgress.current ? [drawingInProgress.current] : [])]) {
      ctx.strokeStyle = '#FF6B00';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(255, 107, 0, 0.1)';
      ctx.font = '12px sans-serif';

      if (drawing.type === 'horizontal' && drawing.points.length >= 1) {
        const y = series.priceToCoordinate(drawing.points[0].price);
        if (y !== null) {
          ctx.beginPath();
          ctx.setLineDash([5, 3]);
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = '#FF6B00';
          ctx.fillText(drawing.points[0].price.toFixed(2), 5, y - 5);
        }
      } else if (drawing.type === 'trendline' && drawing.points.length >= 2) {
        const x1 = timeScale.logicalToCoordinate(drawing.points[0].logicalIdx as unknown as Logical);
        const y1 = series.priceToCoordinate(drawing.points[0].price);
        const x2 = timeScale.logicalToCoordinate(drawing.points[1].logicalIdx as unknown as Logical);
        const y2 = series.priceToCoordinate(drawing.points[1].price);
        if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      } else if (drawing.type === 'rectangle' && drawing.points.length >= 2) {
        const x1 = timeScale.logicalToCoordinate(drawing.points[0].logicalIdx as unknown as Logical);
        const y1 = series.priceToCoordinate(drawing.points[0].price);
        const x2 = timeScale.logicalToCoordinate(drawing.points[1].logicalIdx as unknown as Logical);
        const y2 = series.priceToCoordinate(drawing.points[1].price);
        if (x1 !== null && y1 !== null && x2 !== null && y2 !== null) {
          ctx.fillStyle = 'rgba(255, 107, 0, 0.1)';
          ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
          ctx.strokeRect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
        }
      } else if (drawing.type === 'text' && drawing.points.length >= 1 && drawing.text) {
        const x = timeScale.logicalToCoordinate(drawing.points[0].logicalIdx as unknown as Logical);
        const y = series.priceToCoordinate(drawing.points[0].price);
        if (x !== null && y !== null) {
          ctx.fillStyle = '#FF6B00';
          ctx.font = '14px sans-serif';
          ctx.fillText(drawing.text, x, y);
        }
      } else if (drawing.type === 'pen' && drawing.penPath && drawing.penPath.length > 1) {
        ctx.beginPath();
        const firstX = timeScale.logicalToCoordinate(drawing.penPath[0].logicalIdx as unknown as Logical);
        const firstY = series.priceToCoordinate(drawing.penPath[0].price);
        if (firstX !== null && firstY !== null) {
          ctx.moveTo(firstX, firstY);
          for (let i = 1; i < drawing.penPath.length; i++) {
            const px = timeScale.logicalToCoordinate(drawing.penPath[i].logicalIdx as unknown as Logical);
            const py = series.priceToCoordinate(drawing.penPath[i].price);
            if (px !== null && py !== null) ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }
    }
  }, [drawings]);

  // ─── Main Chart ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!mainChartRef.current || !rawCandles || rawCandles.c.length === 0) return;
    mainChartRef.current.innerHTML = '';

    const chart = createChart(mainChartRef.current, {
      width: mainChartRef.current.clientWidth,
      height: 340,
      layout: { background: { color: '#ffffff' }, textColor: '#333', fontSize: 11 },
      grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#e5e5e5' },
      timeScale: { borderColor: '#e5e5e5', timeVisible: !['D', 'W', 'M'].includes(resolution) },
    });
    mainChartInstance.current = chart;

    const candles: CandlestickData<Time>[] = rawCandles.t.map((ts, i) => ({
      time: tsToTime(ts, resolution),
      open: rawCandles.o[i],
      high: rawCandles.h[i],
      low: rawCandles.l[i],
      close: rawCandles.c[i],
    }));

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#ffffff',
      downColor: '#2D6CFF',
      borderUpColor: '#FF2D2D',
      borderDownColor: '#2D6CFF',
      wickUpColor: '#FF2D2D',
      wickDownColor: '#2D6CFF',
    });
    candleSeries.setData(candles);
    candleSeriesRef.current = candleSeries;

    // MA
    if (showMA && candles.length > 5) {
      addMA(chart, candles, 5, '#FF2D2D');
      if (candles.length > 20) addMA(chart, candles, 20, '#2D6CFF');
      if (candles.length > 60) addMA(chart, candles, 60, '#00C176');
    }

    // Bollinger Bands
    if (showBB && candles.length > 20) {
      addBB(chart, candles, 20);
    }

    // Volume
    if (showVol) {
      const volumes: HistogramData<Time>[] = rawCandles.t.map((ts, i) => ({
        time: tsToTime(ts, resolution),
        value: rawCandles.v[i],
        color: rawCandles.c[i] >= rawCandles.o[i] ? 'rgba(255,45,45,0.3)' : 'rgba(45,108,255,0.3)',
      }));
      const volSeries = chart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: 'volume' });
      volSeries.setData(volumes);
      chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.8, bottom: 0 } });
    }

    chart.timeScale().fitContent();

    // Subscribe to range change for drawing redraw
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      redrawCanvas();
    });

    const handleResize = () => {
      if (mainChartRef.current) {
        chart.applyOptions({ width: mainChartRef.current.clientWidth });
        // Resize drawing canvas
        if (drawCanvasRef.current) {
          drawCanvasRef.current.width = mainChartRef.current.clientWidth;
          drawCanvasRef.current.height = 340;
          redrawCanvas();
        }
      }
    };
    window.addEventListener('resize', handleResize);

    // Set canvas size
    if (drawCanvasRef.current && mainChartRef.current) {
      drawCanvasRef.current.width = mainChartRef.current.clientWidth;
      drawCanvasRef.current.height = 340;
      redrawCanvas();
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      mainChartInstance.current = null;
      candleSeriesRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawCandles, showMA, showBB, showVol, resolution]);

  // ─── Sub Chart (Oscillator) ─────────────────────────────────────────────

  useEffect(() => {
    if (!subChartRef.current || !rawCandles || rawCandles.c.length === 0) return;
    subChartRef.current.innerHTML = '';

    const chart = createChart(subChartRef.current, {
      width: subChartRef.current.clientWidth,
      height: 150,
      layout: { background: { color: '#ffffff' }, textColor: '#333', fontSize: 10 },
      grid: { vertLines: { color: '#f8f8f8' }, horzLines: { color: '#f0f0f0' } },
      crosshair: { mode: 0 },
      rightPriceScale: { borderColor: '#e5e5e5' },
      timeScale: { borderColor: '#e5e5e5', timeVisible: !['D', 'W', 'M'].includes(resolution), visible: false },
    });
    subChartInstance.current = chart;

    const times = rawCandles.t.map(ts => tsToTime(ts, resolution));

    if (subIndicator === 'RSI') {
      const rsiData = calcRSISeries(rawCandles.c, 14);
      const offset = rawCandles.c.length - rsiData.length;
      const rsiLine: LineData<Time>[] = [];
      for (let i = 0; i < rsiData.length; i++) {
        if (!isNaN(rsiData[i])) {
          rsiLine.push({ time: times[i + offset], value: rsiData[i] });
        }
      }
      const series = chart.addLineSeries({ color: '#8B5CF6', lineWidth: 2, priceLineVisible: false, lastValueVisible: false });
      series.setData(rsiLine);

      // 70/30 reference lines
      const refLine70: LineData<Time>[] = times.map(t => ({ time: t, value: 70 }));
      const refLine30: LineData<Time>[] = times.map(t => ({ time: t, value: 30 }));
      chart.addLineSeries({ color: 'rgba(255,0,0,0.3)', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false }).setData(refLine70);
      chart.addLineSeries({ color: 'rgba(0,128,0,0.3)', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false }).setData(refLine30);

      chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.05, bottom: 0.05 } });
    } else if (subIndicator === 'MACD') {
      const macdResult = calcMACDSeries(rawCandles.c);
      if (macdResult) {
        const { macdLine, signalLine, histogram, offset } = macdResult;
        const macdData: LineData<Time>[] = [];
        const signalData: LineData<Time>[] = [];
        const histData: HistogramData<Time>[] = [];

        for (let i = 0; i < macdLine.length; i++) {
          const time = times[i + offset];
          macdData.push({ time, value: macdLine[i] });
          signalData.push({ time, value: signalLine[i] });
          histData.push({ time, value: histogram[i], color: histogram[i] >= 0 ? 'rgba(255,45,45,0.5)' : 'rgba(45,108,255,0.5)' });
        }

        chart.addHistogramSeries({ priceLineVisible: false, lastValueVisible: false, priceFormat: { type: 'price', precision: 4, minMove: 0.0001 } }).setData(histData);
        chart.addLineSeries({ color: '#2196F3', lineWidth: 2, priceLineVisible: false, lastValueVisible: false }).setData(macdData);
        chart.addLineSeries({ color: '#FF9800', lineWidth: 2, priceLineVisible: false, lastValueVisible: false }).setData(signalData);
      }
    } else if (subIndicator === 'Stochastic') {
      const stochResult = calcStochasticSeries(rawCandles.h, rawCandles.l, rawCandles.c, 14, 3);
      if (stochResult) {
        const { k, d, offset } = stochResult;
        const kData: LineData<Time>[] = [];
        const dData: LineData<Time>[] = [];
        for (let i = 0; i < k.length; i++) {
          kData.push({ time: times[i + offset], value: k[i] });
          dData.push({ time: times[i + offset], value: d[i] });
        }
        chart.addLineSeries({ color: '#2196F3', lineWidth: 2, priceLineVisible: false, lastValueVisible: false }).setData(kData);
        chart.addLineSeries({ color: '#FF9800', lineWidth: 2, priceLineVisible: false, lastValueVisible: false }).setData(dData);

        // 80/20 reference lines
        const refLine80: LineData<Time>[] = times.map(t => ({ time: t, value: 80 }));
        const refLine20: LineData<Time>[] = times.map(t => ({ time: t, value: 20 }));
        chart.addLineSeries({ color: 'rgba(255,0,0,0.3)', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false }).setData(refLine80);
        chart.addLineSeries({ color: 'rgba(0,128,0,0.3)', lineWidth: 1, lineStyle: 2, priceLineVisible: false, lastValueVisible: false }).setData(refLine20);
      }
    }

    chart.timeScale().fitContent();

    // Sync time scales
    const mainChart = mainChartInstance.current;
    if (mainChart) {
      mainChart.timeScale().subscribeVisibleLogicalRangeChange((range: LogicalRange | null) => {
        if (range) {
          chart.timeScale().setVisibleLogicalRange(range);
        }
      });
      chart.timeScale().subscribeVisibleLogicalRangeChange((range: LogicalRange | null) => {
        if (range && mainChart) {
          mainChart.timeScale().setVisibleLogicalRange(range);
        }
      });
    }

    const handleResize = () => {
      if (subChartRef.current) chart.applyOptions({ width: subChartRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      subChartInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawCandles, subIndicator, resolution]);

  // ─── Drawing Event Handlers ─────────────────────────────────────────────

  const getLogicalAndPrice = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    const chart = mainChartInstance.current;
    const series = candleSeriesRef.current;
    if (!canvas || !chart || !series) return null;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const logicalIdx = chart.timeScale().coordinateToLogical(x);
    const price = series.coordinateToPrice(y);
    if (logicalIdx === null || price === null) return null;
    return { logicalIdx, price };
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    const point = getLogicalAndPrice(e);
    if (!point) return;

    if (activeTool === 'horizontal') {
      const drawing: Drawing = { type: 'horizontal', points: [point] };
      setDrawings(prev => [...prev, drawing]);
      setActiveTool(null);
    } else if (activeTool === 'trendline' || activeTool === 'rectangle') {
      drawingInProgress.current = { type: activeTool, points: [point] };
      isDrawing.current = true;
    } else if (activeTool === 'text') {
      const text = window.prompt('텍스트를 입력하세요:');
      if (text) {
        const drawing: Drawing = { type: 'text', points: [point], text };
        setDrawings(prev => [...prev, drawing]);
      }
      setActiveTool(null);
    } else if (activeTool === 'pen') {
      drawingInProgress.current = { type: 'pen', points: [point], penPath: [point] };
      isDrawing.current = true;
    }
  }, [activeTool, getLogicalAndPrice]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !drawingInProgress.current) return;
    const point = getLogicalAndPrice(e);
    if (!point) return;

    if (drawingInProgress.current.type === 'trendline' || drawingInProgress.current.type === 'rectangle') {
      drawingInProgress.current.points[1] = point;
    } else if (drawingInProgress.current.type === 'pen' && drawingInProgress.current.penPath) {
      drawingInProgress.current.penPath.push(point);
    }
    redrawCanvas();
  }, [getLogicalAndPrice, redrawCanvas]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!isDrawing.current || !drawingInProgress.current) return;
    isDrawing.current = false;

    if (drawingInProgress.current.type === 'trendline' || drawingInProgress.current.type === 'rectangle') {
      if (drawingInProgress.current.points.length >= 2) {
        setDrawings(prev => [...prev, drawingInProgress.current!]);
      }
    } else if (drawingInProgress.current.type === 'pen') {
      if (drawingInProgress.current.penPath && drawingInProgress.current.penPath.length > 1) {
        setDrawings(prev => [...prev, drawingInProgress.current!]);
      }
    }
    drawingInProgress.current = null;
    redrawCanvas();
  }, [redrawCanvas]);

  // Redraw when drawings change
  useEffect(() => {
    redrawCanvas();
  }, [drawings, redrawCanvas]);

  // ─── Clear drawings ─────────────────────────────────────────────────────

  const clearDrawings = useCallback(() => {
    setDrawings([]);
    drawingInProgress.current = null;
    redrawCanvas();
  }, [redrawCanvas]);

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="w-full h-[500px] bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-400 animate-pulse">
        차트 로딩 중...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Resolution selector + live badge */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {RESOLUTIONS.map(r => (
            <button
              key={r.value}
              onClick={() => setResolution(r.value)}
              className={`px-2.5 py-1 text-[11px] rounded-full font-bold transition-colors ${
                resolution === r.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {isLive ? (
          <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
        ) : (
          <span className="text-[9px] font-bold bg-gray-300 text-white px-1.5 py-0.5 rounded">참고용</span>
        )}
      </div>

      {/* Indicator toggles */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setShowMA(!showMA)}
          className={`text-[11px] px-2 py-1 rounded transition-colors ${showMA ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          MA 이평선
        </button>
        <button onClick={() => setShowBB(!showBB)}
          className={`text-[11px] px-2 py-1 rounded transition-colors ${showBB ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          BB 볼린저밴드
        </button>
        <button onClick={() => setShowVol(!showVol)}
          className={`text-[11px] px-2 py-1 rounded transition-colors ${showVol ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
          Vol 거래량
        </button>
      </div>

      {/* Drawing toolbar */}
      <div className="flex gap-1 flex-wrap items-center">
        <span className="text-[10px] text-gray-500 mr-1">그리기:</span>
        {DRAWING_TOOLS.map(tool => (
          <button
            key={tool.value}
            onClick={() => setActiveTool(activeTool === tool.value ? null : tool.value)}
            className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
              activeTool === tool.value ? 'bg-orange-500 text-white border-orange-500' : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
          >
            {tool.label}
          </button>
        ))}
        <button
          onClick={clearDrawings}
          className="text-[10px] px-2 py-0.5 rounded border border-red-300 text-red-500 hover:bg-red-50 transition-colors"
        >
          지우기
        </button>
      </div>

      {/* Main chart with drawing canvas overlay */}
      <div className="relative">
        <div ref={mainChartRef} className="w-full rounded-lg overflow-hidden border border-gray-100" />
        <canvas
          ref={drawCanvasRef}
          className="absolute top-0 left-0 rounded-lg"
          style={{ pointerEvents: activeTool ? 'auto' : 'none', cursor: activeTool ? 'crosshair' : 'default' }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Sub indicator selector */}
      <div className="flex gap-1 items-center">
        <span className="text-[10px] text-gray-500 mr-1">보조지표:</span>
        {(['RSI', 'MACD', 'Stochastic'] as SubIndicator[]).map(ind => (
          <button
            key={ind}
            onClick={() => setSubIndicator(ind)}
            className={`text-[11px] px-2.5 py-1 rounded-full font-bold transition-colors ${
              subIndicator === ind ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Sub chart */}
      <div ref={subChartRef} className="w-full rounded-lg overflow-hidden border border-gray-100" />
    </div>
  );
}
