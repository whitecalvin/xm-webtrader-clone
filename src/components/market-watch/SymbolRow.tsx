'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useMarketStore } from '@/store/marketStore';
import { formatPriceParts } from '@/lib/utils/formatting';
import { clsx } from 'clsx';

interface SymbolRowProps {
  symbol: string;
  digits: number;
  description: string;
  isFavorite: boolean;
  isSelected: boolean;
  onSelect: (symbol: string) => void;
  onToggleFavorite: (symbol: string) => void;
}

export const SymbolRow = memo(function SymbolRow({
  symbol,
  digits,
  description,
  isFavorite,
  isSelected,
  onSelect,
  onToggleFavorite,
}: SymbolRowProps) {
  const tick = useMarketStore((s) => s.ticks[symbol]);
  const { setOrderPanelSymbol, setOrderDirection } = useUIStore();
  const prevBidRef = useRef(tick?.bid ?? 0);
  const [bidFlash, setBidFlash] = useState<'up' | 'down' | null>(null);
  const [askFlash, setAskFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (!tick) return;
    if (prevBidRef.current !== 0 && tick.bid !== prevBidRef.current) {
      const isUp = tick.bid > prevBidRef.current;
      setBidFlash(isUp ? 'up' : 'down');
      setAskFlash(isUp ? 'up' : 'down');
      const timer = setTimeout(() => {
        setBidFlash(null);
        setAskFlash(null);
      }, 400);
      prevBidRef.current = tick.bid;
      return () => clearTimeout(timer);
    }
    prevBidRef.current = tick.bid;
  }, [tick?.bid]);

  const bid = tick?.bid ?? 0;
  const ask = tick?.ask ?? 0;
  const bidParts = formatPriceParts(bid, digits);
  const askParts = formatPriceParts(ask, digits);
  const spread = bid > 0 ? Math.round((ask - bid) * Math.pow(10, digits)) : 0;

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderPanelSymbol(symbol);
    setOrderDirection('BUY');
  };

  const handleSellClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOrderPanelSymbol(symbol);
    setOrderDirection('SELL');
  };

  return (
    <div
      className={clsx(
        'group flex items-center px-2 py-1.5 cursor-pointer transition-colors border-b border-border-muted',
        isSelected
          ? 'bg-surface-4 border-l-2 border-l-xm-primary'
          : 'hover:bg-surface-3'
      )}
      onClick={() => onSelect(symbol)}
    >
      {/* 즐겨찾기 */}
      <button
        className={clsx(
          'mr-1.5 text-xs transition-colors flex-shrink-0',
          isFavorite ? 'text-xm-accent' : 'text-text-muted opacity-0 group-hover:opacity-100'
        )}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(symbol); }}
      >
        ★
      </button>

      {/* 심볼 이름 */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-text-primary">{symbol}</div>
      </div>

      {/* Bid / Ask 가격 */}
      <div className="flex gap-2 text-xs font-mono">
        <button
          onClick={handleSellClick}
          className={clsx(
            'px-1.5 py-0.5 rounded text-trade-sell hover:bg-red-500/20 transition-colors',
            bidFlash === 'up' ? 'flash-up' : bidFlash === 'down' ? 'flash-down' : ''
          )}
          title="매도"
        >
          <span>{bidParts.main}</span>
          <span className="text-sm font-bold">{bidParts.pip}</span>
        </button>

        <button
          onClick={handleBuyClick}
          className={clsx(
            'px-1.5 py-0.5 rounded text-trade-buy hover:bg-green-500/20 transition-colors',
            askFlash === 'up' ? 'flash-up' : askFlash === 'down' ? 'flash-down' : ''
          )}
          title="매수"
        >
          <span>{askParts.main}</span>
          <span className="text-sm font-bold">{askParts.pip}</span>
        </button>
      </div>
    </div>
  );
});
