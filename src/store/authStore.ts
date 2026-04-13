import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthPayload {
  accountLogin: number;
  accountName: string;
  server: string;
  currency: string;
  token: string;
}

interface AuthState {
  isAuthenticated: boolean;
  accountLogin: number | null;
  accountName: string | null;
  server: string | null;
  currency: string;
  token: string | null;  // 메모리에만 보관, localStorage 저장 금지
  // Actions
  setAuth: (payload: AuthPayload) => void;
  clearAuth: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accountLogin: null,
      accountName: null,
      server: null,
      currency: 'USD',
      token: null,
      setAuth: (payload) =>
        set({
          isAuthenticated: true,
          accountLogin: payload.accountLogin,
          accountName: payload.accountName,
          server: payload.server,
          currency: payload.currency,
          token: payload.token,
        }),
      clearAuth: () =>
        set({
          isAuthenticated: false,
          accountLogin: null,
          accountName: null,
          server: null,
          currency: 'USD',
          token: null,
        }),
      setToken: (token) => set({ token }),
    }),
    {
      name: 'xm-auth',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      // token은 절대 localStorage에 저장하지 않음
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accountLogin: state.accountLogin,
        accountName: state.accountName,
        server: state.server,
        currency: state.currency,
      }),
    }
  )
);
