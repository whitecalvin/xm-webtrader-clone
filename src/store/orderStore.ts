import { create } from 'zustand';
import type { DealHistory } from '@/types/mt5';

interface OrderState {
  history: DealHistory[];
  isLoadingHistory: boolean;
  historyFrom: string;
  historyTo: string;
  // Actions
  setHistory: (history: DealHistory[]) => void;
  setLoadingHistory: (loading: boolean) => void;
  setHistoryRange: (from: string, to: string) => void;
}

const getDefaultDateRange = () => {
  const to = new Date();
  const from = new Date();
  from.setMonth(from.getMonth() - 1);
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
};

const range = getDefaultDateRange();

export const useOrderStore = create<OrderState>((set) => ({
  history: [],
  isLoadingHistory: false,
  historyFrom: range.from,
  historyTo: range.to,

  setHistory: (history) => set({ history }),
  setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),
  setHistoryRange: (from, to) => set({ historyFrom: from, historyTo: to }),
}));
