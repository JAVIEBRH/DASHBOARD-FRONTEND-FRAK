// src/components/layout/Topbar.jsx
import { Icon } from '../ui/Icon.jsx';
import { MonthPicker } from './MonthPicker.jsx';
import { api } from '../../services/api.js';

export function Topbar({ title, year, setYear, period, setPeriod, monthsOrder, onAdd }) {
  const handleExport = () => {
    const params = { year, ...(period !== 'all' && { month: period }) };
    window.open(api.exportUrl(params), '_blank');
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">{title}</h1>
        <div className="year-toggle">
          {['2025', '2026'].map(y => (
            <button key={y} className={`year-btn${year === y ? ' year-btn--active' : ''}`} onClick={() => setYear(y)}>{y}</button>
          ))}
        </div>
        <MonthPicker months={monthsOrder} period={period} onSelect={setPeriod} />
      </div>
      <div className="topbar__right">
        <button className="btn btn--ghost" onClick={handleExport}>
          <Icon name="download" size={15} /> Exportar
        </button>
        {onAdd && (
          <button className="btn btn--primary" onClick={onAdd}>
            <Icon name="plus" size={15} /> Nuevo
          </button>
        )}
      </div>
    </header>
  );
}
