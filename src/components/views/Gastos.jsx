// src/components/views/Gastos.jsx
import { useMemo, useState } from 'react';
import { DonutChart } from '../charts/DonutChart.jsx';
import { Icon } from '../ui/Icon.jsx';
import { fmtCLP, fmtDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Gastos({ filteredTx, categoryMeta, onEdit }) {
  const [openCat, setOpenCat] = useState(null);

  const txs   = filteredTx.filter(t => t.bucket === 'expense_op');
  const total  = txs.reduce((s, t) => s + Math.abs(t.amount), 0);

  const categories = useMemo(() => {
    const map = {};
    txs.forEach(t => {
      if (!map[t.category]) map[t.category] = [];
      map[t.category].push(t);
    });
    return Object.entries(map).map(([k, items]) => ({
      key: k,
      label: catLabel(categoryMeta, k),
      color: catColor(categoryMeta, k),
      value: items.reduce((s, t) => s + Math.abs(t.amount), 0),
      items,
    })).sort((a, b) => b.value - a.value);
  }, [txs, categoryMeta]);

  const slices = categories.map(c => ({ label: c.label, value: c.value, color: c.color }));

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">General</div>
          <h1 className="v-section-title">Costos <em>por categoría</em>.</h1>
          <p className="v-section-sub">Desglose de todos los gastos operativos agrupados por categoría.</p>
        </div>
      </div>

      {slices.length > 0 && (
        <div className="v-grid-2" style={{ marginBottom: 24 }}>
          <div className="v-card">
            <div className="v-chart-head">
              <div className="v-chart-title">Distribución</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative' }}>
                <DonutChart data={slices} size={200} thickness={30} />
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', pointerEvents: 'none' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Total</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, marginTop: 4 }}>{fmtCLP(total, { compact: true, sign: false })}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="v-card">
            <div className="v-chart-title" style={{ marginBottom: 16 }}>Por categoría</div>
            {categories.map((c, i) => (
              <div key={c.key} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c.color, display: 'inline-block' }} />
                    {c.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: c.color }}>{fmtCLP(c.value, { compact: true, sign: false })}</span>
                </div>
                <div style={{ height: 5, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
                  <div className="v-bar-fill" style={{ width: `${(c.value / total) * 100}%`, height: '100%', background: c.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="v-card">
        <div className="v-chart-head" style={{ marginBottom: 0 }}>
          <div className="v-chart-title">Detalle por categoría</div>
        </div>
        {categories.map(cat => (
          <div key={cat.key}>
            <button className="v-gastos-cat-row" onClick={() => setOpenCat(openCat === cat.key ? null : cat.key)}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: 'var(--ink)', textAlign: 'left' }}>{cat.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: cat.color }}>{fmtCLP(cat.value, { compact: true, sign: false })}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-3)', marginLeft: 8 }}>{Math.round((cat.value / total) * 100)}%</span>
              <Icon name={openCat === cat.key ? 'chevron_down' : 'chevron_right'} size={13} color="var(--ink-3)" />
            </button>
            {openCat === cat.key && (
              <div style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--line)' }}>
                {cat.items.map((t, i) => (
                  <div key={t.id} className="v-gastos-tx-row" onClick={() => onEdit(t)}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-3)', width: 60, flexShrink: 0 }}>{fmtDate(t.date)}</span>
                    <span style={{ flex: 1, fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.concepto}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--signal-neg)' }}>−{fmtCLP(Math.abs(t.amount), { sign: false })}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {categories.length === 0 && <div className="v-empty">Sin gastos en este período.</div>}
      </div>
    </div>
  );
}
