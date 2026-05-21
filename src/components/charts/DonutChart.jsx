// src/components/charts/DonutChart.jsx
import { useState } from 'react';
import { fmtCLP } from '../../utils/formatters.js';

export function DonutChart({ data, size = 220, thickness = 32 }) {
  const [hovered, setHovered] = useState(null);
  const r = (size / 2) - thickness / 2 - 4;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + Math.abs(d.value), 0) || 1;

  let offset = 0;
  const arcs = data.map((d, i) => {
    const dash = (Math.abs(d.value) / total) * circ;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r}
        fill="none" stroke={d.color} strokeWidth={thickness}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeDashoffset={-offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ cursor: 'pointer', transition: 'opacity .15s' }}
        opacity={hovered == null || hovered === i ? 1 : 0.3}
        onMouseEnter={() => setHovered(i)}
        onMouseLeave={() => setHovered(null)}
      />
    );
    offset += dash;
    return el;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--line)" strokeWidth={thickness} />
      {arcs}
    </svg>
  );
}
