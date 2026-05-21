// src/components/views/Transactions.jsx
import { useState } from 'react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { Icon } from '../ui/Icon.jsx';
import { formatCLP, formatDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Transactions({ filteredTx, categoryMeta, onEdit }) {
  const [search, setSearch] = useState('');

  const txs = filteredTx.filter(t =>
    !search || t.concepto?.toLowerCase().includes(search.toLowerCase()) ||
    catLabel(categoryMeta, t.category).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="view">
      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icon name="rows" size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: 32 }} placeholder="Buscar concepto o categoría…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{txs.length} movimientos</span>
        </div>
        {txs.length === 0 ? (
          <p className="empty">Sin movimientos.</p>
        ) : (
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
                  <td className="tx-table__num" style={{ color: t.amount >= 0 ? '#0EA5E9' : '#EF4444' }}>
                    {formatCLP(t.amount)}
                  </td>
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
