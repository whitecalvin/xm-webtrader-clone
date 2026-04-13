import { create } from 'zustand';
import type { AccountInfo } from '@/types/mt5';

interface AccountState {
  info: AccountInfo | null;
  isLoading: boolean;
  // Actions
  setAccountInfo: (info: AccountInfo) => void;
  updateEquity: (equity: number, margin: number, freeMargin: number, profit: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  info: null,
  isLoading: false,

  setAccountInfo: (info) => set({ info }),

  updateEquity: (equity, margin, freeMargin, profit) =>
    set((state) => {
      if (!state.info) return state;
      return {
        info: {
          ...state.info,
          equity,
          margin,
          freeMargin,
          profit,
          marginLevel: margin > 0 ? (equity / margin) * 100 : 0,
        },
      };
    }),

  setLoading: (loading) => set({ isLoading: loading }),
}));
