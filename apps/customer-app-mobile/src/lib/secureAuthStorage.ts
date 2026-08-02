import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'grubgate.customer.accessToken';
const REFRESH_TOKEN_KEY = 'grubgate.customer.refreshToken';
const USER_KEY = 'grubgate.customer.user';

export type StoredUser = {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  userType?: string;
  isGrubPass?: boolean;
  isSubscribed?: boolean;
};

export function normalizeStoredUser(user: StoredUser | null) {
  if (!user) return null;

  return {
    ...user,
    isSubscribed: user.isSubscribed ?? false,
  };
}

export type AuthSession = {
  token: string | null;
  refreshToken: string | null;
  user: StoredUser | null;
};

export async function saveAuthSession({
  token,
  refreshToken,
  user,
}: {
  token: string;
  refreshToken?: string | null;
  user?: StoredUser | null;
}) {
  await setItem(TOKEN_KEY, token);

  if (refreshToken) {
    await setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    await deleteItem(REFRESH_TOKEN_KEY);
  }

  if (user) {
    await setItem(USER_KEY, JSON.stringify(user));
  } else {
    await deleteItem(USER_KEY);
  }
}

export async function getAuthToken() {
  return getItem(TOKEN_KEY);
}

export async function getAuthSession(): Promise<AuthSession> {
  const [token, refreshToken, userJson] = await Promise.all([
    getItem(TOKEN_KEY),
    getItem(REFRESH_TOKEN_KEY),
    getItem(USER_KEY),
  ]);

  return {
    token,
    refreshToken,
    user: parseStoredUser(userJson),
  };
}

export async function clearAuthSession() {
  await Promise.all([
    deleteItem(TOKEN_KEY),
    deleteItem(REFRESH_TOKEN_KEY),
    deleteItem(USER_KEY),
  ]);
}

async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string) {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

function getWebStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

function parseStoredUser(value: string | null): StoredUser | null {
  if (!value) return null;

  try {
    return normalizeStoredUser(JSON.parse(value) as StoredUser);
  } catch {
    return null;
  }
}
