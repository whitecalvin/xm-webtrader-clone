'use client';

import { useTranslations } from 'next-intl';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useAccountStore } from '@/store/accountStore';
import { localeNames, locales, type Locale } from '@/i18n/config';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { formatLeverage } from '@/lib/utils/formatting';
import { clsx } from 'clsx';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tAccount = useTranslations('account');
  const {
    oneClickTrading,
    confirmOrders,
    toggleOneClickTrading,
    toggleConfirmOrders,
  } = useUIStore();
  const { accountLogin, accountName, server, currency } = useAuthStore();
  const accountInfo = useAccountStore((s) => s.info);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;

  const handleLocaleChange = (newLocale: Locale) => {
    const newPath = pathname.replace(`/${locale}/`, `/${newLocale}/`);
    router.push(newPath);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-6">{t('title')}</h1>

      {/* 계좌 정보 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">{t('account')}</h2>
        <div className="bg-surface-2 rounded-xl border border-border-default p-4 space-y-3">
          {[
            { label: tAccount('accountNumber'), value: accountLogin?.toString() ?? '-' },
            { label: tAccount('accountName'), value: accountName ?? '-' },
            { label: tAccount('server'), value: server ?? '-' },
            { label: tAccount('currency'), value: currency },
            { label: tAccount('leverage'), value: accountInfo ? formatLeverage(accountInfo.leverage) : '-' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-text-muted">{label}</span>
              <span className="text-text-primary font-mono">{value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 언어 설정 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">{t('language')}</h2>
        <div className="bg-surface-2 rounded-xl border border-border-default p-4">
          <div className="grid grid-cols-2 gap-2">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => handleLocaleChange(l)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm transition-colors font-medium',
                  locale === l
                    ? 'text-white'
                    : 'bg-surface-3 text-text-secondary hover:bg-surface-4'
                )}
                style={locale === l ? { backgroundColor: '#e63329' } : {}}
              >
                {localeNames[l]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 거래 설정 */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">거래 설정</h2>
        <div className="bg-surface-2 rounded-xl border border-border-default divide-y divide-border-muted">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm text-text-primary">{t('oneClickTrading')}</div>
              <div className="text-xs text-text-muted">주문 확인 없이 즉시 실행</div>
            </div>
            <button
              onClick={toggleOneClickTrading}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                oneClickTrading ? 'bg-trade-buy' : 'bg-surface-4'
              )}
              aria-label="Toggle one-click trading"
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  oneClickTrading ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm text-text-primary">{t('confirmOrders')}</div>
              <div className="text-xs text-text-muted">주문 실행 전 확인 창 표시</div>
            </div>
            <button
              onClick={toggleConfirmOrders}
              className={clsx(
                'relative w-11 h-6 rounded-full transition-colors',
                confirmOrders ? 'bg-trade-buy' : 'bg-surface-4'
              )}
              aria-label="Toggle order confirmation"
            >
              <span
                className={clsx(
                  'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                  confirmOrders ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
