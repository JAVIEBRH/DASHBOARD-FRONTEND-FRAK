// src/utils/stock.js
export const ZONES = [
  { id: 'stock',       label: 'Stock' },
  { id: 'living',      label: 'Living' },
  { id: 'comedor',     label: 'Comedor' },
  { id: 'cocina',      label: 'Cocina' },
  { id: 'baño',        label: 'Baño' },
  { id: 'lavanderia',  label: 'Lavandería' },
  { id: 'dormitorio1', label: 'Dormitorio 1' },
  { id: 'dormitorio2', label: 'Dormitorio 2' },
  { id: 'dormitorio3', label: 'Dormitorio 3' },
];

export function zoneLabel(zoneId) {
  return ZONES.find(z => z.id === zoneId)?.label ?? zoneId;
}

// Alertas de verdad (badge del sidebar, toast al cargar, umbral configurable) — solo aplican a
// consumibles. Un activo fijo (mesa, sofá) no "se agota con el uso", así que no tiene umbral:
// solo puede estar presente o faltante.
export function isLowStockConsumible(item) {
  return item.qtyBodega <= item.umbralUnidades || (item.pctEnUso != null && item.pctEnUso <= 15);
}

// Vocabulario de consumibles: 3 estados con umbral.
export const STATUS_META = {
  agotado: { label: 'Agotado',    color: 'var(--signal-neg)' },
  bajo:    { label: 'Bajo Stock', color: 'var(--jat)' },
  ok:      { label: 'En Stock',   color: 'var(--signal-pos)' },
};

// Vocabulario de activos fijos: 2 estados, sin umbral — o está o falta.
export const ASSET_STATUS_META = {
  agotado: { label: 'Faltante', color: 'var(--signal-neg)' },
  ok:      { label: 'Presente', color: 'var(--signal-pos)' },
};

export function statusMeta(status, isStockZone) {
  return (isStockZone ? STATUS_META : ASSET_STATUS_META)[status];
}

export function stockStatus(item, isStockZone) {
  if (isStockZone) {
    if (item.qtyBodega === 0) return 'agotado';
    return isLowStockConsumible(item) ? 'bajo' : 'ok';
  }
  // Activos fijos: sin estado "bajo", solo presente (ok) o faltante (agotado).
  return item.qty === 0 ? 'agotado' : 'ok';
}

export function zoneStats(items, isStockZone) {
  let agotados = 0, bajoStock = 0;
  for (const item of items) {
    const status = stockStatus(item, isStockZone);
    if (status === 'agotado') agotados++;
    else if (status === 'bajo') bajoStock++;
  }
  return { total: items.length, agotados, bajoStock };
}
