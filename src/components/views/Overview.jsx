// src/components/views/Overview.jsx
import { useMemo } from 'react';
import { KpiCard } from '../ui/KpiCard.jsx';
import { Card } from '../ui/Card.jsx';
import { MonthBar } from '../charts/MonthBar.jsx';
import { formatCLP } from '../../utils/formatters.js';

export function Overview({ filteredTx, transactions, monthsOrder, period, setPeriod }) {
  const { ingresos, costos, neto, margen } = useMemo(() => {
    const ing = filteredTx.filter(t => t.type === 'pos').reduce((s, t) => s + t.amount, 0);
    const cos = filteredTx.filter(t => t.type === 'neg').reduce((s, t) => s + Math.abs(t.amount), 0);
    return { ingresos: ing, costos: cos, neto: ing - cos, margen: ing ? Math.round(((ing - cos) / ing) * 100) : 0 };
  }, [filteredTx]);

  return (
    <div className="view">
      <div className="kpi-grid">
        <KpiCard label="Ingresos" value={ingresos} icon="arrow_up" accent="#0EA5E9" />
        <KpiCard label="Costos" value={costos} icon="arrow_down" accent="#EF4444" />
        <KpiCard label="Resultado neto" value={neto} icon="sparkle" accent={neto >= 0 ? '#10B981' : '#EF4444'} />
        <KpiCard label="Margen" value={null} icon="chart" accent="#6366F1"
          sub={`${margen}%`} />
      </div>
      <Card>
        <h3 className="section-title">Evolución mensual</h3>
        <MonthBar months={monthsOrder} transactions={transactions} selected={period} onSelect={setPeriod} />
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--accent)', display: 'inline-block' }} /> Ingresos
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: 'var(--border-strong)', display: 'inline-block' }} /> Costos
          </span>
        </div>
      </Card>
    </div>
  );
}
