// src/components/views/Socio.jsx
import { useMemo } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { KpiCard } from '../ui/KpiCard.jsx';
import { formatCLP, formatDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

const SOCIO_CATS = ['APORTE_SOCIOS', 'RETIROS'];

export function Socio({ filteredTx, categoryMeta, properties, onEdit }) {
  const txs = filteredTx.filter(t => SOCIO_CATS.includes(t.category));

  const { aportes, retiros } = useMemo(() => ({
    aportes: txs.filter(t => t.category === 'APORTE_SOCIOS').reduce((s, t) => s + t.amount, 0),
    retiros: txs.filter(t => t.category === 'RETIROS').reduce((s, t) => s + Math.abs(t.amount), 0),
  }), [txs]);

  const byProperty = useMemo(() => {
    const map = {};
    txs.forEach(t => {
      const k = t.property || 'general';
      if (!map[k]) map[k] = [];
      map[k].push(t);
    });
    return map;
  }, [txs]);

  return (
    <div className="view">
      <div className="kpi-grid">
        <KpiCard label="Aportes de socios" value={aportes} icon="arrow_up" accent="#A855F7" />
        <KpiCard label="Retiros" value={retiros} icon="arrow_down" accent="#7C3AED" />
        <KpiCard label="Neto socio" value={aportes - retiros} icon="wallet" accent={aportes - retiros >= 0 ? '#10B981' : '#EF4444'} />
      </div>
      {Object.entries(byProperty).map(([propId, propTxs]) => {
        const meta = properties?.[propId] ?? { name: propId, color: '#94A3B8' };
        return (
          <Card key={propId}>
            <h3 className="section-title" style={{ color: meta.color }}>{meta.name}</h3>
            <table className="tx-table">
              <thead><tr>
                <th>Fecha</th><th>Concepto</th><th>Categoría</th><th className="tx-table__num">Monto</th><th />
              </tr></thead>
              <tbody>
                {propTxs.map(t => (
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
        );
      })}
      {txs.length === 0 && <p className="empty">Sin movimientos de socio en este período.</p>}
    </div>
  );
}
