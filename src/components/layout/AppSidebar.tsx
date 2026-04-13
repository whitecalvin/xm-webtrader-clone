'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useUIStore } from '@/store/uiStore';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { key: 'trade', icon: '📊', href: '/trade' },
  { key: 'history', icon: '📋', href: '/history' },
  { key: 'settings', icon: '⚙️', href: '/settings' },
] as const;

export function AppSidebar() {
  const t = useTranslations('layout');
  const locale = useLocale();
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={clsx(
        'h-full bg-surface-2 border-r border-border-default flex flex-col transition-all duration-200 flex-shrink-0',
        sidebarCollapsed ? 'w-12' : 'w-48'
      )}
    >
      <nav className="flex-1 py-2">
        {NAV_ITEMS.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={item.key}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 mx-1 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-surface-3 text-text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
              )}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && (
                <span className="truncate">{t(item.key as 'trade' | 'history' | 'settings')}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
