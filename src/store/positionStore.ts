import { create } from 'zustand';
import type { Position, PendingOrder } from '@/types/mt5';

interface PositionState {
  positions: Position[];
  pendingOrders: PendingOrder[];
  isLoading: boolean;
  lastUpdated: number;
  // Actions
  setPositions: (positions: Position[]) => void;
  updatePosition: (ticket: number, updates: Partial<Position>) => void;
  removePosition: (ticket: number) => void;
  setPendingOrders: (orders: PendingOrder[]) => void;
  updatePendingOrder: (ticket: number, updates: Partial<PendingOrder>) => void;
  removePendingOrder: (ticket: number) => void;
  setLoading: (loading: boolean) => void;
}

export const usePositionStore = create<PositionState>((set) => ({
  positions: [],
  pendingOrders: [],
  isLoading: false,
  lastUpdated: 0,

  setPositions: (positions) =>
    set({ positions, lastUpdated: Date.now() }),

  updatePosition: (ticket, updates) =>
    set((state) => ({
      positions: state.positions.map((p) =>
        p.ticket === ticket ? { ...p, ...updates } : p
      ),
    })),

  removePosition: (ticket) =>
    set((state) => ({
      positions: state.positions.filter((p) => p.ticket !== ticket),
    })),

  setPendingOrders: (orders) =>
    set({ pendingOrders: orders }),

  updatePendingOrder: (ticket, updates) =>
    set((state) => ({
      pendingOrders: state.pendingOrders.map((o) =>
        o.ticket === ticket ? { ...o, ...updates } : o
      ),
    })),

  removePendingOrder: (ticket) =>
    set((state) => ({
      pendingOrders: state.pendingOrders.filter((o) => o.ticket !== ticket),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
}));
