// src/components/views/Ingresos.jsx
import { useMemo } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { BarChart } from '../charts/BarChart.jsx';
import { formatCLP, formatDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Ingresos({ filteredTx, categoryMeta, onEdit }) {
  const txs = filteredTx.filter(t => t.type === 'pos');
  const total = txs.reduce((s, t) => s + t.amount, 0);

  const byCategory = useMemo(() => {
    const map = {};
    txs.forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map)
      .map(([k, v]) => ({ label: catLabel(categoryMeta, k), value: v, color: catColor(categoryMeta, k) }))
      .sort((a, b) => b.value - a.value);
  }, [txs, categoryMeta]);

  return (
    <div className="view">
      <div className="kpi-grid">
        <div className="kpi-card" style={{ gridColumn: '1 / -1' }}>
          <span className="kpi-card__label">Total ingresos</span>
          <span className="kpi-card__value" style={{ color: '#0EA5E9' }}>{formatCLP(total)}</span>
        </div>
      </div>
      {byCategory.length > 0 && (
        <Card>
          <h3 className="section-title">Por categoría</h3>
          <BarChart bars={byCategory} color="#0EA5E9" />
        </Card>
      )}
      <Card>
        <h3 className="section-title">Movimientos</h3>
        <TxTable txs={txs} categoryMeta={categoryMeta} onEdit={onEdit} />
      </Card>
    </div>
  );
}

function TxTable({ txs, categoryMeta, onEdit }) {
  if (!txs.length) return <p className="empty">Sin movimientos en este período.</p>;
  return (
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
            <td className="tx-table__num" style={{ color: '#0EA5E9' }}>{formatCLP(t.amount)}</td>
            <td><span className="tx-table__edit">editar</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
