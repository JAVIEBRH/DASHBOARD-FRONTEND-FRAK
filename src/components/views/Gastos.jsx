// src/components/views/Gastos.jsx
import { useMemo, useState } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { formatCLP, formatDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Gastos({ filteredTx, categoryMeta, onEdit }) {
  const [openCat, setOpenCat] = useState(null);

  const txs = filteredTx.filter(t => t.type === 'neg');
  const total = txs.reduce((s, t) => s + Math.abs(t.amount), 0);

  const categories = useMemo(() => {
    const map = {};
    txs.forEach(t => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return Object.entries(map)
      .map(([k, items]) => ({
        key: k,
        label: catLabel(categoryMeta, k),
        color: catColor(categoryMeta, k),
        value: items.reduce((s, t) => s + Math.abs(t.amount), 0),
        items,
      }))
      .sort((a, b) => b.value - a.value);
  }, [txs, categoryMeta]);

  const slices = categories.map(c => ({ label: c.label, value: c.value, color: c.color }));

  return (
    <div className="view">
      {slices.length > 0 && (
        <Card>
          <h3 className="section-title">Distribución de costos</h3>
          <DonutChart slices={slices} size={180} />
        </Card>
      )}
      <Card>
        <h3 className="section-title">Por categoría</h3>
        {categories.map(cat => (
          <div key={cat.key} className="accordion">
            <button className="accordion__header" onClick={() => setOpenCat(openCat === cat.key ? null : cat.key)}>
              <Badge label={cat.label} color={cat.color} />
              <span style={{ marginLeft: 'auto', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{formatCLP(cat.value)}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                {Math.round((cat.value / total) * 100)}%
              </span>
            </button>
            {openCat === cat.key && (
              <table className="tx-table accordion__body">
                <thead><tr><th>Fecha</th><th>Concepto</th><th className="tx-table__num">Monto</th><th /></tr></thead>
                <tbody>
                  {cat.items.map(t => (
                    <tr key={t.id} onClick={() => onEdit(t)} className="tx-table__row">
                      <td className="tx-table__date">{formatDate(t.date)}</td>
                      <td>{t.concepto}</td>
                      <td className="tx-table__num" style={{ color: '#EF4444' }}>{formatCLP(Math.abs(t.amount))}</td>
                      <td><span className="tx-table__edit">editar</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}
