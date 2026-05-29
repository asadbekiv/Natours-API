import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '../auth/secure-storage';

const baseURL: string =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  'http://localhost:4000/api/v1';

export const api = axios.create({ baseURL, timeout: 15000 });

// Attach the current access token to every outgoing request.
api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Deduplicate concurrent refresh attempts so a burst of 401s only refreshes once.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) return null;
        // Plain axios.post to bypass our own interceptors.
        const res = await axios.post<{ token: string; refreshToken: string }>(
          `${baseURL}/users/refresh`,
          { refreshToken },
        );
        await setTokens(res.data.token, res.data.refreshToken);
        return res.data.token;
      } catch {
        // Reuse-detected / revoked / expired → blow away creds, force re-login.
        await clearTokens();
        return null;
      } finally {
        // Clear the singleton so the *next* failure can refresh again.
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

// On 401, try refreshing exactly once per request, then replay.
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/users/refresh')
    ) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
