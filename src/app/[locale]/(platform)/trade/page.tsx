'use client';

import { MarketWatch } from '@/components/market-watch/MarketWatch';
import { TradingChart } from '@/components/chart/TradingChart';
import { OrderPanel } from '@/components/trading/OrderPanel';
import { BottomPanel } from '@/components/layout/BottomPanel';

export default function TradePage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* 상단 3분할 영역 */}
      <div className="flex flex-1 min-h-0">
        {/* 좌측: Market Watch */}
        <div className="w-56 flex-shrink-0 border-r border-border-default overflow-hidden">
          <MarketWatch />
        </div>

        {/* 중앙: 차트 */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <TradingChart />
        </div>

        {/* 우측: 주문 패널 */}
        <div className="w-64 flex-shrink-0 overflow-hidden">
          <OrderPanel />
        </div>
      </div>

      {/* 하단: 포지션/주문/내역 */}
      <div className="h-44 flex-shrink-0 border-t border-border-default overflow-hidden">
        <BottomPanel />
      </div>
    </div>
  );
}
