import axios from 'axios';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

// ── TOKEN HELPERS ──────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  // try localStorage first (more reliable)
  return localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === 'undefined') return;

  // localStorage — for api interceptor
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);

  // cookies — for middleware (edge runtime)
  setCookie(TOKEN_KEY, accessToken, 15 * 60);
  setCookie(REFRESH_KEY, refreshToken, 7 * 24 * 60 * 60);
}

export function clearTokens() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);

  deleteCookie(TOKEN_KEY);
  deleteCookie(REFRESH_KEY);
}

// ── COOKIE HELPERS ─────────────────────────────────
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export function setCookie(name: string, value: string, maxAge: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function clearAuthCookies() {
  deleteCookie(TOKEN_KEY);
  deleteCookie(REFRESH_KEY);
}

// ── AXIOS INSTANCE ─────────────────────────────────
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
// ── attach access token ────────────────────────────
api.interceptors.request.use(
  (config) => {
    // read from localStorage (reliable) not cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ── auto-refresh on 401 ─────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null;

        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        // save new tokens
        setTokens(data.accessToken, data.refreshToken ?? refreshToken);

        // retry original request
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        // refresh failed — clear everything
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
