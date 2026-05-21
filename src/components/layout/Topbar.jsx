// src/components/layout/Topbar.jsx
import { Icon } from '../ui/Icon.jsx';
import { MonthPicker } from './MonthPicker.jsx';
import { api } from '../../services/api.js';

export function Topbar({ title, year, setYear, period, setPeriod, monthsOrder, monthLabels, onAdd }) {
  const handleExport = () => {
    const params = period !== 'all' ? { month: period } : { year };
    window.open(api.exportUrl(params), '_blank');
  };

  return (
    <div className="v-topbar">
      <div className="v-topbar-left">
        <div className="v-breadcrumb">
          <span>Contabilidad</span>
          <Icon name="chevron_right" size={11} />
          <span className="crumb-active">{title}</span>
        </div>
      </div>
      <div className="v-topbar-right">
        <div className="v-pill-group">
          {['2025', '2026'].map(y => (
            <button key={y} className={`v-pill${year === y ? ' active' : ''}`} onClick={() => setYear(y)}>{y}</button>
          ))}
        </div>
        <MonthPicker months={monthsOrder} period={period} onSelect={setPeriod} monthLabels={monthLabels} />
        <button className="v-btn ghost" onClick={handleExport} title="Descargar Excel" style={{ padding: '7px 12px' }}>
          <Icon name="download" size={14} />
          <span style={{ fontSize: 12 }}>Excel</span>
        </button>
        {onAdd && (
          <button className="v-btn primary" onClick={onAdd}>
            <Icon name="plus" size={14} /> Nueva entrada
          </button>
        )}
      </div>
    </div>
  );
}
