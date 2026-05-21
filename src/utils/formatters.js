// src/utils/formatters.js

export function fmtCLP(n, { compact = false, sign = true } = {}) {
  if (n == null) return '—';
  const abs = Math.abs(n);
  let body;
  if (compact && abs >= 1_000_000)
    body = (abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2).replace('.', ',').replace(/,00$/, '') + 'M';
  else if (compact && abs >= 1_000)
    body = Math.round(abs / 1_000) + 'k';
  else
    body = abs.toLocaleString('es-CL', { maximumFractionDigits: 0 });
  body = '$' + body;
  if (n < 0 && sign) return '−' + body;
  return body;
}

export function fmtCLPParts(n, { compact = false } = {}) {
  const abs = Math.abs(n ?? 0);
  let body;
  if (compact && abs >= 1_000_000)
    body = (abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2).replace('.', ',').replace(/,00$/, '') + 'M';
  else
    body = abs.toLocaleString('es-CL', { maximumFractionDigits: 0 });
  return { currency: '$', body, sign: (n ?? 0) < 0 ? '−' : '' };
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T12:00:00');
  const day = d.getDate().toString().padStart(2, '0');
  const mon = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][d.getMonth()];
  return `${day} ${mon}`;
}

export function pct(part, total) {
  if (!total) return 0;
  return Math.round((Math.abs(part) / Math.abs(total)) * 100);
}

// Legacy aliases
export const formatCLP = (n) => fmtCLP(n);
export const formatDate = fmtDate;
