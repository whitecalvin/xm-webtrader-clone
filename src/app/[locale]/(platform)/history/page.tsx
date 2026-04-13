'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiClient } from '@/lib/api/client';
import { useOrderStore } from '@/store/orderStore';
import { useAccountStore } from '@/store/accountStore';
import { formatDateTime } from '@/lib/utils/formatting';
import { clsx } from 'clsx';

export default function HistoryPage() {
  const t = useTranslations('history');
  const { history, isLoadingHistory, historyFrom, historyTo, setHistory, setLoadingHistory, setHistoryRange } = useOrderStore();
  const accountInfo = useAccountStore((s) => s.info);
  const [from, setFrom] = useState(historyFrom);
  const [to, setTo] = useState(historyTo);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await apiClient.get(`/mt5/history?from=${from}&to=${to}`);
      setHistory(res.data);
      setHistoryRange(from, to);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalProfit = history.reduce((sum, deal) => sum + deal.profit, 0);

  return (
    <div className="flex flex-col h-full p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-text-primary">{t('title')}</h1>

        {/* 날짜 필터 */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-2 py-1 text-xs rounded bg-surface-3 border border-border-default text-text-primary outline-none focus:border-xm-primary"
          />
          <span className="text-text-muted text-xs">~</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-2 py-1 text-xs rounded bg-surface-3 border border-border-default text-text-primary outline-none focus:border-xm-primary"
          />
          <button
            onClick={loadHistory}
            disabled={isLoadingHistory}
            className="px-3 py-1 text-xs rounded text-white font-medium disabled:opacity-70"
            style={{ backgroundColor: '#e63329' }}
          >
            {isLoadingHistory ? '조회 중...' : '조회'}
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="flex-1 overflow-auto bg-surface-2 rounded-lg border border-border-default">
        {history.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            {isLoadingHistory ? '로딩 중...' : t('noHistory')}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-3">
              <tr className="text-text-muted border-b border-border-default">
                {[t('ticket'), t('openTime'), t('closeTime'), t('symbol'), t('type'), t('volume'), t('openPrice'), t('closePrice'), t('commission'), t('swap'), t('profit')].map((h) => (
                  <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((deal) => {
                const isProfit = deal.profit >= 0;
                return (
                  <tr key={deal.ticket} className="border-b border-border-muted hover:bg-surface-3 transition-colors">
                    <td className="px-3 py-1.5 text-text-muted">{deal.ticket}</td>
                    <td className="px-3 py-1.5 text-text-secondary whitespace-nowrap">{formatDateTime(deal.openTime)}</td>
                    <td className="px-3 py-1.5 text-text-secondary whitespace-nowrap">{formatDateTime(deal.closeTime)}</td>
                    <td className="px-3 py-1.5 font-semibold text-text-primary">{deal.symbol}</td>
                    <td className={clsx('px-3 py-1.5 font-bold', deal.type === 'BUY' ? 'text-trade-buy' : 'text-trade-sell')}>
                      {deal.type === 'BUY' ? '매수' : '매도'}
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono">{deal.volume.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{deal.openPrice}</td>
                    <td className="px-3 py-1.5 text-right font-mono">{deal.closePrice}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-text-muted">{deal.commission.toFixed(2)}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-text-muted">{deal.swap.toFixed(2)}</td>
                    <td className={clsx('px-3 py-1.5 text-right font-mono font-semibold', isProfit ? 'text-trade-buy' : 'text-trade-sell')}>
                      {isProfit ? '+' : ''}{deal.profit.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 합계 */}
      {history.length > 0 && (
        <div className="flex justify-between items-center mt-3 px-2">
          <span className="text-sm text-text-muted">{t('totalProfit')}</span>
          <span className={clsx('font-mono font-bold', totalProfit >= 0 ? 'text-trade-buy' : 'text-trade-sell')}>
            {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} {accountInfo?.currency ?? 'USD'}
          </span>
        </div>
      )}
    </div>
  );
}
