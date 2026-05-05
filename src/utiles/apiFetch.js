export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let data = null;
    try { data = JSON.parse(text); } catch { /* réponse non-JSON */ }
    const err = new Error(data?.message || text || `Erreur ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  if (res.status === 204) return null;
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}
