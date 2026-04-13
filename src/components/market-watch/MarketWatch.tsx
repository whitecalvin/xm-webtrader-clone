'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useMarketStore } from '@/store/marketStore';
import { SymbolRow } from './SymbolRow';
import { clsx } from 'clsx';

const CATEGORIES = ['all', 'forex', 'metals', 'energies', 'indices', 'stocks', 'crypto'] as const;
const CATEGORY_MAP: Record<string, string> = {
  all: 'all',
  forex: 'Forex',
  metals: 'Metals',
  energies: 'Energies',
  indices: 'Indices',
  stocks: 'Stocks',
  crypto: 'Crypto',
};

export function MarketWatch() {
  const t = useTranslations('market');
  const {
    symbols,
    watchlist,
    favorites,
    selectedSymbol,
    searchQuery,
    activeCategory,
    setSelectedSymbol,
    toggleFavorite,
    setSearchQuery,
    setActiveCategory,
  } = useMarketStore();

  const [activeTab, setActiveTab] = useState<'watchlist' | 'all'>('watchlist');

  const displaySymbols = useMemo(() => {
    let list = activeTab === 'watchlist'
      ? symbols.filter((s) => watchlist.includes(s.symbol))
      : symbols;

    if (activeCategory !== 'all') {
      list = list.filter((s) => s.category === CATEGORY_MAP[activeCategory]);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // 즐겨찾기를 위로
    return [...list].sort((a, b) => {
      const aFav = favorites.includes(a.symbol) ? 0 : 1;
      const bFav = favorites.includes(b.symbol) ? 0 : 1;
      return aFav - bFav;
    });
  }, [symbols, watchlist, favorites, activeTab, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-surface-2">
      {/* 검색 */}
      <div className="p-2 border-b border-border-default">
        <div className="flex items-center gap-1.5 px-2 h-7 bg-surface-3 rounded border border-border-default focus-within:border-xm-primary transition-colors">
          <span className="text-text-muted text-xs">🔍</span>
          <input
            type="text"
            placeholder={t('searchSymbol')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-xs bg-transparent text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* 탭: 관심 종목 / 전체 */}
      <div className="flex border-b border-border-default">
        {(['watchlist', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'flex-1 text-xs py-1.5 transition-colors',
              activeTab === tab
                ? 'text-text-primary border-b-2 border-xm-primary'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {tab === 'watchlist' ? t('watchlist') : t('categories.all')}
          </button>
        ))}
      </div>

      {/* 카테고리 필터 (전체 탭에서만) */}
      {activeTab === 'all' && (
        <div className="flex gap-1 px-2 py-1.5 overflow-x-auto border-b border-border-default">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'px-2 py-0.5 rounded text-xs whitespace-nowrap flex-shrink-0 transition-colors',
                activeCategory === cat
                  ? 'bg-xm-primary text-white'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-4'
              )}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>
      )}

      {/* 헤더 */}
      <div className="flex px-2 py-1 text-xs text-text-muted border-b border-border-muted">
        <div className="flex-1">{t('symbol')}</div>
        <div className="flex gap-2">
          <span className="w-16 text-center text-trade-sell">{t('bid')}</span>
          <span className="w-16 text-center text-trade-buy">{t('ask')}</span>
        </div>
      </div>

      {/* 심볼 목록 */}
      <div className="flex-1 overflow-y-auto">
        {displaySymbols.length === 0 ? (
          <div className="text-center text-text-muted text-xs py-8">
            {searchQuery ? '검색 결과 없음' : '심볼 없음'}
          </div>
        ) : (
          displaySymbols.map((sym) => (
            <SymbolRow
              key={sym.symbol}
              symbol={sym.symbol}
              digits={sym.digits}
              description={sym.description}
              isFavorite={favorites.includes(sym.symbol)}
              isSelected={selectedSymbol === sym.symbol}
              onSelect={setSelectedSymbol}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}
      </div>
    </div>
  );
}
