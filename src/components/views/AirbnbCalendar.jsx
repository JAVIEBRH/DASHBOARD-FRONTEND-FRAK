// src/components/views/AirbnbCalendar.jsx
import { useMemo, useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { EstadiaModal } from '../EstadiaModal.jsx';
import { LimpiezaModal } from '../LimpiezaModal.jsx';

const MONTH_ABBR = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const BAR_COLORS = ['#3B82F6', '#C97356', '#7C3AED', '#18A058', '#D97706', '#EC4899'];

function pad(n) { return String(n).padStart(2, '0'); }

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return BAR_COLORS[hash % BAR_COLORS.length];
}

function buildMonthGrid(year, monthIndex) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // 0=Mon
  const weeks = [];
  let week = new Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }
  return { weeks, daysInMonth };
}

function monthBarSegments(weeks, daysInMonth, clippedStart, clippedEnd) {
  if (clippedStart > clippedEnd) return [];
  const segments = [];
  weeks.forEach((week, rowIdx) => {
    const rowDays = week.filter(d => d != null);
    if (!rowDays.length) return;
    const rowMin = Math.min(...rowDays);
    const rowMax = Math.max(...rowDays);
    const start = Math.max(rowMin, clippedStart);
    const end = Math.min(rowMax, clippedEnd);
    if (start > end) return;
    const colStart = week.indexOf(start);
    const colEnd = week.indexOf(end);
    segments.push({ rowIdx, colStart, colSpan: colEnd - colStart + 1 });
  });
  return segments;
}

function MonthBlock({ year, monthIndex, label, estadias, limpiezas, onBarClick, onDayClick, onCleaningClick }) {
  const { weeks, daysInMonth } = useMemo(() => buildMonthGrid(year, monthIndex), [year, monthIndex]);
  const monthStart = `${year}-${pad(monthIndex + 1)}-01`;
  const monthEnd = `${year}-${pad(monthIndex + 1)}-${pad(daysInMonth)}`;

  const stayBars = useMemo(() => {
    return estadias
      .filter(e => e.checkIn <= monthEnd && e.checkOut >= monthStart)
      .flatMap(e => {
        const startDay = e.checkIn < monthStart ? 1 : Number(e.checkIn.slice(8, 10));
        const endDay = e.checkOut > monthEnd ? daysInMonth : Number(e.checkOut.slice(8, 10));
        return monthBarSegments(weeks, daysInMonth, startDay, endDay).map(seg => ({ ...seg, estadia: e }));
      });
  }, [estadias, weeks, daysInMonth, monthStart, monthEnd]);

  const limpiezasByDay = useMemo(() => {
    const map = {};
    limpiezas.filter(l => l.date >= monthStart && l.date <= monthEnd).forEach(l => {
      const day = Number(l.date.slice(8, 10));
      (map[day] ??= []).push(l);
    });
    return map;
  }, [limpiezas, monthStart, monthEnd]);

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, marginBottom: 10, textTransform: 'lowercase' }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{d}</div>
        ))}
      </div>
      {weeks.map((week, rowIdx) => (
        <div key={rowIdx} style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 22 }}>
          {week.map((day, colIdx) => (
            <div key={colIdx}
              onClick={() => day && onDayClick(`${year}-${pad(monthIndex + 1)}-${pad(day)}`)}
              style={{
                minHeight: 46, borderRadius: 8, padding: '4px 6px',
                background: day ? 'var(--surface-2)' : 'transparent',
                cursor: day ? 'pointer' : 'default',
                fontSize: 12.5, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)',
              }}>
              {day}
              {day && limpiezasByDay[day]?.map(l => (
                <div key={l.id}
                  onClick={e => { e.stopPropagation(); onCleaningClick(l); }}
                  title={l.notes || 'Limpieza'}
                  style={{ marginTop: 4, display: 'inline-flex', alignItems: 'center', gap: 3, background: 'var(--brass-soft)', color: 'var(--brass-2)', borderRadius: 6, padding: '1px 5px', fontSize: 9.5 }}>
                  <Icon name="sparkle" size={9} /> limpieza
                </div>
              ))}
            </div>
          ))}
          {stayBars.filter(b => b.rowIdx === rowIdx).map((b, i) => (
            <div key={i}
              onClick={e => { e.stopPropagation(); onBarClick(b.estadia); }}
              style={{
                position: 'absolute', top: 22, height: 22,
                left: `calc(${(b.colStart / 7) * 100}% + 3px)`,
                width: `calc(${(b.colSpan / 7) * 100}% - 6px)`,
                background: colorFor(b.estadia.guestName), color: '#fff',
                borderRadius: 11, display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 8px', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
              }}>
              {b.estadia.guestName}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function AirbnbCalendar({ estadias, limpiezas, year, period, monthsOrder, monthLabels, addEstadia, editEstadia, deleteEstadia, addLimpieza, editLimpieza, deleteLimpieza }) {
  const [estadiaModal, setEstadiaModal] = useState(null); // { item, defaultDate } | null
  const [limpiezaModal, setLimpiezaModal] = useState(null);

  const yearNum = Number(year);
  const monthsToShow = period === 'all'
    ? monthsOrder
    : monthsOrder.filter(m => m === period);

  const openNewEstadia = () => setEstadiaModal({ item: null, defaultDate: null });
  const openNewLimpieza = () => setLimpiezaModal({ item: null, defaultDate: null });

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Airbnb</div>
          <h1 className="v-section-title">Calendario <em>de reservas</em>.</h1>
          <p className="v-section-sub">Estadías y limpiezas de {year}{period !== 'all' ? ` · ${monthLabels?.[period] ?? period}` : ' · año completo'}.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="v-btn ghost" onClick={openNewLimpieza}>
            <Icon name="sparkle" size={13} /> Agendar limpieza
          </button>
          <button className="v-btn primary" onClick={openNewEstadia}>
            <Icon name="plus" size={13} /> Registrar estadías
          </button>
        </div>
      </div>

      <div className="v-card" style={{ padding: 24 }}>
        {monthsToShow.map(m => {
          const monthIdx = MONTH_ABBR.indexOf(m.slice(0, 3));
          return (
            <MonthBlock key={m}
              year={yearNum} monthIndex={monthIdx} label={monthLabels?.[m] ?? m}
              estadias={estadias} limpiezas={limpiezas}
              onBarClick={(estadia) => setEstadiaModal({ item: estadia, defaultDate: null })}
              onDayClick={(dateStr) => setEstadiaModal({ item: null, defaultDate: dateStr })}
              onCleaningClick={(limpieza) => setLimpiezaModal({ item: limpieza, defaultDate: null })}
            />
          );
        })}
      </div>

      <EstadiaModal
        open={!!estadiaModal}
        item={estadiaModal?.item ?? null}
        defaultDate={estadiaModal?.defaultDate}
        onClose={() => setEstadiaModal(null)}
        onSave={(data) => {
          if (estadiaModal?.item) editEstadia(estadiaModal.item.id, data);
          else addEstadia(data);
          setEstadiaModal(null);
        }}
        onDelete={(id) => { deleteEstadia(id); setEstadiaModal(null); }}
      />

      <LimpiezaModal
        open={!!limpiezaModal}
        item={limpiezaModal?.item ?? null}
        defaultDate={limpiezaModal?.defaultDate}
        onClose={() => setLimpiezaModal(null)}
        onSave={(data) => {
          if (limpiezaModal?.item) editLimpieza(limpiezaModal.item.id, data);
          else addLimpieza(data);
          setLimpiezaModal(null);
        }}
        onDelete={(id) => { deleteLimpieza(id); setLimpiezaModal(null); }}
      />
    </div>
  );
}
