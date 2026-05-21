// src/components/charts/BarChart.jsx
import { formatCLP } from '../../utils/formatters.js';

export function BarChart({ bars, color = 'var(--accent)' }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 110, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</div>
          <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(b.value / max) * 100}%`, background: b.color ?? color, borderRadius: 5, transition: 'width .4s' }} />
          </div>
          <div style={{ width: 100, fontSize: 12, color: 'var(--text)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{formatCLP(b.value)}</div>
        </div>
      ))}
    </div>
  );
}
