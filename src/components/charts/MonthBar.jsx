// src/components/charts/MonthBar.jsx
import { formatCLP } from '../../utils/formatters.js';

export function MonthBar({ months, transactions, onSelect, selected }) {
  const totals = months.map(m => {
    const txs = transactions.filter(t => t.month === m);
    const ing = txs.filter(t => t.type === 'pos').reduce((s, t) => s + t.amount, 0);
    const cos = txs.filter(t => t.type === 'neg').reduce((s, t) => s + Math.abs(t.amount), 0);
    return { m, ing, cos };
  });

  const max = Math.max(...totals.map(t => Math.max(t.ing, t.cos)), 1);

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120, padding: '0 4px' }}>
      {totals.map(({ m, ing, cos }) => {
        const label = m.split('-')[0];
        const isActive = selected === m;
        return (
          <div key={m} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, cursor: 'pointer' }}
            onClick={() => onSelect(isActive ? 'all' : m)}
            title={`${m}: ${formatCLP(ing)} / ${formatCLP(cos)}`}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 90 }}>
              <div style={{ width: 8, background: isActive ? '#0EA5E9' : 'var(--accent)', borderRadius: 3, height: `${(ing / max) * 90}px`, transition: 'height .3s' }} />
              <div style={{ width: 8, background: isActive ? '#EF4444' : 'var(--border-strong)', borderRadius: 3, height: `${(cos / max) * 90}px`, transition: 'height .3s' }} />
            </div>
            <span style={{ fontSize: 10, color: isActive ? 'var(--text)' : 'var(--text-muted)', fontWeight: isActive ? 700 : 400 }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
