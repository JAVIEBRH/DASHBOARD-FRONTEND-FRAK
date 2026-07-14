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

  createStock: (data) =>
    fetch(`${BASE}/api/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  updateStock: (id, data) =>
    fetch(`${BASE}/api/stock/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  deleteStock: (id) =>
    fetch(`${BASE}/api/stock/${id}`, { method: 'DELETE' }).then(json),

  createFurniture: (data) =>
    fetch(`${BASE}/api/furniture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  updateFurniture: (id, data) =>
    fetch(`${BASE}/api/furniture/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  deleteFurniture: (id) =>
    fetch(`${BASE}/api/furniture/${id}`, { method: 'DELETE' }).then(json),

  createProperty: (data) =>
    fetch(`${BASE}/api/properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  createEstadia: (data) =>
    fetch(`${BASE}/api/airbnb?resource=estadias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  updateEstadia: (id, data) =>
    fetch(`${BASE}/api/airbnb?resource=estadias&id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  deleteEstadia: (id) =>
    fetch(`${BASE}/api/airbnb?resource=estadias&id=${id}`, { method: 'DELETE' }).then(json),

  createLimpieza: (data) =>
    fetch(`${BASE}/api/airbnb?resource=limpiezas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  updateLimpieza: (id, data) =>
    fetch(`${BASE}/api/airbnb?resource=limpiezas&id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  deleteLimpieza: (id) =>
    fetch(`${BASE}/api/airbnb?resource=limpiezas&id=${id}`, { method: 'DELETE' }).then(json),

  createKanbanTask: (data) =>
    fetch(`${BASE}/api/airbnb?resource=kanban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  updateKanbanTask: (id, data) =>
    fetch(`${BASE}/api/airbnb?resource=kanban&id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(json),

  deleteKanbanTask: (id) =>
    fetch(`${BASE}/api/airbnb?resource=kanban&id=${id}`, { method: 'DELETE' }).then(json),

  exportUrl: (params) =>
    `${BASE}/api/export/excel?${new URLSearchParams(params)}`,
};
