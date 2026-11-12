// The one place that talks to the backend: adds the token, turns errors into readable messages.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const KEY = 'auth';

export const getAuth = () => { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } };
export const setAuth = (a) => (a ? sessionStorage.setItem(KEY, JSON.stringify(a)) : sessionStorage.removeItem(KEY));

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const auth = getAuth();
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(auth && { Authorization: `Bearer ${auth.token}` }),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check that the backend is running.');
  }
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/api/auth/login')) onUnauthorized(); // token expired or invalid
    const fields = data?.fieldErrors ? Object.values(data.fieldErrors).join(' ') : '';
    throw new Error(fields || data?.message || `Request failed (${res.status}).`);
  }
  return data;
}
