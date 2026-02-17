// api.ts
// Centralized API helper for FASTEP WORK
// Uses fetch, reads base URL from import.meta.env.VITE_API_BASE

export const API_BASE = import.meta.env.VITE_API_BASE;

function getToken() {
  return localStorage.getItem('fw_session_token');
}

async function request(method: string, url: string, data?: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options: RequestInit = {
    method,
    headers,
    ...(data && { body: JSON.stringify(data) })
  };

  const res = await fetch(`${API_BASE}${url}`, options);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || 'API Error');
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (url: string) => request('GET', url),
  post: (url: string, data?: any) => request('POST', url, data),
  put: (url: string, data?: any) => request('PUT', url, data),
  delete: (url: string) => request('DELETE', url),
};
