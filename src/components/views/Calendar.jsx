// src/components/views/Calendar.jsx
import { useMemo } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { formatCLP, formatDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Calendar({ filteredTx, monthsOrder, categoryMeta, onEdit }) {
  const byMonth = useMemo(() => {
    return monthsOrder.map(m => {
      const txs = filteredTx.filter(t => t.month === m);
      const ing = txs.filter(t => t.type === 'pos').reduce((s, t) => s + t.amount, 0);
      const cos = txs.filter(t => t.type === 'neg').reduce((s, t) => s + Math.abs(t.amount), 0);
      return { m, txs, ing, cos };
    }).filter(({ txs }) => txs.length > 0);
  }, [filteredTx, monthsOrder]);

  if (!byMonth.length) return <div className="view"><p className="empty">Sin datos para este período.</p></div>;

  return (
    <div className="view">
      {byMonth.map(({ m, txs, ing, cos }) => (
        <Card key={m}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 className="section-title" style={{ margin: 0 }}>{m}</h3>
            <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
              <span style={{ color: '#0EA5E9' }}>+{formatCLP(ing)}</span>
              <span style={{ color: '#EF4444' }}>-{formatCLP(cos)}</span>
              <span style={{ color: ing - cos >= 0 ? '#10B981' : '#EF4444', fontWeight: 600 }}>{formatCLP(ing - cos)}</span>
            </div>
          </div>
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
        </Card>
      ))}
    </div>
  );
}
