'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useAccountStore } from '@/store/accountStore';
import { useUIStore } from '@/store/uiStore';
import { apiClient } from '@/lib/api/client';
import { formatServerTime } from '@/lib/utils/formatting';
import { localeNames, type Locale, locales } from '@/i18n/config';
import { clsx } from 'clsx';

export function AppHeader() {
  const t = useTranslations('layout');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const { accountLogin, accountName, clearAuth } = useAuthStore();
  const { info: accountInfo } = useAccountStore();
  const { connectionState, serverTime, toggleSidebar } = useUIStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch { /* ignore */ }
    clearAuth();
    router.push(`/${locale}/login`);
  };

  const handleLocaleChange = (newLocale: Locale) => {
    // 현재 경로에서 locale만 교체
    const newPath = pathname.replace(`/${locale}/`, `/${newLocale}/`);
    router.push(newPath);
    setShowLangMenu(false);
  };

  const connectionDot = {
    connected: 'bg-trade-buy',
    connecting: 'bg-xm-accent',
    reconnecting: 'bg-xm-accent animate-pulse',
    disconnected: 'bg-trade-sell',
  }[connectionState];

  const connectionLabel = {
    connected: t('connected'),
    connecting: '연결 중...',
    reconnecting: t('reconnecting'),
    disconnected: t('disconnected'),
  }[connectionState];

  return (
    <header className="h-12 bg-surface-2 border-b border-border-default flex items-center px-4 gap-4 flex-shrink-0 z-10">
      {/* 로고 + 사이드바 토글 */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="text-text-secondary hover:text-text-primary p-1 rounded text-sm"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: '#e63329' }}>
            X
          </div>
          <span className="font-bold text-sm text-text-primary hidden sm:block">WebTrader</span>
        </div>
      </div>

      {/* 계좌 정보 */}
      <div className="flex-1 flex items-center gap-4">
        {accountInfo && (
          <>
            <div className="hidden md:flex items-center gap-1 text-xs">
              <span className="text-text-muted">{accountLogin}</span>
              <span className="text-text-secondary mx-1">|</span>
              <span className="text-text-secondary">{accountName}</span>
            </div>
            <div className="hidden lg:flex items-center gap-4 text-xs">
              <div>
                <span className="text-text-muted">잔고 </span>
                <span className="text-text-primary font-mono">
                  {accountInfo.balance.toFixed(2)} {accountInfo.currency}
                </span>
              </div>
              <div>
                <span className="text-text-muted">순자산 </span>
                <span className={clsx('font-mono', accountInfo.equity >= accountInfo.balance ? 'text-trade-buy' : 'text-trade-sell')}>
                  {accountInfo.equity.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-text-muted">손익 </span>
                <span className={clsx('font-mono', accountInfo.profit >= 0 ? 'text-trade-buy' : 'text-trade-sell')}>
                  {accountInfo.profit >= 0 ? '+' : ''}{accountInfo.profit.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 연결 상태 + 서버 시간 */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className={clsx('w-2 h-2 rounded-full', connectionDot)} />
            <span className="text-text-muted">{connectionLabel}</span>
          </div>
          {serverTime > 0 && (
            <span className="text-text-muted font-mono">{formatServerTime(serverTime)}</span>
          )}
        </div>

        {/* 언어 선택 드롭다운 */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="px-2 py-1 text-xs rounded bg-surface-3 hover:bg-surface-4 text-text-secondary transition-colors"
          >
            {locale.toUpperCase()} ▾
          </button>
          {showLangMenu && (
            <div className="absolute right-0 top-full mt-1 bg-surface-3 border border-border-default rounded-lg shadow-lg z-50 min-w-[120px]">
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => handleLocaleChange(l)}
                  className={clsx(
                    'w-full text-left px-3 py-2 text-xs hover:bg-surface-4 transition-colors first:rounded-t-lg last:rounded-b-lg',
                    locale === l ? 'text-xm-primary font-semibold' : 'text-text-secondary'
                  )}
                >
                  {localeNames[l]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 로그아웃 */}
        <button
          onClick={handleLogout}
          className="px-2 py-1 text-xs rounded text-trade-sell hover:bg-surface-3 transition-colors"
        >
          {tAuth('logout')}
        </button>
      </div>
    </header>
  );
}
