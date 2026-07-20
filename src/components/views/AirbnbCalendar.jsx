// src/components/views/AirbnbCalendar.jsx
import { useMemo, useState, useEffect, useRef } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { EstadiaModal } from '../EstadiaModal.jsx';
import { LimpiezaModal } from '../LimpiezaModal.jsx';
import { PropertySelector } from './PropertySelector.jsx';
import { AddPropertyModal } from '../AddPropertyModal.jsx';
import { fmtCLP } from '../../utils/formatters.js';

const MONTH_ABBR = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const BAR_COLORS = ['#3B82F6', '#C97356', '#7C3AED', '#18A058', '#D97706', '#EC4899'];

const TODAY = new Date().toISOString().slice(0, 10);

// Module-level (not React state) so it survives AirbnbCalendar unmounting when
// the user switches tabs — App.jsx conditionally renders this component per view.
const lastVisibleMonth = new Map(); // propertyId -> "jul-26" token

function findTopVisibleMonthToken(container) {
  const blocks = container.querySelectorAll('[data-month-token]');
  // Compare each block's position to the viewport's own top edge (0), not to
  // the container's — the container scrolls in lockstep with its children
  // (the page scrolls at `window` level), so a container-relative distance
  // would never change as the user scrolls and would always pick the same block.
  let closest = null;
  let closestDist = Infinity;
  blocks.forEach(el => {
    const dist = Math.abs(el.getBoundingClientRect().top);
    if (dist < closestDist) { closestDist = dist; closest = el.dataset.monthToken; }
  });
  return closest;
}

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

export function MonthBlock({ year, monthIndex, label, estadias, limpiezas, onBarClick, onDayClick, onCleaningClick, onSuggestCleaning, propertyTag }) {
  const { weeks, daysInMonth } = useMemo(() => buildMonthGrid(year, monthIndex), [year, monthIndex]);
  const monthStart = `${year}-${pad(monthIndex + 1)}-01`;
  const monthEnd = `${year}-${pad(monthIndex + 1)}-${pad(daysInMonth)}`;

  const checkoutDays = useMemo(() => {
    const set = new Set();
    estadias.forEach(e => {
      if (e.checkOut >= monthStart && e.checkOut <= monthEnd) set.add(Number(e.checkOut.slice(8, 10)));
    });
    return set;
  }, [estadias, monthStart, monthEnd]);

  const stayBars = useMemo(() => {
    const segments = estadias
      .filter(e => e.checkIn <= monthEnd && e.checkOut >= monthStart)
      .flatMap(e => {
        const startDay = e.checkIn < monthStart ? 1 : Number(e.checkIn.slice(8, 10));
        const endDay = e.checkOut > monthEnd ? daysInMonth : Number(e.checkOut.slice(8, 10));
        return monthBarSegments(weeks, daysInMonth, startDay, endDay).map(seg => ({ ...seg, estadia: e }));
      });

    // Assign each segment a lane so overlapping stays (e.g. two properties
    // both occupied the same day) stack vertically instead of colliding.
    const byRow = {};
    segments.forEach(seg => { (byRow[seg.rowIdx] ??= []).push(seg); });
    Object.values(byRow).forEach(rowSegs => {
      rowSegs.sort((a, b) => a.colStart - b.colStart);
      const laneEnds = [];
      rowSegs.forEach(seg => {
        const colEnd = seg.colStart + seg.colSpan - 1;
        let lane = laneEnds.findIndex(end => end < seg.colStart);
        if (lane === -1) { lane = laneEnds.length; laneEnds.push(colEnd); }
        else laneEnds[lane] = colEnd;
        seg.lane = lane;
      });
    });
    return segments;
  }, [estadias, weeks, daysInMonth, monthStart, monthEnd]);

  const lanesByRow = useMemo(() => {
    const map = {};
    stayBars.forEach(seg => { map[seg.rowIdx] = Math.max(map[seg.rowIdx] ?? 1, seg.lane + 1); });
    return map;
  }, [stayBars]);

  const limpiezasByDay = useMemo(() => {
    const map = {};
    limpiezas.filter(l => l.date >= monthStart && l.date <= monthEnd).forEach(l => {
      const day = Number(l.date.slice(8, 10));
      (map[day] ??= []).push(l);
    });
    return map;
  }, [limpiezas, monthStart, monthEnd]);

  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, marginBottom: 12, textTransform: 'lowercase', color: 'var(--ink)' }}>{label}</div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        borderTop: '1px solid var(--line-2)', borderLeft: '1px solid var(--line-2)',
      }}>
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)',
            fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em',
            padding: '8px 0', background: 'var(--surface-2)',
            borderRight: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)',
          }}>{d}</div>
        ))}
      </div>
      {weeks.map((week, rowIdx) => {
        const rowMinHeight = Math.max(58, 38 + (lanesByRow[rowIdx] ?? 1) * 28 + 6);
        return (
        <div key={rowIdx} style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {week.map((day, colIdx) => {
            const dateStr = day ? `${year}-${pad(monthIndex + 1)}-${pad(day)}` : null;
            const isToday = dateStr === TODAY;
            return (
              <div key={colIdx}
                onClick={() => day && onDayClick(dateStr)}
                style={{
                  minHeight: rowMinHeight, padding: '6px 8px',
                  background: day ? 'var(--surface)' : 'var(--bg-2)',
                  cursor: day ? 'pointer' : 'default',
                  borderRight: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)',
                  transition: 'background .12s',
                }}
                onMouseEnter={e => { if (day) e.currentTarget.style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { if (day) e.currentTarget.style.background = 'var(--surface)'; }}
              >
                {day && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-serif)', fontSize: 17,
                    color: isToday ? 'var(--emerald)' : 'var(--ink)',
                    fontWeight: isToday ? 700 : 400,
                    width: 26, height: 26, borderRadius: '50%',
                    boxShadow: isToday ? 'inset 0 0 0 1.5px var(--emerald)' : 'none',
                  }}>{day}</span>
                )}
                {day && limpiezasByDay[day]?.map(l => (
                  <div key={l.id}
                    onClick={e => { e.stopPropagation(); onCleaningClick(l); }}
                    title={(l.notes || 'Limpieza') + (l.done ? ' (hecha)' : '')}
                    style={{
                      marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 3, borderRadius: 6, padding: '2px 6px', fontSize: 10,
                      background: l.done ? 'var(--surface-2)' : 'var(--brass-soft)',
                      color: l.done ? 'var(--ink-4)' : 'var(--brass-2)',
                      textDecoration: l.done ? 'line-through' : 'none',
                    }}>
                    <Icon name="sparkle" size={9} /> limpieza
                  </div>
                ))}
                {day && checkoutDays.has(day) && !limpiezasByDay[day] && (
                  <div
                    onClick={e => { e.stopPropagation(); onSuggestCleaning(dateStr); }}
                    title="Sale un huésped este día — sugerencia: agenda una limpieza"
                    style={{
                      marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 3,
                      border: '1px dashed var(--brass-2)', color: 'var(--brass-2)',
                      borderRadius: 6, padding: '2px 6px', fontSize: 9.5, cursor: 'pointer',
                    }}>
                    <Icon name="plus" size={9} /> sugerir limpieza
                  </div>
                )}
              </div>
            );
          })}
          {stayBars.filter(b => b.rowIdx === rowIdx).map((b, i) => {
            const tooltip = `${b.estadia.guestName}${b.estadia.monto ? ' · ' + fmtCLP(Number(b.estadia.monto), { sign: false }) : ''}`;
            return (
              <div key={i}
                onClick={e => { e.stopPropagation(); onBarClick(b.estadia); }}
                title={tooltip}
                style={{
                  position: 'absolute', top: 38 + b.lane * 28, height: 24,
                  left: `calc(${(b.colStart / 7) * 100}% + 4px)`,
                  width: `calc(${(b.colSpan / 7) * 100}% - 8px)`,
                  background: colorFor(b.estadia.guestName), color: '#fff',
                  borderRadius: 12, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0 8px 0 3px', fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
                  overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}>
                <span style={{
                  flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 10, fontWeight: 700,
                }}>{b.estadia.guestName.trim().charAt(0).toUpperCase()}</span>
                {b.estadia.guestName}
                {propertyTag && <span style={{ opacity: 0.85, fontWeight: 400 }}>· {propertyTag(b.estadia)}</span>}
              </div>
            );
          })}
        </div>
        );
      })}
    </div>
  );
}

export function AirbnbCalendar({ estadias, limpiezas, stockProperties, addProperty, propertyId, setPropertyId, year, period, monthsOrder, monthLabels, addEstadia, editEstadia, deleteEstadia, addLimpieza, editLimpieza, deleteLimpieza, showToast }) {
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [estadiaModal, setEstadiaModal] = useState(null); // { item, defaultDate } | null
  const [limpiezaModal, setLimpiezaModal] = useState(null);
  const scrollCardRef = useRef(null);

  const property = stockProperties.find(p => p.id === propertyId) ?? null;
  const propertyEstadias = property ? estadias.filter(e => e.property === propertyId) : [];
  const propertyLimpiezas = property ? limpiezas.filter(l => l.property === propertyId) : [];

  const yearNum = Number(year);
  const monthsToShow = period === 'all'
    ? monthsOrder
    : monthsOrder.filter(m => m === period);

  const openNewEstadia = () => setEstadiaModal({ item: null, defaultDate: null });
  const openNewLimpieza = () => setLimpiezaModal({ item: null, defaultDate: null });

  useEffect(() => {
    if (!property || period !== 'all') return;
    const now = new Date();
    if (yearNum !== now.getFullYear()) return;

    const savedToken = lastVisibleMonth.get(property.id);
    const currentMonthToken = `${MONTH_ABBR[now.getMonth()]}-${String(yearNum).slice(-2)}`;
    const targetToken = savedToken ?? currentMonthToken;
    const el = document.getElementById(`airbnb-month-${targetToken}`);
    el?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, [property, period, yearNum]);

  useEffect(() => {
    if (!property || period !== 'all') return;
    const container = scrollCardRef.current;
    if (!container) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const token = findTopVisibleMonthToken(container);
        if (token) lastVisibleMonth.set(property.id, token);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [property, period]);

  const handleAddProperty = async (data) => {
    const id = await addProperty(data);
    setAddPropertyOpen(false);
    showToast?.('Propiedad creada');
    setPropertyId(id);
  };

  if (!property) {
    return (
      <>
        <PropertySelector
          properties={stockProperties}
          onSelect={setPropertyId}
          onAddProperty={() => setAddPropertyOpen(true)}
          eyebrow="Airbnb"
          title={<>Calendario <em>por propiedad</em>.</>}
          subtitle="Elige una propiedad para ver sus estadías y limpiezas."
        />
        <AddPropertyModal open={addPropertyOpen} onSave={handleAddProperty} onClose={() => setAddPropertyOpen(false)} />
      </>
    );
  }

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Airbnb · {property.name}</div>
          <h1 className="v-section-title">Calendario <em>de reservas</em>.</h1>
          <p className="v-section-sub">Estadías y limpiezas de {year}{period !== 'all' ? ` · ${monthLabels?.[period] ?? period}` : ' · año completo'}.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="v-btn" onClick={() => setPropertyId(null)}>
            <Icon name="chevron_right" size={12} style={{ transform: 'rotate(180deg)' }} /> Otras propiedades
          </button>
          <button className="v-btn ghost" onClick={openNewLimpieza}>
            <Icon name="sparkle" size={13} /> Agendar limpieza
          </button>
          <button className="v-btn primary" onClick={openNewEstadia}>
            <Icon name="plus" size={13} /> Registrar estadías
          </button>
        </div>
      </div>

      <div className="v-card" ref={scrollCardRef} style={{ padding: 24 }}>
        {monthsToShow.map(m => {
          const monthIdx = MONTH_ABBR.indexOf(m.slice(0, 3));
          return (
            <div key={m} id={`airbnb-month-${m}`} data-month-token={m}>
              <MonthBlock
                year={yearNum} monthIndex={monthIdx} label={monthLabels?.[m] ?? m}
                estadias={propertyEstadias} limpiezas={propertyLimpiezas}
                onBarClick={(estadia) => setEstadiaModal({ item: estadia, defaultDate: null })}
                onDayClick={(dateStr) => setEstadiaModal({ item: null, defaultDate: dateStr })}
                onCleaningClick={(limpieza) => setLimpiezaModal({ item: limpieza, defaultDate: null })}
                onSuggestCleaning={(dateStr) => setLimpiezaModal({ item: null, defaultDate: dateStr })}
              />
            </div>
          );
        })}
      </div>

      <EstadiaModal
        open={!!estadiaModal}
        item={estadiaModal?.item ?? null}
        defaultDate={estadiaModal?.defaultDate}
        onClose={() => setEstadiaModal(null)}
        onSave={(data) => {
          data = { ...data, property: propertyId };
          if (estadiaModal?.item) {
            editEstadia(estadiaModal.item.id, data);
            showToast?.('Estadía actualizada');
          } else {
            addEstadia(data);
            const checkInYear = data.checkIn.slice(0, 4);
            const yearHint = checkInYear !== year ? ` — selecciona el año ${checkInYear} arriba para verla` : '';
            showToast?.(`Estadía registrada${yearHint}`);
          }
          setEstadiaModal(null);
        }}
        onDelete={(id) => { deleteEstadia(id); showToast?.('Estadía eliminada', 'deleted'); setEstadiaModal(null); }}
      />

      <LimpiezaModal
        open={!!limpiezaModal}
        item={limpiezaModal?.item ?? null}
        defaultDate={limpiezaModal?.defaultDate}
        onClose={() => setLimpiezaModal(null)}
        onSave={(data) => {
          data = { ...data, property: propertyId };
          if (limpiezaModal?.item) {
            editLimpieza(limpiezaModal.item.id, data);
            showToast?.('Limpieza actualizada');
          } else {
            addLimpieza(data);
            const dateYear = data.date.slice(0, 4);
            const yearHint = dateYear !== year ? ` — selecciona el año ${dateYear} arriba para verla` : '';
            showToast?.(`Limpieza agendada${yearHint}`);
          }
          setLimpiezaModal(null);
        }}
        onDelete={(id) => { deleteLimpieza(id); showToast?.('Limpieza eliminada', 'deleted'); setLimpiezaModal(null); }}
      />
    </div>
  );
}
