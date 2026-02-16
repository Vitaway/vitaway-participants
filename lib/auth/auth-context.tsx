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
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('vitaway_access_token', tokens.accessToken);
    localStorage.setItem('vitaway_refresh_token', tokens.refreshToken);
    localStorage.setItem('vitaway_expires_at', String(tokens.expiresAt));
    
    // Also set cookie for middleware
    const maxAge = Math.floor((tokens.expiresAt - Date.now()) / 1000);
    document.cookie = `vitaway_access_token=${tokens.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
  } catch (error) {
    console.error('Error saving tokens:', error);
  }
}

function clearTokens() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('vitaway_access_token');
  localStorage.removeItem('vitaway_refresh_token');
  localStorage.removeItem('vitaway_expires_at');
  
  // Also clear cookie
  document.cookie = 'vitaway_access_token=; path=/; max-age=0';
}

function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  
  let accessToken = localStorage.getItem('vitaway_access_token');
  let refreshToken = localStorage.getItem('vitaway_refresh_token');
  let expiresAt = localStorage.getItem('vitaway_expires_at');
  
  // Fallback to cookie if localStorage doesn't have it
  if (!accessToken) {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('vitaway_access_token='));
    if (tokenCookie) {
      accessToken = tokenCookie.split('=')[1];
      // Use same token for refresh (backend uses same token)
      refreshToken = accessToken;
      // Set far future expiry
      expiresAt = String(Date.now() + (365 * 24 * 60 * 60 * 1000));
    }
  }
  
  if (!accessToken || !refreshToken || !expiresAt) {
    return null;
  }
  
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
      } catch (error) {
        console.error('Auth hydration error:', error);
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
      console.log('handleLogin called');
      const { user, tokens } = await authApi.login({ email, password });
      console.log('Login API response:', { user, tokens });
      saveTokens(tokens);
      console.log('Tokens saved');
      
      // Verify token was saved
      const savedToken = localStorage.getItem('vitaway_access_token');
      console.log('Verified saved token:', savedToken ? 'EXISTS' : 'MISSING');
      
      setState({ user, tokens, isAuthenticated: true, isLoading: false });
      console.log('State updated, redirecting to dashboard...');
      
      // Small delay to ensure localStorage write completes
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
    },
    []
  );

  const handleLogout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearTokens();
      setState({ user: null, tokens: null, isAuthenticated: false, isLoading: false });
      window.location.href = '/auth/login';
    }
  }, []);

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
