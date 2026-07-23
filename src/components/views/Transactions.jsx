// src/components/views/Transactions.jsx
import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { fmtCLP, fmtDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Transactions({ filteredTx, categoryMeta, onEdit, monthsOrder, monthLabels }) {
  const [search, setSearch] = useState('');

  const txs = filteredTx.filter(t =>
    !search ||
    t.concepto?.toLowerCase().includes(search.toLowerCase()) ||
    catLabel(categoryMeta, t.category).toLowerCase().includes(search.toLowerCase())
  );

  // Agrupados por mes (con mini-resumen) para que una lista de cientos de
  // movimientos tenga puntos de referencia al recorrerla, en vez de un
  // scroll continuo sin quiebres.
  const groups = (monthsOrder ?? [])
    .map(m => ({
      m, label: monthLabels?.[m] ?? m, items: txs.filter(t => t.month === m),
    }))
    .filter(g => g.items.length > 0);
  const hasMonthData = groups.length > 0;

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
          {(hasMonthData ? groups : [{ m: '_all', label: null, items: txs }]).map(group => (
            <div key={group.m}>
              {group.label && (
                <div className="v-tx-month-head">
                  <span className="v-tx-month-label">{group.label}</span>
                  <span className="v-tx-month-stats">
                    <span style={{ color: 'var(--ink-3)' }}>{group.items.length} mov.</span>
                  </span>
                </div>
              )}
              {group.items.map((t, i) => {
                const isPos   = t.bucket === 'income';
                const isSocio = t.bucket === 'retiro_socio';
                const iconBg  = isPos ? 'rgba(24,160,88,.12)' : isSocio ? 'rgba(124,111,90,.10)' : 'rgba(212,58,42,.10)';
                const iconClr = isPos ? 'var(--signal-pos)' : isSocio ? 'var(--socio)' : 'var(--signal-neg)';
                const amtCls  = isPos ? 'pos' : isSocio ? 'socio' : 'neg';
                return (
                  <div key={t.id} className="v-tx-row" onClick={() => onEdit(t)} style={{ animationDelay: Math.min(i * 30, 300) + 'ms' }}>
                    <div className="v-tx-icon" style={{ background: iconBg, color: iconClr }}>
                      {isPos ? '↗' : isSocio ? '◌' : '↘'}
                    </div>
                    <div className="v-tx-main">
                      <div className="v-tx-concept" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        {t.concepto}
                        {t.id?.startsWith('manual-') && <span className="v-manual-badge">manual</span>}
                      </div>
                      <div className="v-tx-meta">{fmtDate(t.date)}</div>
                    </div>
                    <div className="v-tx-cat" style={{ color: catColor(categoryMeta, t.category) }}>{catLabel(categoryMeta, t.category)}</div>
                    <div className={`v-tx-amount ${amtCls}`}>
                      {isPos ? '+' : '−'}{fmtCLP(Math.abs(t.amount), { sign: false })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
