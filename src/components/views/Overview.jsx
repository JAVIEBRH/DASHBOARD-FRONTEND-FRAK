// src/components/views/Overview.jsx
import { useMemo, useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { DonutChart } from '../charts/DonutChart.jsx';
import { MonthlyBars } from '../charts/MonthlyBars.jsx';
import { fmtCLP, fmtCLPParts, fmtDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Overview({ filteredTx, transactions, monthsOrder, monthLabels, categoryMeta, onEdit, onAdd, period, setPeriod }) {
  const [catTab, setCatTab] = useState('expense');

  const txs = filteredTx;
  const income    = txs.filter(t => t.type === 'pos').reduce((s, t) => s + t.amount, 0);
  const expenseOp = txs.filter(t => t.type === 'neg').reduce((s, t) => s + t.amount, 0);
  const margen    = income + expenseOp;
  const margenPct = income > 0 ? (margen / income) * 100 : 0;

  const incParts = fmtCLPParts(income, { compact: true });
  const cosParts = fmtCLPParts(expenseOp, { compact: true });
  const netParts = fmtCLPParts(margen, { compact: true });

  const allMonthLabels = monthsOrder.map(m => monthLabels?.[m] ?? m);
  const monthlyIncome    = monthsOrder.map(m => txs.filter(t => t.month === m && t.type === 'pos').reduce((s, t) => s + t.amount, 0));
  const monthlyExpenseOp = monthsOrder.map(m => txs.filter(t => t.month === m && t.type === 'neg').reduce((s, t) => s + Math.abs(t.amount), 0));

  const byIncCat = useMemo(() => {
    const map = {};
    txs.filter(t => t.type === 'pos').forEach(t => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map).map(([k, v]) => ({ label: catLabel(categoryMeta, k), value: v, color: catColor(categoryMeta, k), cat: k })).sort((a, b) => b.value - a.value);
  }, [txs, categoryMeta]);

  const byExpCat = useMemo(() => {
    const map = {};
    txs.filter(t => t.type === 'neg').forEach(t => { map[t.category] = (map[t.category] ?? 0) + Math.abs(t.amount); });
    return Object.entries(map).map(([k, v]) => ({ label: catLabel(categoryMeta, k), value: v, color: catColor(categoryMeta, k), cat: k })).sort((a, b) => b.value - a.value);
  }, [txs, categoryMeta]);

  const donutData  = catTab === 'expense' ? byExpCat : byIncCat;
  const donutTotal = catTab === 'expense' ? Math.abs(expenseOp) : income;

  const recent = [...txs].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 6);

  const monthAgg = monthsOrder.map(m => {
    const mt = txs.filter(t => t.month === m);
    const ing = mt.filter(t => t.type === 'pos').reduce((s, t) => s + t.amount, 0);
    const cos = mt.filter(t => t.type === 'neg').reduce((s, t) => s + t.amount, 0);
    return { m, label: monthLabels?.[m] ?? m, net: ing + cos, ing, cos };
  }).filter(x => x.ing !== 0 || x.cos !== 0);

  const bestMonth  = [...monthAgg].sort((a, b) => b.net - a.net)[0];
  const worstMonth = [...monthAgg].sort((a, b) => a.net - b.net)[0];

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Resumen ejecutivo</div>
          <h1 className="v-section-title">Salud financiera <em>del negocio</em>.</h1>
          <p className="v-section-sub">Margen operativo real, ingresos y gastos del período seleccionado.</p>
        </div>
        <button className="v-btn primary" onClick={onAdd}>
          <Icon name="plus" size={14} /> Nueva entrada
        </button>
      </div>

      <div className="v-kpi-hero">
        <div className="v-kpi-cell primary">
          <div className="v-kpi-label"><Icon name="leaf" size={11} color="var(--brass)" /> Margen neto</div>
          <div className="v-kpi-value">
            <span className="currency">$</span>{netParts.body}
          </div>
          <div className="v-kpi-sub">{margenPct.toFixed(1)}% de margen sobre ingresos</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label"><Icon name="arrow_up" size={11} /> Ingreso bruto</div>
          <div className="v-kpi-value pos"><span className="currency">$</span>{incParts.body}</div>
          <div className="v-kpi-sub">{fmtCLP(income, { sign: false })} · {txs.filter(t => t.type === 'pos').length} entradas</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label"><Icon name="arrow_down" size={11} /> Gasto operativo</div>
          <div className="v-kpi-value neg"><span className="currency">$</span>{cosParts.body}</div>
          <div className="v-kpi-sub">{fmtCLP(expenseOp)} · {txs.filter(t => t.type === 'neg').length} salidas</div>
        </div>
      </div>

      <div className="v-grid-2">
        <div className="v-card">
          <div className="v-chart-head">
            <div>
              <div className="v-chart-title">Evolución mensual</div>
              <div className="v-chart-sub">Ingresos vs gastos operativos</div>
            </div>
            <div className="v-chart-legend">
              <span><i className="v-legend-dot" style={{ background: 'var(--signal-pos)' }} />Ingresos</span>
              <span><i className="v-legend-dot" style={{ background: 'var(--signal-neg)' }} />Gastos</span>
            </div>
          </div>
          <MonthlyBars income={monthlyIncome} expense={monthlyExpenseOp} monthLabels={allMonthLabels} height={260} />
          {bestMonth && worstMonth && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 18, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', marginBottom: 6 }}>Mejor mes</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, letterSpacing: '-0.02em' }}>
                  {bestMonth.label} · <span style={{ color: 'var(--signal-pos)' }}>{fmtCLP(bestMonth.net, { compact: true })}</span>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-3)', marginBottom: 6 }}>Peor mes</div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, letterSpacing: '-0.02em' }}>
                  {worstMonth.label} · <span style={{ color: worstMonth.net < 0 ? 'var(--signal-neg)' : 'var(--ink-2)' }}>{fmtCLP(worstMonth.net, { compact: true })}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="v-card">
          <div className="v-chart-head">
            <div>
              <div className="v-chart-title">Por categoría</div>
              <div className="v-chart-sub">{catTab === 'expense' ? 'Gastos operativos' : 'Fuentes de ingreso'}</div>
            </div>
            <div className="v-pill-group" style={{ fontSize: 11 }}>
              <button className={`v-pill${catTab === 'income' ? ' active' : ''}`} onClick={() => setCatTab('income')}>Ingresos</button>
              <button className={`v-pill${catTab === 'expense' ? ' active' : ''}`} onClick={() => setCatTab('expense')}>Gastos</button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <DonutChart data={donutData} size={220} thickness={32} />
              <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', pointerEvents: 'none' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Total</div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginTop: 4, letterSpacing: '-0.02em' }}>
                    {fmtCLP(donutTotal, { compact: true, sign: false })}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-3)', marginTop: 3 }}>{donutData.length} categorías</div>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              {donutData.map((d, i) => {
                const p = (Math.abs(d.value) / (donutTotal || 1)) * 100;
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr 36px 64px', alignItems: 'center', gap: 10, padding: '8px 2px', borderBottom: i < donutData.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: d.color, boxShadow: `0 0 0 2px ${d.color}30` }} />
                    <div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>{d.label}</div>
                      <div style={{ height: 3, borderRadius: 2, background: 'var(--line)', overflow: 'hidden' }}>
                        <div style={{ width: p + '%', height: '100%', background: d.color, borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-3)', textAlign: 'right' }}>{p.toFixed(0)}%</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: d.color, textAlign: 'right' }}>{fmtCLP(d.value, { compact: true, sign: false })}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="v-card" style={{ marginTop: 24 }}>
        <div className="v-chart-head">
          <div>
            <div className="v-chart-title">Movimientos recientes</div>
            <div className="v-chart-sub">Últimas {recent.length} transacciones</div>
          </div>
        </div>
        <div className="v-tx-list">
          {recent.length === 0 && <div className="v-empty">Sin movimientos en este período.</div>}
          {recent.map((t, i) => {
            const isPos = t.type === 'pos';
            return (
              <div key={t.id} className="v-tx-row" onClick={() => onEdit(t)} style={{ animationDelay: (i * 55) + 'ms' }}>
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
                <div className="v-tx-cat" style={{ color: catColor(categoryMeta, t.category) }}>
                  {catLabel(categoryMeta, t.category)}
                </div>
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
