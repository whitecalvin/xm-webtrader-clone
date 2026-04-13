'use client';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useWebSocket } from '@/hooks/useWebSocket';

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  // WebSocket 연결을 플랫폼 레이아웃 레벨에서 관리
  useWebSocket();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface-1">
      <AppHeader />
      <div className="flex flex-1 min-h-0">
        <AppSidebar />
        <main className="flex-1 min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
