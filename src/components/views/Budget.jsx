// src/components/views/Budget.jsx
import { useMemo } from 'react';
import { fmtCLP } from '../../utils/formatters.js';

const MONTHS_2025 = ['ene-25','feb-25','mar-25','abr-25','may-25','jun-25','jul-25','ago-25','sep-25','oct-25','nov-25','dic-25'];
const MONTH_NAMES  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function Budget({ transactions }) {
  const by2025 = useMemo(() => {
    return MONTHS_2025.map((m, i) => {
      const txs    = (transactions ?? []).filter(t => t.month === m);
      const income  = txs.filter(t => t.type === 'pos').reduce((s, t) => s + t.amount, 0);
      const expense = txs.filter(t => t.type === 'neg').reduce((s, t) => s + Math.abs(t.amount), 0);
      return { month: MONTH_NAMES[i], income, expense, net: income - expense };
    });
  }, [transactions]);

  const totals = useMemo(() => ({
    income:  by2025.reduce((s, m) => s + m.income, 0),
    expense: by2025.reduce((s, m) => s + m.expense, 0),
    net:     by2025.reduce((s, m) => s + m.net, 0),
  }), [by2025]);

  const positiveMonths = by2025.filter(m => m.net >= 0).length;
  const maxVal = Math.max(...by2025.map(x => Math.max(x.income, x.expense)), 1);

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Proyección</div>
          <h1 className="v-section-title">Presupuesto <em>2026</em>.</h1>
          <p className="v-section-sub">Proyección basada en datos reales de 2025 · Referencia mensual.</p>
        </div>
      </div>

      <div className="v-kpi-hero">
        <div className="v-kpi-cell primary">
          <div className="v-kpi-label">Resultado 2025</div>
          <div className="v-kpi-value"><span className="currency">$</span>{(Math.abs(totals.net) / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{totals.net >= 0 ? 'Año positivo' : 'Año negativo'}</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Ingresos totales</div>
          <div className="v-kpi-value pos"><span className="currency">$</span>{(totals.income / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{fmtCLP(totals.income, { sign: false })}</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Gastos operativos</div>
          <div className="v-kpi-value neg"><span className="currency">$</span>{(totals.expense / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{fmtCLP(totals.expense, { sign: false })}</div>
        </div>
      </div>

      <div className="v-card" style={{ marginTop: 24, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 130px', gap: 12, padding: '13px 22px', borderBottom: '1px solid var(--line)', fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
          <div>Mes</div>
          <div style={{ textAlign: 'right' }}>Ingresos</div>
          <div style={{ textAlign: 'right' }}>Gastos</div>
          <div style={{ textAlign: 'right' }}>Resultado</div>
        </div>
        {by2025.map((m, i) => {
          const isPos = m.net >= 0;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 130px', gap: 12, padding: '11px 22px', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
              <div style={{ fontWeight: 500, fontSize: 13.5, color: 'var(--ink)' }}>{m.month}</div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: m.income > 0 ? 'var(--signal-pos)' : 'var(--ink-3)' }}>
                {m.income > 0 ? fmtCLP(m.income, { compact: true, sign: false }) : '—'}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: m.expense > 0 ? 'var(--ink-2)' : 'var(--ink-3)' }}>
                {m.expense > 0 ? fmtCLP(m.expense, { compact: true, sign: false }) : '—'}
              </div>
              <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: isPos ? 'var(--signal-pos)' : 'var(--signal-neg)' }}>
                {m.income === 0 && m.expense === 0 ? '—' : (isPos ? '+' : '−') + fmtCLP(Math.abs(m.net), { compact: true, sign: false })}
              </div>
            </div>
          );
        })}
        <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 130px', gap: 12, padding: '13px 22px', background: 'var(--surface-2)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', display: 'flex', alignItems: 'center' }}>Total</div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, color: 'var(--signal-pos)' }}>{fmtCLP(totals.income, { compact: true, sign: false })}</div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 13, color: 'var(--ink-2)' }}>{fmtCLP(totals.expense, { compact: true, sign: false })}</div>
          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, color: totals.net >= 0 ? 'var(--signal-pos)' : 'var(--signal-neg)' }}>
            {totals.net >= 0 ? '+' : '−'}{fmtCLP(Math.abs(totals.net), { compact: true, sign: false })}
          </div>
        </div>
      </div>

      <div className="v-card" style={{ marginTop: 18 }}>
        <div className="v-chart-head">
          <div className="v-chart-title">Distribución mensual 2025</div>
          <div className="v-chart-sub">{positiveMonths} positivos · {12 - positiveMonths} negativos</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 8, marginTop: 12 }}>
          {by2025.map((m, i) => {
            const incH = Math.max((m.income  / maxVal) * 100, 2);
            const expH = Math.max((m.expense / maxVal) * 100, 2);
            const isPos = m.net >= 0;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '100%', height: 80, display: 'flex', alignItems: 'flex-end', gap: 2, justifyContent: 'center' }}>
                  <div style={{ flex: 1, height: m.income  > 0 ? incH + '%' : '2px', background: 'var(--signal-pos)', opacity: 0.7, borderRadius: '3px 3px 0 0' }} />
                  <div style={{ flex: 1, height: m.expense > 0 ? expH + '%' : '2px', background: 'var(--signal-neg)', opacity: 0.55, borderRadius: '3px 3px 0 0' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: isPos ? 'var(--signal-pos)' : 'var(--signal-neg)', fontWeight: 600 }}>
                  {m.income === 0 && m.expense === 0 ? '—' : (isPos ? '+' : '−') + fmtCLP(Math.abs(m.net), { compact: true, sign: false })}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {m.month.slice(0, 3)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
