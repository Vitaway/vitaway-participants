// Authentication Context & Provider

'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser, AuthTokens, AuthState } from '@/types/auth';
import * as authApi from '@/lib/api/auth';

// ─── Token helpers ──────────────────────────────────────────────────
function saveTokens(tokens: AuthTokens) {
  localStorage.setItem('vitaway_access_token', tokens.accessToken);
  localStorage.setItem('vitaway_refresh_token', tokens.refreshToken);
  localStorage.setItem('vitaway_expires_at', String(tokens.expiresAt));
}

function clearTokens() {
  localStorage.removeItem('vitaway_access_token');
  localStorage.removeItem('vitaway_refresh_token');
  localStorage.removeItem('vitaway_expires_at');
}

function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  const accessToken = localStorage.getItem('vitaway_access_token');
  const refreshToken = localStorage.getItem('vitaway_refresh_token');
  const expiresAt = localStorage.getItem('vitaway_expires_at');
  if (!accessToken || !refreshToken || !expiresAt) return null;
  return { accessToken, refreshToken, expiresAt: Number(expiresAt) };
}

// ─── Context ────────────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Re-hydrate session on mount
  useEffect(() => {
    async function hydrate() {
      try {
        const tokens = getStoredTokens();
        if (!tokens) {
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }

        // Check if token has expired
        if (tokens.expiresAt < Date.now()) {
          clearTokens();
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }

        const user = await authApi.getCurrentUser();
        if (user) {
          setState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          clearTokens();
          setState({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
        }
      } catch {
        clearTokens();
        setState({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
      }
    }
    hydrate();
  }, []);

  // Session timeout — auto-logout after inactivity
  useEffect(() => {
    if (!state.isAuthenticated) return;

    let timer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        handleLogout();
      }, SESSION_TIMEOUT_MS);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isAuthenticated]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const { user, tokens } = await authApi.login({ email, password });
      saveTokens(tokens);
      setState({ user, tokens, isAuthenticated: true, isLoading: false });
      router.push('/dashboard');
    },
    [router]
  );

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearTokens();
      setState({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
