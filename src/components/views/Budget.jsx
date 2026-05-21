// src/components/views/Budget.jsx
import { useMemo } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { BarChart } from '../charts/BarChart.jsx';
import { KpiCard } from '../ui/KpiCard.jsx';
import { formatCLP } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Budget({ transactions, categoryMeta }) {
  const txs2026 = transactions?.filter(t => t.month?.endsWith('-26')) ?? [];
  const txs2025 = transactions?.filter(t => t.month?.endsWith('-25')) ?? [];

  const { ing26, cos26, ing25, cos25 } = useMemo(() => ({
    ing26: txs2026.filter(t => t.type === 'pos').reduce((s, t) => s + t.amount, 0),
    cos26: txs2026.filter(t => t.type === 'neg').reduce((s, t) => s + Math.abs(t.amount), 0),
    ing25: txs2025.filter(t => t.type === 'pos').reduce((s, t) => s + t.amount, 0),
    cos25: txs2025.filter(t => t.type === 'neg').reduce((s, t) => s + Math.abs(t.amount), 0),
  }), [txs2026, txs2025]);

  const catBars = useMemo(() => {
    const map = {};
    txs2026.filter(t => t.type === 'neg').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + Math.abs(t.amount);
    });
    return Object.entries(map)
      .map(([k, v]) => ({ label: catLabel(categoryMeta, k), value: v, color: catColor(categoryMeta, k) }))
      .sort((a, b) => b.value - a.value);
  }, [txs2026, categoryMeta]);

  return (
    <div className="view">
      <h2 className="section-title" style={{ fontSize: 18 }}>Presupuesto 2026</h2>
      <div className="kpi-grid">
        <KpiCard label="Ingresos 2026" value={ing26} icon="arrow_up" accent="#0EA5E9" />
        <KpiCard label="Costos 2026" value={cos26} icon="arrow_down" accent="#EF4444" />
        <KpiCard label="Resultado 2026" value={ing26 - cos26} icon="sparkle" accent={ing26 - cos26 >= 0 ? '#10B981' : '#EF4444'} />
      </div>
      <Card>
        <h3 className="section-title">Comparación vs 2025</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Ingresos</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0EA5E9' }}>{formatCLP(ing26)}</div>
            {ing25 > 0 && <div style={{ fontSize: 12, color: ing26 >= ing25 ? '#10B981' : '#EF4444' }}>
              {ing26 >= ing25 ? '▲' : '▼'} {Math.abs(Math.round(((ing26 - ing25) / ing25) * 100))}% vs 2025
            </div>}
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Costos</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#EF4444' }}>{formatCLP(cos26)}</div>
            {cos25 > 0 && <div style={{ fontSize: 12, color: cos26 <= cos25 ? '#10B981' : '#EF4444' }}>
              {cos26 <= cos25 ? '▼' : '▲'} {Math.abs(Math.round(((cos26 - cos25) / cos25) * 100))}% vs 2025
            </div>}
          </div>
        </div>
      </Card>
      {catBars.length > 0 && (
        <Card>
          <h3 className="section-title">Costos por categoría 2026</h3>
          <BarChart bars={catBars} />
        </Card>
      )}
    </div>
  );
}
