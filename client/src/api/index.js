/**
 * SentinelRAG-X — Centralized API Client
 * Auto-attaches JWT, handles errors consistently.
 */

const BASE_URL = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token') || '';
}

function authHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
    ...extra,
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: options.headers || authHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
  return data;
}

// ── Auth ────────────────────────────────────────────────────
export const authApi = {
  login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  register(name, email, password, role) {
    return request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  me() {
    return request('/auth/me');
  },
};

// ── Documents ───────────────────────────────────────────────
export const documentsApi = {
  list() {
    return request('/documents');
  },

  upload(file) {
    const form = new FormData();
    form.append('file', file);
    return fetch(`${BASE_URL}/documents`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      return data;
    });
  },

  grantPermission(documentId, userId) {
    return request(`/documents/${documentId}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  revokePermission(documentId, userId) {
    return request(`/documents/${documentId}/permissions/${userId}`, {
      method: 'DELETE',
    });
  },

  delete(documentId) {
    return request(`/documents/${documentId}`, { method: 'DELETE' });
  },
};

// ── Sentinel / Quarantine ───────────────────────────────────
export const sentinelApi = {
  quarantine(chunkId, reason) {
    return request(`/chunks/${chunkId}/quarantine`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'quarantine', reason }),
    });
  },

  restore(chunkId, reason) {
    return request(`/chunks/${chunkId}/quarantine`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'restore', reason }),
    });
  },
};

// ── Chat / RAG ──────────────────────────────────────────────
export const chatApi = {
  query(question) {
    return request('/chat/query', {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  },
};

// ── Audit ───────────────────────────────────────────────────
export const auditApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`/audit${qs ? `?${qs}` : ''}`);
  },
};

// ── Health ──────────────────────────────────────────────────
export const healthApi = {
  api()  { return request('/health'); },
  ai()   { return request('/ai/health'); },
};
