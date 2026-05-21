// src/components/ui/KpiCard.jsx
import { Icon } from './Icon.jsx';
import { formatCLP } from '../../utils/formatters.js';

export function KpiCard({ label, value, icon, accent = '#6366F1', sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__icon" style={{ background: accent + '22', color: accent }}>
        <Icon name={icon} size={20} />
      </div>
      <div className="kpi-card__body">
        <div className="kpi-card__label">{label}</div>
        <div className="kpi-card__value">{formatCLP(value)}</div>
        {sub && <div className="kpi-card__sub">{sub}</div>}
      </div>
    </div>
  );
}
