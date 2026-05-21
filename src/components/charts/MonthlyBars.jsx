// src/components/charts/MonthlyBars.jsx
const smoothCurve = (pts) => {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y}`;
  }
  return d;
};

export function MonthlyBars({ income, expense, monthLabels, height = 260 }) {
  const w = 760, h = height, pad = { t: 20, r: 16, b: 36, l: 60 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;

  const expenseAbs = expense.map(Math.abs);
  const maxAbs = Math.max(...income, ...expenseAbs, 1);
  const yScale = v => pad.t + innerH / 2 - (v / maxAbs) * (innerH / 2 - 8);
  const slot = innerW / income.length;
  const barW = Math.min(slot * 0.32, 18);

  const ticks = [maxAbs, maxAbs / 2, 0, -maxAbs / 2, -maxAbs];

  const incomePts  = income.map((v, i)      => ({ x: pad.l + i * slot + slot / 2, y: yScale(v),        hasData: v !== 0 }));
  const expensePts = expenseAbs.map((v, i)  => ({ x: pad.l + i * slot + slot / 2, y: yScale(-v),       hasData: v !== 0 }));
  const incomePath  = smoothCurve(incomePts.filter(p => p.hasData));
  const expensePath = smoothCurve(expensePts.filter(p => p.hasData));
  const zeroY = yScale(0);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="v-chart-svg" preserveAspectRatio="xMidYMid meet">
      {ticks.map((t, i) => {
        const y = yScale(t);
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y}
              stroke={t === 0 ? 'var(--line-2)' : 'var(--line)'}
              strokeDasharray={t === 0 ? undefined : '2,5'}
              strokeOpacity={t === 0 ? 0.8 : 0.6} />
            <text x={pad.l - 10} y={y + 3} fontSize="10.5" fill="var(--ink-3)" textAnchor="end"
              fontFamily="var(--font-mono)" letterSpacing="0.04em">
              {t === 0 ? '$0' : `${t > 0 ? '' : '−'}$${(Math.abs(t)/1_000_000).toFixed(1).replace('.0','')}M`}
            </text>
          </g>
        );
      })}

      {income.map((v, i) => {
        const x = pad.l + i * slot + slot / 2;
        return (
          <g key={i}>
            <rect x={x - barW - 2} y={yScale(v)} width={barW} height={Math.max(zeroY - yScale(v), 0)}
              fill="var(--signal-pos)" rx="2" opacity="0.75" />
            <rect x={x + 2} y={zeroY} width={barW} height={Math.max(yScale(-expenseAbs[i]) - zeroY, 0)}
              fill="var(--signal-neg)" rx="2" opacity="0.75" />
            <text x={x} y={h - 14} fontSize="10.5" fill="var(--ink-3)" textAnchor="middle"
              fontFamily="var(--font-mono)" letterSpacing="0.08em">
              {(monthLabels[i] || '').slice(0, 3).toUpperCase()}
            </text>
          </g>
        );
      })}

      {incomePath && (
        <g>
          <path d={incomePath} fill="none" stroke="var(--signal-pos)" strokeWidth="4" strokeLinecap="round" opacity="0.18" />
          <path d={incomePath} fill="none" stroke="var(--signal-pos)" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          {incomePts.filter(p => p.hasData).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--surface)" stroke="var(--signal-pos)" strokeWidth="2" />
          ))}
        </g>
      )}
      {expensePath && (
        <g>
          <path d={expensePath} fill="none" stroke="var(--signal-neg)" strokeWidth="4" strokeLinecap="round" opacity="0.18" />
          <path d={expensePath} fill="none" stroke="var(--signal-neg)" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          {expensePts.filter(p => p.hasData).map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="4" fill="var(--surface)" stroke="var(--signal-neg)" strokeWidth="2" />
          ))}
        </g>
      )}
    </svg>
  );
}
