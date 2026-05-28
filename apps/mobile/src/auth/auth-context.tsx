import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { AuthResponse, User } from '@natours/shared';
import { api } from '../api/client';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './secure-storage';

interface SignupInput {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On boot, if we have a stored token, load /users/me to rehydrate the session.
  useEffect(() => {
    (async () => {
      const token = await getAccessToken();
      if (token) {
        try {
          const res = await api.get<{ data: User }>('/users/me');
          setUser(res.data.data);
        } catch {
          await clearTokens();
        }
      }
      setLoading(false);
    })();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await api.post<AuthResponse>('/users/login', {
      email,
      password,
    });
    await setTokens(res.data.token, res.data.refreshToken);
    setUser(res.data.data.user);
  }, []);

  const signUp = useCallback(async (input: SignupInput) => {
    const res = await api.post<AuthResponse>('/users/signup', input);
    await setTokens(res.data.token, res.data.refreshToken);
    setUser(res.data.data.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        await api.post('/users/logout', { refreshToken });
      }
    } catch {
      // We'll wipe local creds regardless.
    }
    await clearTokens();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
