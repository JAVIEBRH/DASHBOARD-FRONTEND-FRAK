// src/components/views/AveAustral.jsx
import { useMemo } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { KpiCard } from '../ui/KpiCard.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { formatCLP, formatDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

const PROP_ID = 'ave_austral';

export function AveAustral({ filteredTx, categoryMeta, onEdit }) {
  const txs = filteredTx.filter(t => t.property === PROP_ID);
  const ing = txs.filter(t => t.type === 'pos').reduce((s, t) => s + t.amount, 0);
  const cos = txs.filter(t => t.type === 'neg').reduce((s, t) => s + Math.abs(t.amount), 0);

  const slices = useMemo(() => {
    const map = {};
    txs.filter(t => t.type === 'neg').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + Math.abs(t.amount);
    });
    return Object.entries(map)
      .map(([k, v]) => ({ label: catLabel(categoryMeta, k), value: v, color: catColor(categoryMeta, k) }))
      .sort((a, b) => b.value - a.value);
  }, [txs, categoryMeta]);

  return (
    <div className="view">
      <div className="kpi-grid">
        <KpiCard label="Ingresos" value={ing} icon="arrow_up" accent="#0EA5E9" />
        <KpiCard label="Costos" value={cos} icon="arrow_down" accent="#EF4444" />
        <KpiCard label="Resultado" value={ing - cos} icon="sparkle" accent={ing - cos >= 0 ? '#10B981' : '#EF4444'} />
      </div>
      {slices.length > 0 && (
        <Card>
          <h3 className="section-title">Distribución de costos</h3>
          <DonutChart slices={slices} size={180} />
        </Card>
      )}
      <Card>
        <h3 className="section-title">Movimientos</h3>
        {txs.length === 0 ? <p className="empty">Sin movimientos para Ave Austral en este período.</p> : (
          <table className="tx-table">
            <thead><tr>
              <th>Fecha</th><th>Concepto</th><th>Categoría</th><th className="tx-table__num">Monto</th><th />
            </tr></thead>
            <tbody>
              {txs.map(t => (
                <tr key={t.id} onClick={() => onEdit(t)} className="tx-table__row">
                  <td className="tx-table__date">{formatDate(t.date)}</td>
                  <td>{t.concepto}</td>
                  <td><Badge label={catLabel(categoryMeta, t.category)} color={catColor(categoryMeta, t.category)} /></td>
                  <td className="tx-table__num" style={{ color: t.amount >= 0 ? '#0EA5E9' : '#EF4444' }}>{formatCLP(t.amount)}</td>
                  <td><span className="tx-table__edit">editar</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
