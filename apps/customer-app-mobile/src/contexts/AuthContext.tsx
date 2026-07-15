import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import api from '../lib/api';
import { loginCustomer, signupCustomer } from '../lib/authApi';
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  type StoredUser,
} from '../lib/secureAuthStorage';

type LoginPayload = {
  identifier: string;
  password: string;
};

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'customer';
};

type AuthContextValue = {
  user: StoredUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<{ ok: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string }>;
  applyAuthenticatedSession: (payload: {
    token: string;
    refreshToken?: string | null;
    user?: StoredUser | null;
  }) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const session = await getAuthSession();
        if (!mounted) return;

        setToken(session.token);
        setUser(session.user);

        if (session.token) {
          await refreshCurrentUser(session.user);
        }
      } catch {
        await clearAuthSession();
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setIsHydrating(false);
      }
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshCurrentUser = useCallback(async (fallbackUser?: StoredUser | null) => {
    try {
      const response = await api.get('/auth/me');
      const nextUser = extractUser(response.data) || fallbackUser || null;
      setUser(nextUser);
      return nextUser;
    } catch {
      return fallbackUser || null;
    }
  }, []);

  const persistResponseSession = useCallback(async (responseData: unknown) => {
    const data = extractResponseData(responseData);
    const accessToken = firstString(data?.accessToken, data?.token, data?.jwt);
    const refreshToken = firstString(data?.refreshToken) || null;
    const responseUser = extractUser(responseData);

    if (!accessToken) {
      throw new Error('Authentication succeeded but no access token was returned.');
    }

    await saveAuthSession({
      token: accessToken,
      refreshToken,
      user: responseUser,
    });

    setToken(accessToken);
    setUser(responseUser);

    const latestUser = await refreshCurrentUser(responseUser);
    if (latestUser) {
      await saveAuthSession({
        token: accessToken,
        refreshToken,
        user: latestUser,
      });
      setUser(latestUser);
    }
  }, [refreshCurrentUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      if (isLoading) return { ok: false, error: 'Please wait for the current request to finish.' };

      setIsLoading(true);
      setError(null);

      try {
        const response = await loginCustomer(payload);
        await persistResponseSession(response);
        return { ok: true };
      } catch (requestError) {
        const message = getApiError(requestError, 'Login failed. Please try again.');
        setError(message);
        return { ok: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, persistResponseSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      if (isLoading) return { ok: false, error: 'Please wait for the current request to finish.' };

      setIsLoading(true);
      setError(null);

      try {
        const response = await signupCustomer(payload);
        await persistResponseSession(response);
        return { ok: true };
      } catch (requestError) {
        const message = getApiError(requestError, 'Registration failed. Please try again.');
        setError(message);
        return { ok: false, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, persistResponseSession],
  );

  const applyAuthenticatedSession = useCallback(
    async ({
      token: nextToken,
      refreshToken,
      user: nextUser,
    }: {
      token: string;
      refreshToken?: string | null;
      user?: StoredUser | null;
    }) => {
      await saveAuthSession({
        token: nextToken,
        refreshToken,
        user: nextUser,
      });

      setToken(nextToken);
      setUser(nextUser || null);

      const latestUser = await refreshCurrentUser(nextUser);
      if (latestUser) {
        await saveAuthSession({
          token: nextToken,
          refreshToken,
          user: latestUser,
        });
        setUser(latestUser);
      }
    },
    [refreshCurrentUser],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await clearAuthSession();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isHydrating,
      isLoading,
      error,
      login,
      register,
      applyAuthenticatedSession,
      logout,
      clearError: () => setError(null),
    }),
    [applyAuthenticatedSession, error, isHydrating, isLoading, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

function extractResponseData(responseData: unknown) {
  if (!responseData || typeof responseData !== 'object') return null;
  const shaped = responseData as { data?: Record<string, unknown> };
  return (shaped.data || responseData) as Record<string, unknown>;
}

function extractUser(responseData: unknown): StoredUser | null {
  const data = extractResponseData(responseData);
  const user = data?.user;
  return user && typeof user === 'object' ? (user as StoredUser) : null;
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === 'string' && value.length > 0);
}

function getApiError(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; errors?: { message?: string }[] } } }).response;
    return response?.data?.message || response?.data?.errors?.[0]?.message || fallback;
  }

  if (error instanceof Error) return error.message;
  return fallback;
}
