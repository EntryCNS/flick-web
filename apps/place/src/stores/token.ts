import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TokenState {
  token: string | null;
  refreshToken: string | null;
  setTokens: (token: string, refreshToken: string) => void;
  setToken: (token: string) => void;
  clearTokens: () => void;
  clearToken: () => void;
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,

      setTokens: (token: string, refreshToken: string) => set({ token, refreshToken }),
      setToken: (token: string) => set((state) => ({ token, refreshToken: state.refreshToken })),
      
      clearTokens: () => set({ token: null, refreshToken: null }),
      clearToken: () => set({ token: null, refreshToken: null }),
    }),
    {
      name: "token-storage",
    }
  )
);