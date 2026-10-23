const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export async function api(path, options = {}) {
  const token = localStorage.getItem('credora_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the API. Check that the backend is running and VITE_API_URL is correct.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/register') {
      localStorage.removeItem('credora_token');
      localStorage.removeItem('credora_user');
      window.dispatchEvent(new Event('credora:unauthorized'));
    }
    throw new Error(data.message || 'The request could not be completed.');
  }
  return data;
}

export function jsonRequest(method, body) {
  return { method, body: JSON.stringify(body) };
}
