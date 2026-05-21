// src/components/views/Socio.jsx
import { useMemo } from 'react';
import { fmtCLP, fmtDate } from '../../utils/formatters.js';
import { catColor, catLabel } from '../../utils/categories.js';

export function Socio({ filteredTx, categoryMeta, properties, onEdit }) {
  const txs = filteredTx.filter(t => t.bucket === 'retiro_socio');

  const { total, remesas, anticipos } = useMemo(() => ({
    total:    txs.reduce((s, t) => s + t.amount, 0),
    remesas:  txs.filter(t => /remesa/i.test(t.concepto)).reduce((s, t) => s + t.amount, 0),
    anticipos: txs.filter(t => !/remesa/i.test(t.concepto)).reduce((s, t) => s + t.amount, 0),
  }), [txs]);

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
          <div className="v-kpi-label">Total retirado</div>
          <div className="v-kpi-value socio"><span className="currency">$</span>{(Math.abs(total) / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{txs.length} movimientos · no afecta rentabilidad</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Remesas propietario</div>
          <div className="v-kpi-value"><span className="currency">$</span>{(Math.abs(remesas) / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{fmtCLP(Math.abs(remesas), { sign: false })}</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Anticipos a Diego</div>
          <div className="v-kpi-value"><span className="currency">$</span>{(Math.abs(anticipos) / 1_000_000).toFixed(2).replace('.', ',')}M</div>
          <div className="v-kpi-sub">{fmtCLP(Math.abs(anticipos), { sign: false })}</div>
        </div>
      </div>

      <div className="v-card">
        <div className="v-chart-head">
          <div className="v-chart-title">Movimientos de socio</div>
          <div className="v-chart-sub">{txs.length} registros</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 80px 110px', gap: 10, padding: '8px 20px', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)' }}>Fecha</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)' }}>Concepto</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)' }}>Tipo</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ink-3)', textAlign: 'right' }}>Monto</span>
        </div>
        {txs.length === 0 && <div className="v-empty">Sin movimientos de socio en este período.</div>}
        {txs.map(t => {
          const tipo = /remesa/i.test(t.concepto) ? 'Remesa' : /anticipo/i.test(t.concepto) ? 'Anticipo' : 'Retiro';
          return (
            <div key={t.id} className="v-socio-row" onClick={() => onEdit(t)}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-3)' }}>{fmtDate(t.date)}</span>
              <span style={{ fontSize: 13.5, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.concepto}</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{tipo}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 600, textAlign: 'right', color: 'var(--socio)' }}>
                −{fmtCLP(Math.abs(t.amount), { sign: false })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
