import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  expiresAt: number | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      expiresAt: null,
      user: null,
      login: (token: string, user: User) => {
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // Expira em 24 horas
        set({ token, expiresAt, user });
      },
      logout: () => {
        set({ token: null, expiresAt: null, user: null });
      },
      isAuthenticated: () => {
        const { token, expiresAt } = get();
        return !!token && (expiresAt ?? 0) > Date.now();
      },
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as AuthState;
        if (version === 0) {
          return { ...state, expiresAt: null };
        }
        return state;
      },
    }
  )
);