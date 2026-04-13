import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TickData, SymbolInfo } from '@/types/mt5';

const DEFAULT_WATCHLIST = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'US30', 'USOIL', 'BTCUSD'];

interface MarketState {
  ticks: Record<string, TickData>;
  symbols: SymbolInfo[];
  watchlist: string[];
  favorites: string[];
  selectedSymbol: string;
  searchQuery: string;
  activeCategory: string;
  // Actions
  updateTick: (symbol: string, tick: Omit<TickData, 'lastUpdated'>) => void;
  setSymbols: (symbols: SymbolInfo[]) => void;
  setSelectedSymbol: (symbol: string) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  toggleFavorite: (symbol: string) => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: string) => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      ticks: {},
      symbols: [],
      watchlist: DEFAULT_WATCHLIST,
      favorites: [],
      selectedSymbol: 'EURUSD',
      searchQuery: '',
      activeCategory: 'all',

      updateTick: (symbol, tick) =>
        set((state) => {
          const prev = state.ticks[symbol];
          return {
            ticks: {
              ...state.ticks,
              [symbol]: {
                ...tick,
                lastUpdated: Date.now(),
                prevBid: prev?.bid,
                prevAsk: prev?.ask,
              },
            },
          };
        }),

      setSymbols: (symbols) => set({ symbols }),

      setSelectedSymbol: (symbol) => {
        const { watchlist } = get();
        if (!watchlist.includes(symbol)) {
          set((state) => ({
            selectedSymbol: symbol,
            watchlist: [...state.watchlist, symbol],
          }));
        } else {
          set({ selectedSymbol: symbol });
        }
      },

      addToWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.includes(symbol)
            ? state.watchlist
            : [...state.watchlist, symbol],
        })),

      removeFromWatchlist: (symbol) =>
        set((state) => ({
          watchlist: state.watchlist.filter((s) => s !== symbol),
          favorites: state.favorites.filter((s) => s !== symbol),
        })),

      toggleFavorite: (symbol) =>
        set((state) => ({
          favorites: state.favorites.includes(symbol)
            ? state.favorites.filter((s) => s !== symbol)
            : [...state.favorites, symbol],
        })),

      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveCategory: (category) => set({ activeCategory: category }),
    }),
    {
      name: 'xm-market',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        watchlist: state.watchlist,
        favorites: state.favorites,
        selectedSymbol: state.selectedSymbol,
      }),
    }
  )
);
