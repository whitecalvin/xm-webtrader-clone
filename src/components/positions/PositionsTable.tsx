'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { usePositionStore } from '@/store/positionStore';
import { useMarketStore } from '@/store/marketStore';
import { useAccountStore } from '@/store/accountStore';
import { apiClient } from '@/lib/api/client';
import type { Position } from '@/types/mt5';
import { clsx } from 'clsx';

export function PositionsTable() {
  const t = useTranslations('positions');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const positions = usePositionStore((s) => s.positions);
  const removePosition = usePositionStore((s) => s.removePosition);
  const ticks = useMarketStore((s) => s.ticks);
  const symbols = useMarketStore((s) => s.symbols);
  const accountInfo = useAccountStore((s) => s.info);

  const getSymbolDigits = (symbol: string) =>
    symbols.find((s) => s.symbol === symbol)?.digits ?? 5;

  const getCurrentPrice = (position: Position) => {
    const tick = ticks[position.symbol];
    if (!tick) return position.openPrice;
    return position.type === 'BUY' ? tick.bid : tick.ask;
  };

  const calcProfit = (position: Position) => {
    const tick = ticks[position.symbol];
    if (!tick) return position.profit;
    const currentPrice = position.type === 'BUY' ? tick.bid : tick.ask;
    const symbolInfo = symbols.find((s) => s.symbol === position.symbol);
    if (!symbolInfo) return position.profit;
    const direction = position.type === 'BUY' ? 1 : -1;
    return direction * (currentPrice - position.openPrice) * position.volume * symbolInfo.contractSize;
  };

  const executeClose = async () => {
    if (!selectedPosition) return;
    setIsClosing(true);
    try {
      await apiClient.delete(`/mt5/orders?ticket=${selectedPosition.ticket}&type=position`);
      removePosition(selectedPosition.ticket);
      toast.success('포지션이 청산되었습니다');
      setSelectedPosition(null);
    } catch {
      toast.error('청산 실패');
    } finally {
      setIsClosing(false);
    }
  };

  const totalProfit = positions.reduce((sum, p) => sum + calcProfit(p), 0);

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        {t('noPositions')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-surface-2">
            <tr className="text-text-muted border-b border-border-default">
              <th className="px-2 py-1.5 text-left font-medium">{t('ticket')}</th>
              <th className="px-2 py-1.5 text-left font-medium">{t('symbol')}</th>
              <th className="px-2 py-1.5 text-left font-medium">{t('type')}</th>
              <th className="px-2 py-1.5 text-right font-medium">{t('volume')}</th>
              <th className="px-2 py-1.5 text-right font-medium">{t('openPrice')}</th>
              <th className="px-2 py-1.5 text-right font-medium">{t('currentPrice')}</th>
              <th className="px-2 py-1.5 text-right font-medium">{t('sl')}</th>
              <th className="px-2 py-1.5 text-right font-medium">{t('tp')}</th>
              <th className="px-2 py-1.5 text-right font-medium">{t('profit')}</th>
              <th className="px-2 py-1.5 text-center font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const profit = calcProfit(position);
              const isProfit = profit >= 0;
              const digits = getSymbolDigits(position.symbol);
              const currentPrice = getCurrentPrice(position);
              return (
                <tr
                  key={position.ticket}
                  className="border-b border-border-muted hover:bg-surface-3 transition-colors"
                >
                  <td className="px-2 py-1.5 text-text-muted">{position.ticket}</td>
                  <td className="px-2 py-1.5 font-semibold text-text-primary">{position.symbol}</td>
                  <td className={clsx('px-2 py-1.5 font-bold', position.type === 'BUY' ? 'text-trade-buy' : 'text-trade-sell')}>
                    {position.type === 'BUY' ? '매수' : '매도'}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono">{position.volume.toFixed(2)}</td>
                  <td className="px-2 py-1.5 text-right font-mono">{position.openPrice.toFixed(digits)}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-text-primary">{currentPrice.toFixed(digits)}</td>
                  <td className="px-2 py-1.5 text-right font-mono text-trade-sell">
                    {position.stopLoss > 0 ? position.stopLoss.toFixed(digits) : '-'}
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono text-trade-buy">
                    {position.takeProfit > 0 ? position.takeProfit.toFixed(digits) : '-'}
                  </td>
                  <td className={clsx('px-2 py-1.5 text-right font-mono font-semibold', isProfit ? 'text-trade-buy' : 'text-trade-sell')}>
                    {isProfit ? '+' : ''}{profit.toFixed(2)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => setSelectedPosition(position)}
                      className="px-2 py-0.5 text-xs rounded text-trade-sell hover:bg-red-500/20 border border-trade-sell/30 transition-colors"
                    >
                      청산
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 총 손익 */}
      <div className="px-3 py-1.5 border-t border-border-default flex justify-between items-center text-xs flex-shrink-0">
        <span className="text-text-muted">{t('totalProfit')}</span>
        <span className={clsx('font-mono font-bold text-sm', totalProfit >= 0 ? 'text-trade-buy' : 'text-trade-sell')}>
          {totalProfit >= 0 ? '+' : ''}{totalProfit.toFixed(2)} {accountInfo?.currency ?? 'USD'}
        </span>
      </div>

      {/* 청산 확인 모달 */}
      {selectedPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-2 border border-border-default rounded-xl p-6 w-80 shadow-xl">
            <h3 className="text-sm font-semibold text-text-primary mb-4">{t('closePosition')}</h3>
            <p className="text-sm text-text-secondary mb-3">{t('closeConfirm')}</p>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-text-muted">심볼</span>
                <span className="font-semibold">{selectedPosition.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">수량</span>
                <span className="font-mono">{selectedPosition.volume.toFixed(2)} lot</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPosition(null)}
                className="flex-1 py-2 rounded-lg text-sm bg-surface-3 text-text-secondary hover:bg-surface-4 transition-colors"
              >
                취소
              </button>
              <button
                onClick={executeClose}
                disabled={isClosing}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-white bg-trade-sell hover:opacity-90 transition-opacity disabled:opacity-70"
              >
                {isClosing ? '처리 중...' : '청산 확인'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
