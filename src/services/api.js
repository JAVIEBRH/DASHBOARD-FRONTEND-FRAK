// src/services/api.js
const BASE = import.meta.env.VITE_API_URL;

async function json(res) {
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export const api = {
  getData: () =>
    fetch(`${BASE}/api/data`).then(json),

  createTx: (data) =>
    fetch(`${BASE}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  updateTx: (id, data) =>
    fetch(`${BASE}/api/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  deleteTx: (id) =>
    fetch(`${BASE}/api/transactions/${id}`, { method: 'DELETE' }).then(json),

  exportUrl: (params) =>
    `${BASE}/api/export/excel?${new URLSearchParams(params)}`,
};
