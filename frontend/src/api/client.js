const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

function getAdminKey() {
  return localStorage.getItem('webhook_admin_key') || '';
}

export function setAdminKey(key) {
  localStorage.setItem('webhook_admin_key', key);
}

export function getStoredAdminKey() {
  return getAdminKey();
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return res.json();
}

// --- Health ---
export async function fetchHealth() {
  return request('/health');
}

// --- Deliveries ---
export async function fetchDeliveries() {
  return request('/api/deliveries');
}

// --- Failures ---
export async function fetchFailures() {
  return request('/api/failures');
}

// --- Recover a delivery ---
export async function recoverDelivery(deliveryId) {
  return request(`/api/recover/${deliveryId}`, {
    method: 'POST',
    headers: {
      'x-admin-key': getAdminKey(),
    },
  });
}

// --- Recovery status ---
export async function fetchRecoveryStatus(deliveryId) {
  return request(`/api/recovery/status/${deliveryId}`);
}
