'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest, getApiErrorMessage, type ApiError } from './api-client';
import type { AuthUser, MeUser } from './types';

interface AuthState {
  user: MeUser | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  setUserFromTokens: (auth: AuthUser) => void;
}

const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

const ME_KEY = 'me';
const TOKEN_KEY = 'access_token';

function persistToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUserFromTokens = useCallback((auth: AuthUser) => {
    setAccessToken(auth.access_token);
    persistToken(auth.access_token);
    setUser({
      user_id: auth.user_id,
      email: auth.email ?? null,
      name: auth.name ?? null,
      role: auth.role,
      status: auth.status,
    });
  }, []);

  const refresh = useCallback(async (): Promise<boolean> => {
    const { data, error } = await apiRequest<AuthUser>('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({}),
    });
    if (error || !data) {
      setUser(null);
      setAccessToken(null);
      persistToken(null);
      return false;
    }
    setUserFromTokens(data);
    return true;
  }, [setUserFromTokens]);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      setAccessToken(token);
      apiRequest<MeUser>('/auth/me', { token })
        .then(({ data, error }) => {
          if (data) setUser(data);
          else if (error?.statusCode === 401)
            refresh().then((ok) => {
              if (!ok) setUser(null);
            });
          else setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      apiRequest<AuthUser>('/auth/refresh', { method: 'POST', credentials: 'include' })
        .then(({ data }) => {
          if (data) setUserFromTokens(data);
          else setUser(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [refresh, setUserFromTokens]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await apiRequest<AuthUser>('/auth/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (error) return { ok: false, error: getApiErrorMessage(error) };
      if (!data) return { ok: false, error: 'Login failed' };
      setUserFromTokens(data);
      router.push('/events');
      return { ok: true };
    },
    [router, setUserFromTokens],
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const { data, error } = await apiRequest<AuthUser>('/auth/register', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name?.trim() || undefined,
        }),
      });
      if (error) return { ok: false, error: getApiErrorMessage(error) };
      if (!data) return { ok: false, error: 'Registration failed' };
      setUserFromTokens(data);
      router.push('/events');
      return { ok: true };
    },
    [router, setUserFromTokens],
  );

  const logout = useCallback(async () => {
    await apiRequest('/auth/logout', {
      method: 'POST',
      credentials: 'include',
      token: accessToken,
    });
    setUser(null);
    setAccessToken(null);
    persistToken(null);
    router.push('/login');
  }, [accessToken, router]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: !!user && user.status === 'active',
      login,
      register,
      logout,
      refresh,
      setUserFromTokens,
    }),
    [user, accessToken, isLoading, login, register, logout, refresh, setUserFromTokens],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
