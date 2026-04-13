'use client';

import { useTranslations } from 'next-intl';
import { useUIStore, type BottomTab } from '@/store/uiStore';
import { usePositionStore } from '@/store/positionStore';
import { PositionsTable } from '@/components/positions/PositionsTable';
import { AccountSummary } from '@/components/account/AccountSummary';
import { clsx } from 'clsx';

const TABS: { key: BottomTab; labelKey: string }[] = [
  { key: 'positions', labelKey: 'openPositions' },
  { key: 'orders', labelKey: 'pendingOrders' },
  { key: 'history', labelKey: 'title' },
  { key: 'account', labelKey: 'balance' },
];

export function BottomPanel() {
  const tPositions = useTranslations('positions');
  const tOrders = useTranslations('orders');
  const tHistory = useTranslations('history');
  const tAccount = useTranslations('account');

  const activeBottomTab = useUIStore((s) => s.activeBottomTab);
  const setActiveBottomTab = useUIStore((s) => s.setActiveBottomTab);
  const positionCount = usePositionStore((s) => s.positions.length);
  const pendingCount = usePositionStore((s) => s.pendingOrders.length);

  const getLabel = (tab: BottomTab) => {
    switch (tab) {
      case 'positions': return tPositions('openPositions');
      case 'orders': return tOrders('pendingOrders');
      case 'history': return tHistory('title');
      case 'account': return tAccount('balance');
    }
  };

  const getBadge = (tab: BottomTab) => {
    if (tab === 'positions' && positionCount > 0) return positionCount;
    if (tab === 'orders' && pendingCount > 0) return pendingCount;
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="flex border-b border-border-default bg-surface-2 flex-shrink-0">
        {TABS.map(({ key }) => {
          const badge = getBadge(key);
          return (
            <button
              key={key}
              onClick={() => setActiveBottomTab(key)}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 text-xs transition-colors border-b-2',
                activeBottomTab === key
                  ? 'text-text-primary border-xm-primary'
                  : 'text-text-muted border-transparent hover:text-text-secondary hover:border-border-default'
              )}
            >
              {getLabel(key)}
              {badge !== null && (
                <span className="bg-xm-primary text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeBottomTab === 'positions' && <PositionsTable />}
        {activeBottomTab === 'orders' && (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            {tOrders('noOrders')}
          </div>
        )}
        {activeBottomTab === 'history' && (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            거래 내역 탭에서 확인하세요
          </div>
        )}
        {activeBottomTab === 'account' && <AccountSummary />}
      </div>
    </div>
  );
}
