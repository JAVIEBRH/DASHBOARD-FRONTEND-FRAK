// src/components/charts/BarChart.jsx
import { fmtCLP } from '../../utils/formatters.js';

export function BarChart({ bars }) {
  const max = Math.max(...bars.map(b => Math.abs(b.value)), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {bars.map((b, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
            <span style={{ color: 'var(--ink)' }}>{b.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: b.color ?? 'var(--ink-2)' }}>
              {fmtCLP(b.value, { compact: true, sign: false })}
            </span>
          </div>
          <div style={{ height: 5, borderRadius: 3, background: 'var(--line)', overflow: 'hidden' }}>
            <div className="v-bar-fill" style={{ width: `${(Math.abs(b.value) / max) * 100}%`, height: '100%', background: b.color ?? 'var(--emerald)', borderRadius: 3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
