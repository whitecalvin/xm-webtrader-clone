'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/uiStore';
import { useMarketStore } from '@/store/marketStore';
import { clsx } from 'clsx';
import type { Timeframe } from '@/types/mt5';

const TIMEFRAMES: Timeframe[] = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1', 'W1', 'MN'];

interface ChartToolbarProps {
  symbol: string;
}

export function ChartToolbar({ symbol }: ChartToolbarProps) {
  const t = useTranslations('chart');
  const { chartTimeframe, setChartTimeframe } = useUIStore();
  const tick = useMarketStore((s) => s.ticks[symbol]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-2 border-b border-border-default">
      {/* 심볼 이름 + 현재 가격 */}
      <div className="flex items-center gap-3 mr-2">
        <span className="text-sm font-bold text-text-primary">{symbol}</span>
        {tick && (
          <div className="flex gap-2 text-xs font-mono">
            <span className="text-trade-sell">{tick.bid.toFixed(5)}</span>
            <span className="text-text-muted">/</span>
            <span className="text-trade-buy">{tick.ask.toFixed(5)}</span>
          </div>
        )}
      </div>

      {/* 타임프레임 버튼 */}
      <div className="flex gap-0.5">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => setChartTimeframe(tf)}
            className={clsx(
              'px-2 py-0.5 text-xs rounded transition-colors',
              chartTimeframe === tf
                ? 'bg-xm-primary text-white'
                : 'text-text-muted hover:text-text-secondary hover:bg-surface-4'
            )}
          >
            {t(`timeframes.${tf}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
