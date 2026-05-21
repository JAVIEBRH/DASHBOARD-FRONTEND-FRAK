// src/components/views/Transactions.jsx
import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { fmtCLP, fmtDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Transactions({ filteredTx, categoryMeta, onEdit }) {
  const [search, setSearch] = useState('');

  const txs = filteredTx.filter(t =>
    !search ||
    t.concepto?.toLowerCase().includes(search.toLowerCase()) ||
    catLabel(categoryMeta, t.category).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">General</div>
          <h1 className="v-section-title">Movimientos <em>registrados</em>.</h1>
        </div>
      </div>
      <div className="v-card">
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icon name="search" size={14} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="v-input" style={{ paddingLeft: 36 }} placeholder="Buscar concepto o categoría…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>{txs.length} registros</span>
        </div>
        <div className="v-tx-list">
          {txs.length === 0 && <div className="v-empty">Sin movimientos.</div>}
          {txs.map((t, i) => {
            const isPos = t.type === 'pos';
            return (
              <div key={t.id} className="v-tx-row" onClick={() => onEdit(t)} style={{ animationDelay: Math.min(i * 30, 300) + 'ms' }}>
                <div className="v-tx-icon" style={{ background: isPos ? 'rgba(24,160,88,.12)' : 'rgba(212,58,42,.10)', color: isPos ? 'var(--signal-pos)' : 'var(--signal-neg)' }}>
                  {isPos ? '↗' : '↘'}
                </div>
                <div className="v-tx-main">
                  <div className="v-tx-concept" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {t.concepto}
                    {t.id?.startsWith('manual-') && <span className="v-manual-badge">manual</span>}
                  </div>
                  <div className="v-tx-meta">{fmtDate(t.date)}</div>
                </div>
                <div className="v-tx-cat" style={{ color: catColor(categoryMeta, t.category) }}>{catLabel(categoryMeta, t.category)}</div>
                <div className={`v-tx-amount ${isPos ? 'pos' : 'neg'}`}>
                  {isPos ? '+' : '−'}{fmtCLP(Math.abs(t.amount), { sign: false })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
