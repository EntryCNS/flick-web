import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setToken: (accessToken: string) => void;
  clearTokens: () => void;
  clearToken: () => void;
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,

      setTokens: (accessToken: string, refreshToken: string) => set({ accessToken, refreshToken }),
      setToken: (accessToken: string) => set((state) => ({ accessToken, refreshToken: state.refreshToken })),
      
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
      clearToken: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      name: "token-storage",
    }
  )
);