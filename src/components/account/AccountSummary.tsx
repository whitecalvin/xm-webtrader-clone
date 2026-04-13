'use client';

import { useTranslations } from 'next-intl';
import { useAccountStore } from '@/store/accountStore';
import { formatBalance, formatMarginLevel } from '@/lib/utils/formatting';
import { getMarginLevelStatus } from '@/lib/utils/calculations';
import { clsx } from 'clsx';

export function AccountSummary() {
  const t = useTranslations('account');
  const info = useAccountStore((s) => s.info);

  if (!info) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-xs">
        계좌 정보 로딩 중...
      </div>
    );
  }

  const marginStatus = getMarginLevelStatus(info.marginLevel);
  const marginValueClass = { safe: 'text-trade-buy', warning: 'text-xm-accent', danger: 'text-trade-sell' }[marginStatus];

  // 마진 레벨 바 퍼센트 (0-500% 범위를 0-100%로 표시)
  const marginBarPct = Math.min((info.marginLevel / 500) * 100, 100);
  const marginBarColor = { safe: '#26a69a', warning: '#f5a623', danger: '#ef5350' }[marginStatus];

  const metrics = [
    { label: t('balance'), value: formatBalance(info.balance, info.currency), cls: 'text-text-primary' },
    { label: t('equity'), value: formatBalance(info.equity, info.currency), cls: info.equity >= info.balance ? 'text-trade-buy' : 'text-trade-sell' },
    { label: t('margin'), value: formatBalance(info.margin, info.currency), cls: 'text-text-primary' },
    { label: t('freeMargin'), value: formatBalance(info.freeMargin, info.currency), cls: 'text-text-primary' },
    { label: t('profit'), value: formatBalance(info.profit, info.currency), cls: info.profit >= 0 ? 'text-trade-buy' : 'text-trade-sell' },
  ];

  return (
    <div className="h-full px-4 py-2 flex flex-col">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1 items-center">
        {metrics.map((metric) => (
          <div key={metric.label} className="text-center">
            <div className="text-xs text-text-muted mb-0.5">{metric.label}</div>
            <div className={clsx('text-sm font-mono font-semibold', metric.cls)}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* 마진 레벨 바 */}
      {info.margin > 0 && (
        <div className="mt-1">
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-text-muted">{t('marginLevel')}</span>
            <span className={clsx('font-mono', marginValueClass)}>
              {formatMarginLevel(info.marginLevel)}
            </span>
          </div>
          <div className="h-1.5 bg-surface-4 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${marginBarPct}%`, backgroundColor: marginBarColor }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
