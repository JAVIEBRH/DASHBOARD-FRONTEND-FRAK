// src/utils/categories.js
export const NAV_GROUPS = [
  { label: 'Vista principal', items: [
    { id: 'ingresos', label: 'INGRESOS', icon: 'arrow_up',   supreme: 'pos' },
    { id: 'costos',   label: 'COSTOS',   icon: 'arrow_down', supreme: 'neg' },
  ]},
  { label: 'General', items: [
    { id: 'overview',     label: 'Resumen',         icon: 'leaf'     },
    { id: 'transactions', label: 'Movimientos',     icon: 'rows'     },
    { id: 'calendar',     label: 'Vista mensual',   icon: 'calendar' },
    { id: 'gastos',       label: 'Costos',          icon: 'chart'    },
  ]},
  { label: 'Negocios', items: [
    { id: 'ave_austral', label: 'Ave Austral', icon: 'sparkle' },
  ]},
  { label: 'Operaciones', items: [
    { id: 'stock', label: 'Stock', icon: 'box' },
  ]},
  { label: 'Socio', items: [
    { id: 'socio', label: 'Mov. de socio', icon: 'wallet' },
  ]},
  { label: 'Plan', items: [
    { id: 'budget', label: 'Presupuesto 2026', icon: 'chart' },
  ]},
];

export function catColor(categoryMeta, cat) {
  return categoryMeta?.[cat]?.color ?? '#94A3B8';
}

export function catLabel(categoryMeta, cat) {
  return categoryMeta?.[cat]?.label ?? cat;
}

export function propMeta(properties, id) {
  return properties?.[id] ?? { name: id, color: '#94A3B8', initials: '?' };
}
