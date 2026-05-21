// src/components/layout/MonthPicker.jsx
export function MonthPicker({ months, period, onSelect }) {
  return (
    <div className="month-picker">
      <button
        className={`month-btn${period === 'all' ? ' month-btn--active' : ''}`}
        onClick={() => onSelect('all')}
      >Todos</button>
      {months.map(m => {
        const label = m.split('-')[0];
        return (
          <button key={m}
            className={`month-btn${period === m ? ' month-btn--active' : ''}`}
            onClick={() => onSelect(m)}
          >{label}</button>
        );
      })}
    </div>
  );
}
