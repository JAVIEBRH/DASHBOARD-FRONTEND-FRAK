// src/components/views/Calendar.jsx
import { useMemo } from 'react';
import { fmtCLP, fmtDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Calendar({ filteredTx, monthsOrder, monthLabels, categoryMeta, onEdit }) {
  const byMonth = useMemo(() => {
    return monthsOrder.map(m => {
      const txs = filteredTx.filter(t => t.month === m);
      const ing = txs.filter(t => t.bucket === 'income').reduce((s, t) => s + t.amount, 0);
      const cos = txs.filter(t => t.bucket === 'expense_op').reduce((s, t) => s + t.amount, 0);
      return { m, txs, ing, cos, net: ing + cos, label: monthLabels?.[m] ?? m };
    }).filter(x => x.txs.length > 0);
  }, [filteredTx, monthsOrder, monthLabels]);

  if (!byMonth.length) return (
    <div>
      <div className="v-section-head"><div><div className="v-eyebrow">General</div><h1 className="v-section-title">Vista <em>mensual</em>.</h1></div></div>
      <div className="v-empty">Sin datos para este período.</div>
    </div>
  );

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">General</div>
          <h1 className="v-section-title">Vista <em>mensual</em>.</h1>
          <p className="v-section-sub">Detalle de movimientos mes a mes.</p>
        </div>
      </div>
      {byMonth.map(({ m, txs, ing, cos, net, label }) => (
        <div key={m} className="v-card" style={{ marginBottom: 18 }}>
          <div className="v-chart-head">
            <div>
              <div className="v-chart-title">{label}</div>
              <div className="v-chart-sub" style={{ display: 'flex', gap: 16 }}>
                <span style={{ color: 'var(--signal-pos)' }}>+{fmtCLP(ing, { sign: false })}</span>
                <span style={{ color: 'var(--signal-neg)' }}>{fmtCLP(cos)}</span>
                <span style={{ color: net >= 0 ? 'var(--signal-pos)' : 'var(--signal-neg)', fontWeight: 600 }}>= {fmtCLP(net)}</span>
              </div>
            </div>
          </div>
          <div className="v-tx-list">
            {txs.map((t, i) => {
              const isPos = t.bucket === 'income';
              return (
                <div key={t.id} className="v-tx-row" onClick={() => onEdit(t)} style={{ animationDelay: (i * 30) + 'ms' }}>
                  <div className="v-tx-icon" style={{ background: isPos ? 'rgba(24,160,88,.12)' : 'rgba(212,58,42,.10)', color: isPos ? 'var(--signal-pos)' : 'var(--signal-neg)' }}>
                    {isPos ? '↗' : '↘'}
                  </div>
                  <div className="v-tx-main">
                    <div className="v-tx-concept">{t.concepto}</div>
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
      ))}
    </div>
  );
}
