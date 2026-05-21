// src/components/views/Ingresos.jsx
import { useMemo } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { BarChart } from '../charts/BarChart.jsx';
import { fmtCLP, fmtDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Ingresos({ filteredTx, categoryMeta, onEdit, onAdd }) {
  const txs   = filteredTx.filter(t => t.type === 'pos');
  const total  = txs.reduce((s, t) => s + t.amount, 0);

  const byCategory = useMemo(() => {
    const map = {};
    txs.forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map)
      .map(([k, v]) => ({ label: catLabel(categoryMeta, k), value: v, color: catColor(categoryMeta, k) }))
      .sort((a, b) => b.value - a.value);
  }, [txs, categoryMeta]);

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Vista principal</div>
          <h1 className="v-section-title">Ingresos <em>del período</em>.</h1>
          <p className="v-section-sub">Todos los ingresos registrados: arriendo Airbnb, comisiones, artesanías y otros.</p>
        </div>
        <button className="v-btn primary" onClick={onAdd}><Icon name="plus" size={14} /> Nueva entrada</button>
      </div>

      <div className="v-kpi-row">
        <div className="v-card elev" style={{ gridColumn: '1 / -1' }}>
          <div className="v-kpi-label">Total ingresos</div>
          <div className="v-kpi-value pos"><span className="currency">$</span>{(total / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{txs.length} transacciones · {fmtCLP(total, { sign: false })}</div>
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="v-card" style={{ marginBottom: 24 }}>
          <div className="v-chart-head">
            <div className="v-chart-title">Por categoría</div>
          </div>
          <BarChart bars={byCategory} />
        </div>
      )}

      <div className="v-card">
        <div className="v-chart-head">
          <div>
            <div className="v-chart-title">Movimientos</div>
            <div className="v-chart-sub">{txs.length} registros</div>
          </div>
        </div>
        <div className="v-tx-list">
          {txs.length === 0 && <div className="v-empty">Sin ingresos en este período.</div>}
          {txs.map((t, i) => (
            <div key={t.id} className="v-tx-row" onClick={() => onEdit(t)} style={{ animationDelay: (i * 40) + 'ms' }}>
              <div className="v-tx-icon" style={{ background: 'rgba(24,160,88,.12)', color: 'var(--signal-pos)' }}>↗</div>
              <div className="v-tx-main">
                <div className="v-tx-concept" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  {t.concepto}
                  {t.id?.startsWith('manual-') && <span className="v-manual-badge">manual</span>}
                </div>
                <div className="v-tx-meta">{fmtDate(t.date)}</div>
              </div>
              <div className="v-tx-cat" style={{ color: catColor(categoryMeta, t.category) }}>{catLabel(categoryMeta, t.category)}</div>
              <div className="v-tx-amount pos">+{fmtCLP(t.amount, { sign: false })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
