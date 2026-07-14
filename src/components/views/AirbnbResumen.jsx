// src/components/views/AirbnbResumen.jsx
import { Icon } from '../ui/Icon.jsx';
import { fmtDate } from '../../utils/formatters.js';
import { isLowStockConsumible } from '../../utils/stock.js';

export function AirbnbResumen({ estadias, stock, kanbanTasks, setView }) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = [...estadias]
    .filter(e => e.checkOut >= today)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 5);

  const lowStockCount = stock.filter(isLowStockConsumible).length;
  const pendingTasks = kanbanTasks.filter(t => t.status !== 'done').length;

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
