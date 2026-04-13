'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
  ColorType,
} from 'lightweight-charts';
import { useMarketStore } from '@/store/marketStore';
import { useUIStore } from '@/store/uiStore';
import { ChartToolbar } from './ChartToolbar';
import type { Timeframe } from '@/types/mt5';

const CHART_COLORS = {
  background: '#0d1117',
  text: '#8b949e',
  grid: '#21262d',
  border: '#30363d',
  upColor: '#26a69a',
  downColor: '#ef5350',
  wickUpColor: '#26a69a',
  wickDownColor: '#ef5350',
};

export function TradingChart() {
  const selectedSymbol = useMarketStore((s) => s.selectedSymbol);
  const tick = useMarketStore((s) => s.ticks[selectedSymbol]);
  const chartTimeframe = useUIStore((s) => s.chartTimeframe);

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lastCandleRef = useRef<CandlestickData<Time> | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const initChart = useCallback(() => {
    if (!containerRef.current) return;

    // 기존 차트 제거
    chartRef.current?.remove();

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: CHART_COLORS.background },
        textColor: CHART_COLORS.text,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: CHART_COLORS.grid },
        horzLines: { color: CHART_COLORS.grid },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.border,
      },
      timeScale: {
        borderColor: CHART_COLORS.border,
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    const series = chart.addCandlestickSeries({
      upColor: CHART_COLORS.upColor,
      downColor: CHART_COLORS.downColor,
      borderUpColor: CHART_COLORS.upColor,
      borderDownColor: CHART_COLORS.downColor,
      wickUpColor: CHART_COLORS.wickUpColor,
      wickDownColor: CHART_COLORS.wickDownColor,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // 샘플 캔들 데이터 생성 (Mock)
    loadMockCandles(series, selectedSymbol, chartTimeframe);
  }, [selectedSymbol, chartTimeframe]);

  // 차트 초기화
  useEffect(() => {
    initChart();

    // ResizeObserver 설정
    if (containerRef.current) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (chartRef.current && entry) {
          chartRef.current.resize(
            entry.contentRect.width,
            entry.contentRect.height
          );
        }
      });
      resizeObserverRef.current.observe(containerRef.current);
    }

    return () => {
      resizeObserverRef.current?.disconnect();
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [initChart]);

  // 실시간 틱 업데이트
  useEffect(() => {
    if (!tick || !seriesRef.current || !lastCandleRef.current) return;

    const now = Math.floor(Date.now() / 1000);
    const candleTime = getBarTime(now, chartTimeframe);

    if (lastCandleRef.current.time === candleTime) {
      // 현재 봉 업데이트
      const updatedCandle: CandlestickData<Time> = {
        ...lastCandleRef.current,
        high: Math.max(lastCandleRef.current.high as number, tick.bid),
        low: Math.min(lastCandleRef.current.low as number, tick.bid),
        close: tick.bid,
      };
      seriesRef.current.update(updatedCandle);
      lastCandleRef.current = updatedCandle;
    } else if (candleTime > (lastCandleRef.current.time as number)) {
      // 새 봉 생성
      const newCandle: CandlestickData<Time> = {
        time: candleTime as Time,
        open: tick.bid,
        high: tick.bid,
        low: tick.bid,
        close: tick.bid,
      };
      seriesRef.current.update(newCandle);
      lastCandleRef.current = newCandle;
    }
  }, [tick?.lastUpdated]);

  return (
    <div className="flex flex-col h-full bg-surface-1">
      <ChartToolbar symbol={selectedSymbol} />
      <div ref={containerRef} className="flex-1 min-h-0" />
    </div>
  );
}

function getBarTime(timestamp: number, timeframe: Timeframe): number {
  const tfSeconds: Record<Timeframe, number> = {
    M1: 60,
    M5: 300,
    M15: 900,
    M30: 1800,
    H1: 3600,
    H4: 14400,
    D1: 86400,
    W1: 604800,
    MN: 2592000,
  };
  const tf = tfSeconds[timeframe] ?? 3600;
  return Math.floor(timestamp / tf) * tf;
}

function loadMockCandles(
  series: ISeriesApi<'Candlestick'>,
  symbol: string,
  timeframe: Timeframe
) {
  const basePrices: Record<string, number> = {
    EURUSD: 1.08520,
    GBPUSD: 1.27150,
    USDJPY: 149.850,
    XAUUSD: 2024.50,
    US30: 38950.00,
    BTCUSD: 68500.00,
  };

  const basePrice = basePrices[symbol] ?? 1.0;
  const volatility = symbol === 'BTCUSD' ? 500 : symbol === 'US30' ? 50 : symbol === 'XAUUSD' ? 5 : symbol.includes('JPY') ? 0.2 : 0.005;
  const now = Math.floor(Date.now() / 1000);

  const tfSeconds: Record<Timeframe, number> = {
    M1: 60, M5: 300, M15: 900, M30: 1800,
    H1: 3600, H4: 14400, D1: 86400, W1: 604800, MN: 2592000,
  };
  const tf = tfSeconds[timeframe] ?? 3600;
  const count = 200;

  const candles: CandlestickData<Time>[] = [];
  let price = basePrice;

  for (let i = count; i >= 0; i--) {
    const time = (Math.floor(now / tf) - i) * tf;
    const open = price;
    const change = (Math.random() - 0.5) * volatility * 2;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;

    candles.push({
      time: time as Time,
      open: parseFloat(open.toFixed(5)),
      high: parseFloat(high.toFixed(5)),
      low: parseFloat(low.toFixed(5)),
      close: parseFloat(close.toFixed(5)),
    });

    price = close;
  }

  series.setData(candles);
  // 마지막 봉 저장
  if (candles.length > 0) {
    // 마지막 캔들을 lastCandleRef에 저장은 컴포넌트 내부에서 처리
  }
}
