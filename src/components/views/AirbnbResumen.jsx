// src/components/views/AirbnbResumen.jsx
import { Icon } from '../ui/Icon.jsx';
import { fmtDate, fmtCLP } from '../../utils/formatters.js';
import { isLowStockConsumible } from '../../utils/stock.js';
import { MonthBlock } from './AirbnbCalendar.jsx';

const MONTH_NAMES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

export function AirbnbResumen({ estadias, limpiezas, stock, kanbanTasks, stockProperties, setView }) {
  const today = new Date().toISOString().slice(0, 10);
  const propertyName = (id) => stockProperties.find(p => p.id === id)?.name ?? id;

  const upcoming = [...estadias]
    .filter(e => e.checkOut >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 5);

  const lowStockCount = stock.filter(isLowStockConsumible).length;
  const pendingTasks = kanbanTasks.filter(t => t.status !== 'done').length;

  const perProperty = stockProperties.map(p => {
    const propStock = stock.filter(s => s.property === p.id);
    const propLowStock = propStock.filter(isLowStockConsumible).length;
    const propPendingTasks = kanbanTasks.filter(t => t.property === p.id && t.status !== 'done').length;
    const nextStay = estadias
      .filter(e => e.property === p.id && e.checkOut >= today)
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
    const ingresos = estadias
      .filter(e => e.property === p.id && e.monto)
      .reduce((sum, e) => sum + Number(e.monto), 0);
    return { id: p.id, name: p.name, lowStock: propLowStock, pendingTasks: propPendingTasks, nextStay, ingresos };
  });

  const totalIngresos = perProperty.reduce((sum, p) => sum + p.ingresos, 0);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Airbnb</div>
          <h1 className="v-section-title">Resumen.</h1>
          <p className="v-section-sub">Vista general de reservas, stock y tareas.</p>
        </div>
      </div>

      <div className="v-kpi-row" style={{ marginBottom: 20 }}>
        <div className="v-card elev" style={{ cursor: 'pointer' }} onClick={() => setView('airbnb_calendario')}>
          <div className="v-kpi-label">Próximas estadías</div>
          <div className="v-kpi-value">{upcoming.length}</div>
          <div className="v-kpi-delta" style={{ color: 'var(--ink-2)' }}>ver calendario →</div>
        </div>
        <div className="v-card" style={{ cursor: 'pointer' }} onClick={() => setView('stock')}>
          <div className="v-kpi-label">Alertas de stock</div>
          <div className="v-kpi-value" style={{ color: lowStockCount > 0 ? 'var(--signal-neg)' : undefined }}>{lowStockCount}</div>
          <div className="v-kpi-delta" style={{ color: 'var(--ink-2)' }}>ver stock →</div>
        </div>
        <div className="v-card" style={{ cursor: 'pointer' }} onClick={() => setView('airbnb_kanban')}>
          <div className="v-kpi-label">Tareas pendientes</div>
          <div className="v-kpi-value">{pendingTasks}</div>
          <div className="v-kpi-delta" style={{ color: 'var(--ink-2)' }}>ver kanban →</div>
        </div>
        <div className="v-card">
          <div className="v-kpi-label">Ingresos totales</div>
          <div className="v-kpi-value" style={{ color: totalIngresos > 0 ? 'var(--signal-pos)' : undefined }}>
            {totalIngresos > 0 ? fmtCLP(totalIngresos, { compact: true, sign: false }) : '—'}
          </div>
          <div className="v-kpi-delta" style={{ color: 'var(--ink-2)' }}>ambas propiedades</div>
        </div>
      </div>

      <div className="v-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}>
          Alertas por propiedad
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px 130px 1fr', padding: '10px 18px', fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--line)' }}>
          <div>Propiedad</div>
          <div>Stock bajo</div>
          <div>Tareas pendientes</div>
          <div>Ingresos registrados</div>
          <div>Próxima estadía</div>
        </div>
        {perProperty.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px 130px 1fr', padding: '12px 18px', alignItems: 'center', fontSize: 13, borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="home" size={14} color="var(--ink-3)" />
              {p.name}
            </div>
            <div
              onClick={() => setView('stock')}
              style={{ cursor: 'pointer', color: p.lowStock > 0 ? 'var(--signal-neg)' : 'var(--ink-3)', fontWeight: p.lowStock > 0 ? 600 : 400 }}>
              {p.lowStock > 0 ? `⚠ ${p.lowStock}` : '— sin alertas'}
            </div>
            <div
              onClick={() => setView('airbnb_kanban')}
              style={{ cursor: 'pointer', color: p.pendingTasks > 0 ? 'var(--jat)' : 'var(--ink-3)', fontWeight: p.pendingTasks > 0 ? 600 : 400 }}>
              {p.pendingTasks > 0 ? `${p.pendingTasks} pendientes` : '— sin tareas'}
            </div>
            <div
              onClick={() => setView('airbnb_calendario')}
              style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', color: p.ingresos > 0 ? 'var(--signal-pos)' : 'var(--ink-3)', fontWeight: p.ingresos > 0 ? 600 : 400 }}>
              {p.ingresos > 0 ? fmtCLP(p.ingresos, { compact: true, sign: false }) : '—'}
            </div>
            <div style={{ color: 'var(--ink-2)', fontSize: 12.5 }}>
              {p.nextStay
                ? <>{p.nextStay.guestName} · <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink-3)' }}>{fmtDate(p.nextStay.checkIn)}</span></>
                : <span style={{ color: 'var(--ink-3)' }}>Sin estadías próximas</span>}
            </div>
          </div>
        ))}
        {perProperty.length === 0 && (
          <div style={{ padding: '18px', color: 'var(--ink-3)', fontSize: 13 }}>No hay propiedades registradas todavía.</div>
        )}
        {perProperty.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 140px 130px 1fr', padding: '12px 18px', alignItems: 'center', fontSize: 13, background: 'var(--surface-2)' }}>
            <div style={{ fontWeight: 600 }}>Total</div>
            <div />
            <div />
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: totalIngresos > 0 ? 'var(--signal-pos)' : 'var(--ink-3)' }}>
              {totalIngresos > 0 ? fmtCLP(totalIngresos, { compact: true, sign: false }) : '—'}
            </div>
            <div />
          </div>
        )}
      </div>

      <div className="v-card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', marginBottom: 14 }}>
          Calendario general · todas las propiedades
        </div>
        <MonthBlock
          year={currentYear} monthIndex={currentMonthIndex} label={MONTH_NAMES[currentMonthIndex]}
          estadias={estadias} limpiezas={limpiezas}
          onBarClick={() => setView('airbnb_calendario')}
          onDayClick={() => setView('airbnb_calendario')}
          onCleaningClick={() => setView('airbnb_calendario')}
          onSuggestCleaning={() => setView('airbnb_calendario')}
          propertyTag={(estadia) => propertyName(estadia.property)}
        />
      </div>

      <div className="v-card" style={{ padding: 18 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)', marginBottom: 14 }}>
          Próximas estadías
        </div>
        {upcoming.length === 0 ? (
          <div style={{ color: 'var(--ink-3)', fontSize: 13, padding: '8px 0' }}>No hay estadías próximas registradas.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                <Icon name="calendar" size={14} color="var(--ink-3)" />
                <span style={{ fontWeight: 500 }}>{e.guestName}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-3)', background: 'var(--surface-2)', borderRadius: 5, padding: '2px 6px' }}>
                  {propertyName(e.property)}
                </span>
                <span style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                  {fmtDate(e.checkIn)} → {fmtDate(e.checkOut)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
