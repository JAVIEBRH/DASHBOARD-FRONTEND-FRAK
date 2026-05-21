// src/components/views/AveAustral.jsx
import { useMemo } from 'react';
import { DonutChart } from '../charts/DonutChart.jsx';
import { BarChart } from '../charts/BarChart.jsx';
import { fmtCLP, fmtDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function AveAustral({ filteredTx, categoryMeta, onEdit }) {
  const txs = filteredTx.filter(t => t.category === 'ARTESANIAS');
  const ing  = txs.filter(t => t.bucket === 'income').reduce((s, t) => s + t.amount, 0);
  const cos  = txs.filter(t => t.bucket === 'expense_op').reduce((s, t) => s + Math.abs(t.amount), 0);

  const slices = useMemo(() => {
    const map = {};
    txs.filter(t => t.bucket === 'expense_op').forEach(t => { map[t.category] = (map[t.category] ?? 0) + Math.abs(t.amount); });
    return Object.entries(map).map(([k, v]) => ({ label: catLabel(categoryMeta, k), value: v, color: catColor(categoryMeta, k) })).sort((a, b) => b.value - a.value);
  }, [txs, categoryMeta]);

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Negocios</div>
          <h1 className="v-section-title">Ave Austral <em>· Artesanías</em>.</h1>
          <p className="v-section-sub">Movimientos asociados al negocio de artesanías Ave Austral.</p>
        </div>
      </div>

      <div className="v-kpi-hero">
        <div className="v-kpi-cell primary">
          <div className="v-kpi-label">Resultado</div>
          <div className="v-kpi-value"><span className="currency">$</span>{((ing - cos) / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{ing - cos >= 0 ? 'Positivo' : 'Negativo'}</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Ingresos</div>
          <div className="v-kpi-value pos"><span className="currency">$</span>{(ing / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{fmtCLP(ing, { sign: false })}</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Costos</div>
          <div className="v-kpi-value neg"><span className="currency">$</span>{(cos / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{fmtCLP(cos, { sign: false })}</div>
        </div>
      </div>

      {slices.length > 0 && (
        <div className="v-grid-2" style={{ marginBottom: 24 }}>
          <div className="v-card">
            <div className="v-chart-head"><div className="v-chart-title">Distribución de costos</div></div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative' }}>
                <DonutChart data={slices} size={200} thickness={30} />
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', pointerEvents: 'none' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18 }}>{fmtCLP(cos, { compact: true, sign: false })}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="v-card">
            <div className="v-chart-head"><div className="v-chart-title">Por categoría</div></div>
            <BarChart bars={slices} />
          </div>
        </div>
      )}

      <div className="v-card">
        <div className="v-chart-head"><div className="v-chart-title">Movimientos</div><div className="v-chart-sub">{txs.length} registros</div></div>
        <div className="v-tx-list">
          {txs.length === 0 && <div className="v-empty">Sin movimientos para Ave Austral en este período.</div>}
          {txs.map((t, i) => {
            const isPos = t.bucket === 'income';
            return (
              <div key={t.id} className="v-tx-row" onClick={() => onEdit(t)} style={{ animationDelay: (i * 40) + 'ms' }}>
                <div className="v-tx-icon" style={{ background: isPos ? 'rgba(24,160,88,.12)' : 'rgba(212,58,42,.10)', color: isPos ? 'var(--signal-pos)' : 'var(--signal-neg)' }}>
                  {isPos ? '↗' : '↘'}
                </div>
                <div className="v-tx-main">
                  <div className="v-tx-concept">{t.concepto}</div>
                  <div className="v-tx-meta">{fmtDate(t.date)}</div>
                </div>
                <div className="v-tx-cat" style={{ color: catColor(categoryMeta, t.category) }}>{catLabel(categoryMeta, t.category)}</div>
                <div className={`v-tx-amount ${isPos ? 'pos' : 'neg'}`}>{isPos ? '+' : '−'}{fmtCLP(Math.abs(t.amount), { sign: false })}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
