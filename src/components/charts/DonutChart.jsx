// src/components/charts/DonutChart.jsx
import { useState } from 'react';
import { formatCLP } from '../../utils/formatters.js';

export function DonutChart({ slices, size = 200 }) {
  const [hovered, setHovered] = useState(null);
  const r = 80, cx = 100, cy = 100, stroke = 30;
  const circ = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0);

  let offset = 0;
  const paths = slices.map((sl, i) => {
    const dash = (sl.value / total) * circ;
    const gap = circ - dash;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r}
        fill="none" stroke={sl.color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={-offset}
        style={{ cursor: 'pointer', transition: 'opacity .15s' }}
        opacity={hovered == null || hovered === i ? 1 : 0.35}
        onMouseEnter={() => setHovered(i)}
        onMouseLeave={() => setHovered(null)}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
    offset += dash;
    return el;
  });

  const active = hovered != null ? slices[hovered] : null;

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox="0 0 200 200" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        {paths}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--text-muted)" fontSize="11">
          {active ? active.label : 'Total'}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="600">
          {formatCLP(active ? active.value : total)}
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {slices.map((sl, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: hovered == null || hovered === i ? 1 : 0.45, transition: 'opacity .15s' }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: sl.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sl.label}</span>
            <span style={{ fontSize: 12, color: 'var(--text)', marginLeft: 'auto', paddingLeft: 12, fontVariantNumeric: 'tabular-nums' }}>{formatCLP(sl.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
