// src/components/layout/MonthPicker.jsx
import { useState, useRef, useEffect } from 'react';
import { Icon } from '../ui/Icon.jsx';

const MONTH_LABELS = {
  ene:'Enero', feb:'Febrero', mar:'Marzo', abr:'Abril',
  may:'Mayo', jun:'Junio', jul:'Julio', ago:'Agosto',
  sep:'Septiembre', oct:'Octubre', nov:'Noviembre', dic:'Diciembre',
};

function getLabel(period, monthLabels) {
  if (period === 'all') return 'Año completo';
  const prefix = period.split('-')[0];
  return monthLabels?.[period] ?? MONTH_LABELS[prefix] ?? period;
}

export function MonthPicker({ months, period, onSelect, monthLabels }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const label = getLabel(period, monthLabels);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={'v-btn ghost' + (open ? ' active' : '')}
        style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, letterSpacing: '0.04em', gap: 6 }}
        onClick={() => setOpen(o => !o)}
      >
        <Icon name="calendar" size={13} />
        {label}
        <Icon name="chevron_right" size={11} style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }} />
      </button>
      {open && (
        <div className="v-month-picker-popup">
          <button
            className={'v-month-all ' + (period === 'all' ? 'active' : '')}
            onClick={() => { onSelect('all'); setOpen(false); }}
          >Todo el año</button>
          <div className="v-month-picker-grid">
            {months.map(m => {
              const prefix = m.split('-')[0];
              const lbl = (MONTH_LABELS[prefix] ?? m).slice(0, 3).toUpperCase();
              return (
                <button key={m}
                  className={'v-month-cell ' + (period === m ? 'active' : '')}
                  onClick={() => { onSelect(m); setOpen(false); }}
                >{lbl}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
