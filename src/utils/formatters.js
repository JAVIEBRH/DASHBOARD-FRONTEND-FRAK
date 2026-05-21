// src/utils/formatters.js
export function formatCLP(n) {
  if (n == null) return '—';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

export function formatDate(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-');
  return `${d}/${m}/${y}`;
}

export function pct(part, total) {
  if (!total) return 0;
  return Math.round((Math.abs(part) / Math.abs(total)) * 100);
}
