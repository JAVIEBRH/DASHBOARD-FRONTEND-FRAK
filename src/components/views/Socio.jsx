// src/components/views/Socio.jsx
import { useMemo } from 'react';
import { fmtCLP, fmtDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

const SOCIO_CATS = ['APORTE_SOCIOS', 'RETIROS'];

export function Socio({ filteredTx, categoryMeta, properties, onEdit }) {
  const txs = filteredTx.filter(t => SOCIO_CATS.includes(t.category));

  const { aportes, retiros } = useMemo(() => ({
    aportes: txs.filter(t => t.category === 'APORTE_SOCIOS').reduce((s, t) => s + t.amount, 0),
    retiros: txs.filter(t => t.category === 'RETIROS').reduce((s, t) => s + Math.abs(t.amount), 0),
  }), [txs]);

  const net = aportes - retiros;

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Socio</div>
          <h1 className="v-section-title">Movimientos <em>de socio</em>.</h1>
          <p className="v-section-sub">Aportes de socios y retiros registrados en el período. Estos van separados del gasto operativo.</p>
        </div>
      </div>

      <div className="v-kpi-hero">
        <div className="v-kpi-cell primary">
          <div className="v-kpi-label">Neto socio</div>
          <div className="v-kpi-value"><span className="currency">$</span>{((Math.abs(net)) / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{net >= 0 ? 'Saldo positivo' : 'Saldo negativo'}</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Aportes</div>
          <div className="v-kpi-value pos"><span className="currency">$</span>{(aportes / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{fmtCLP(aportes, { sign: false })}</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Retiros</div>
          <div className="v-kpi-value socio"><span className="currency">$</span>{(retiros / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{fmtCLP(retiros, { sign: false })}</div>
        </div>
      </div>

      <div className="v-card">
        <div className="v-chart-head">
          <div className="v-chart-title">Movimientos de socio</div>
          <div className="v-chart-sub">{txs.length} registros</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 110px', gap: 10, padding: '8px 20px', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)' }}>Fecha</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)' }}>Concepto</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', textAlign: 'right' }}>Monto</span>
        </div>
        {txs.length === 0 && <div className="v-empty">Sin movimientos de socio en este período.</div>}
        {txs.map(t => {
          const isAporte = t.category === 'APORTE_SOCIOS';
          return (
            <div key={t.id} className="v-socio-row" onClick={() => onEdit(t)}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-3)' }}>{fmtDate(t.date)}</span>
              <span style={{ fontSize: 13.5, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.concepto}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: isAporte ? 'var(--signal-pos)' : 'var(--socio)' }}>
                {isAporte ? '+' : '−'}{fmtCLP(Math.abs(t.amount), { sign: false })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
