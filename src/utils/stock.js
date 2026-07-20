// src/utils/stock.js

export function zoneLabel(zones, zoneId) {
  return zones.find(z => z.id === zoneId)?.label ?? zoneId;
}

// Alertas de verdad (badge del sidebar, toast al cargar, umbral configurable) — solo aplican a
// consumibles. Un activo fijo (mesa, sofá) no "se agota con el uso", así que no tiene umbral:
// solo puede estar presente o faltante.
const UMBRAL_PCT_CRITICO = 60; // fixed for every product, per the 2026-07-21 design spec

export function isLowStockConsumible(item) {
  return item.qtyBodega <= item.umbralUnidades;
}

// Distinguishes "bajo" (need to restock soon) from "agotado" (about to
// have literally nothing) for consumables. Bodega above the threshold is
// always fine regardless of enUso %. Once bodega hits zero, the one thing
// left is whatever's in enUso — if any active unit is at or below the
// critical %, or there's nothing active either, that's "agotado"; if the
// active unit still has meaningful life left, it's "bajo" (empty bodega,
// but not literally out yet).
function consumibleSeverity(item) {
  if (item.qtyBodega > item.umbralUnidades) return 'ok';
  if (item.qtyBodega === 0) {
    const enUso = item.enUso ?? [];
    const hasCriticalUnit = enUso.length === 0 || enUso.some(u => u.pct <= UMBRAL_PCT_CRITICO);
    return hasCriticalUnit ? 'agotado' : 'bajo';
  }
  return 'bajo';
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
  if (isStockZone) return consumibleSeverity(item);
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
