'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMarketStore } from '@/store/marketStore';
import { useAccountStore } from '@/store/accountStore';
import { usePositionStore } from '@/store/positionStore';
import { useUIStore } from '@/store/uiStore';
import { getMT5Client, destroyMT5Client } from '@/lib/mt5-bridge/client';
import type { MT5Response } from '@/types/mt5';
import { apiClient } from '@/lib/api/client';

export function useWebSocket() {
  const { isAuthenticated, token } = useAuthStore();
  const { watchlist, updateTick, setSymbols } = useMarketStore();
  const { setAccountInfo } = useAccountStore();
  const { setPositions, setPendingOrders, updatePosition, removePosition } = usePositionStore();
  const { setConnectionState, setServerTime } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const wsUrl = process.env.NEXT_PUBLIC_MT5_BRIDGE_WS_URL;
    if (!wsUrl) {
      // Mock 모드: 초기 데이터 REST API로 로드
      loadInitialData();
      startMockTicks();
      return;
    }

    const client = getMT5Client(wsUrl, token ?? '');

    const unsubscribeState = client.onStateChange((state) => {
      setConnectionState(state);
    });

    const unsubscribeMsg = client.onMessage((msg: MT5Response) => {
      switch (msg.type) {
        case 'TICK':
          updateTick(msg.symbol, { bid: msg.bid, ask: msg.ask, time: msg.time });
          break;
        case 'ACCOUNT_UPDATE':
          setAccountInfo(msg.data);
          break;
        case 'POSITION_UPDATE':
          updatePosition(msg.data.ticket, msg.data);
          break;
        case 'POSITION_CLOSE':
          removePosition(msg.ticket);
          break;
      }
    });

    client.connect().then(() => {
      client.subscribe(watchlist);
      loadInitialData();
    });

    return () => {
      unsubscribeState();
      unsubscribeMsg();
      destroyMT5Client();
    };
  }, [isAuthenticated]);

  async function loadInitialData() {
    try {
      const [accountRes, positionsRes, ordersRes, symbolsRes] = await Promise.all([
        apiClient.get('/mt5/account').catch(() => null),
        apiClient.get('/mt5/positions').catch(() => null),
        apiClient.get('/mt5/orders').catch(() => null),
        apiClient.get('/mt5/symbols').catch(() => null),
      ]);

      if (accountRes?.data) setAccountInfo(accountRes.data);
      if (positionsRes?.data) setPositions(positionsRes.data);
      if (ordersRes?.data) setPendingOrders(ordersRes.data);
      if (symbolsRes?.data) setSymbols(symbolsRes.data);

      setConnectionState('connected');
    } catch (error) {
      console.error('[WebSocket] Failed to load initial data:', error);
    }
  }

  function startMockTicks() {
    // Mock 모드: 가격 시뮬레이션
    const mockPrices: Record<string, { bid: number; ask: number }> = {
      EURUSD: { bid: 1.08520, ask: 1.08535 },
      GBPUSD: { bid: 1.27150, ask: 1.27170 },
      USDJPY: { bid: 149.850, ask: 149.870 },
      USDCHF: { bid: 0.89520, ask: 0.89540 },
      AUDUSD: { bid: 0.64820, ask: 0.64835 },
      USDCAD: { bid: 1.36250, ask: 1.36270 },
      NZDUSD: { bid: 0.60120, ask: 0.60140 },
      EURGBP: { bid: 0.85320, ask: 0.85340 },
      XAUUSD: { bid: 2024.50, ask: 2025.00 },
      XAGUSD: { bid: 23.250, ask: 23.300 },
      USOIL: { bid: 78.250, ask: 78.300 },
      UKOIL: { bid: 83.150, ask: 83.200 },
      US30: { bid: 38950.00, ask: 38953.00 },
      US500: { bid: 5250.00, ask: 5250.50 },
      USTEC: { bid: 18250.00, ask: 18251.00 },
      BTCUSD: { bid: 68500.00, ask: 68550.00 },
      ETHUSD: { bid: 3850.00, ask: 3852.00 },
    };

    const interval = setInterval(() => {
      Object.entries(mockPrices).forEach(([symbol, price]) => {
        const volatility = symbol === 'BTCUSD' ? 50 : symbol.includes('JPY') ? 0.02 : symbol.includes('US') || symbol.includes('XAU') ? 0.5 : 0.00005;
        const change = (Math.random() - 0.5) * volatility * 2;
        price.bid += change;
        price.ask = price.bid + (symbol.includes('JPY') ? 0.020 : symbol === 'XAUUSD' ? 0.50 : symbol === 'BTCUSD' ? 50 : 0.00015);

        updateTick(symbol, {
          bid: parseFloat(price.bid.toFixed(symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' || symbol.includes('US') ? 2 : 5)),
          ask: parseFloat(price.ask.toFixed(symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' || symbol.includes('US') ? 2 : 5)),
          time: Math.floor(Date.now() / 1000),
        });
      });

      setServerTime(Math.floor(Date.now() / 1000));
    }, 500);

    return () => clearInterval(interval);
  }
}
