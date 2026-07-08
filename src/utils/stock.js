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

export function isLowStockConsumible(item) {
  return item.qtyBodega <= item.umbralUnidades || (item.pctEnUso != null && item.pctEnUso <= 15);
}

export function isLowStockFurniture(item) {
  return item.qty <= item.umbralUnidades;
}

export const STATUS_META = {
  agotado: { label: 'Agotado',    color: 'var(--signal-neg)' },
  bajo:    { label: 'Bajo Stock', color: 'var(--jat)' },
  ok:      { label: 'En Stock',   color: 'var(--signal-pos)' },
};

export function stockStatus(item, isStockZone) {
  const qty = isStockZone ? item.qtyBodega : item.qty;
  if (qty === 0) return 'agotado';
  const low = isStockZone ? isLowStockConsumible(item) : isLowStockFurniture(item);
  return low ? 'bajo' : 'ok';
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
