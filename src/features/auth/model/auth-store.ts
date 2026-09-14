import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  email: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (email: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

/**
 * Autenticação simulada: como não há backend, "logar" apenas gera um token
 * fictício e guarda o e-mail do usuário. O middleware `persist` cuida de manter
 * a sessão entre reloads (localStorage), atendendo ao requisito de persistência.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      login: (email: string) => {
        const fakeToken = `cinedash-${btoa(email)}-${Date.now()}`;
        set({ token: fakeToken, user: { email } });
      },
      logout: () => set({ token: null, user: null }),
      isAuthenticated: () => Boolean(get().token),
    }),
    { name: "cinedash-auth" },
  ),
);
