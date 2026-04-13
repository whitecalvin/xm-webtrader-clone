import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Timeframe } from '@/types/mt5';

export type BottomTab = 'positions' | 'orders' | 'history' | 'account';
export type ChartType = 'candlestick' | 'line' | 'area' | 'bar';

interface UIState {
  theme: 'dark' | 'light';
  sidebarCollapsed: boolean;
  activeBottomTab: BottomTab;
  chartTimeframe: Timeframe;
  chartType: ChartType;
  orderPanelSymbol: string;
  orderDirection: 'BUY' | 'SELL';
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  serverTime: number;
  oneClickTrading: boolean;
  confirmOrders: boolean;
  notificationCount: number;
  // Actions
  toggleTheme: () => void;
  toggleSidebar: () => void;
  setActiveBottomTab: (tab: BottomTab) => void;
  setChartTimeframe: (tf: Timeframe) => void;
  setChartType: (type: ChartType) => void;
  setOrderPanelSymbol: (symbol: string) => void;
  setOrderDirection: (direction: 'BUY' | 'SELL') => void;
  setConnectionState: (state: UIState['connectionState']) => void;
  setServerTime: (time: number) => void;
  toggleOneClickTrading: () => void;
  toggleConfirmOrders: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarCollapsed: false,
      activeBottomTab: 'positions',
      chartTimeframe: 'H1',
      chartType: 'candlestick',
      orderPanelSymbol: 'EURUSD',
      orderDirection: 'BUY',
      connectionState: 'disconnected',
      serverTime: 0,
      oneClickTrading: false,
      confirmOrders: true,
      notificationCount: 0,

      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),

      setChartTimeframe: (tf) => set({ chartTimeframe: tf }),

      setChartType: (type) => set({ chartType: type }),

      setOrderPanelSymbol: (symbol) => set({ orderPanelSymbol: symbol }),

      setOrderDirection: (direction) => set({ orderDirection: direction }),

      setConnectionState: (connectionState) => set({ connectionState }),

      setServerTime: (serverTime) => set({ serverTime }),

      toggleOneClickTrading: () =>
        set((state) => ({ oneClickTrading: !state.oneClickTrading })),

      toggleConfirmOrders: () =>
        set((state) => ({ confirmOrders: !state.confirmOrders })),
    }),
    {
      name: 'xm-ui',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        chartTimeframe: state.chartTimeframe,
        chartType: state.chartType,
        oneClickTrading: state.oneClickTrading,
        confirmOrders: state.confirmOrders,
      }),
    }
  )
);
