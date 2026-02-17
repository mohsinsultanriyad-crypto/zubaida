// api.ts
// Centralized API helper for FASTEP WORK
// Uses fetch, reads base URL from import.meta.env.VITE_API_BASE

export const API_BASE = import.meta.env.VITE_API_BASE;
if (!API_BASE) {
  console.error('VITE_API_BASE is missing! Set it in your environment variables.');
  throw new Error('VITE_API_BASE is missing!');
}
console.log('API_BASE', API_BASE);

function getToken() {
  return localStorage.getItem('fw_session_token');
}

async function apiRequest(method: string, path: string, body?: any) {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const options: RequestInit = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  console.log(`[API ${method}]`, url);
  const res = await fetch(url, options);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'API Error');
  }
  if (res.status === 204) return null;
  return res.json();
}

export function apiGet(path: string) {
  return apiRequest('GET', path);
}
export function apiPost(path: string, body?: any) {
  return apiRequest('POST', path, body);
}
export function apiPut(path: string, body?: any) {
  return apiRequest('PUT', path, body);
}
export function apiDelete(path: string) {
  return apiRequest('DELETE', path);
}
