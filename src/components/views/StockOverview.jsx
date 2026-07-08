// src/components/views/StockOverview.jsx
import { ZONES, zoneStats, STATUS_META } from '../../utils/stock.js';

export function StockOverview({ stock, furniture, onSelectZone }) {
  const totalProductos = stock.length + furniture.length;
  const stockStats = zoneStats(stock, true);
  const furnitureStats = zoneStats(furniture, false);
  const porAgotar = stockStats.bajoStock + furnitureStats.bajoStock;
  const agotados = stockStats.agotados + furnitureStats.agotados;

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Operaciones</div>
          <h1 className="v-section-title">Inventario <em>por zona</em>.</h1>
          <p className="v-section-sub">Consumibles y activos fijos de Casa PAC, agrupados por dónde viven.</p>
        </div>
      </div>

      <div className="v-kpi-hero">
        <div className="v-kpi-cell primary">
          <div className="v-kpi-label">Total productos</div>
          <div className="v-kpi-value">{totalProductos}</div>
          <div className="v-kpi-sub">En {ZONES.length} zonas</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Por agotar</div>
          <div className="v-kpi-value" style={{ color: 'var(--jat)' }}>{porAgotar}</div>
          <div className="v-kpi-sub">Bajo el umbral de alerta</div>
        </div>
        <div className="v-kpi-cell">
          <div className="v-kpi-label">Agotados</div>
          <div className="v-kpi-value neg">{agotados}</div>
          <div className="v-kpi-sub">Sin unidades disponibles</div>
        </div>
      </div>

      <div className="v-zone-grid">
        {ZONES.map(z => {
          const zoneItems = z.id === 'stock' ? stock : furniture.filter(f => f.zone === z.id);
          const stats = zoneStats(zoneItems, z.id === 'stock');
          const ok = stats.total - stats.bajoStock - stats.agotados;
          const pct = (n) => stats.total === 0 ? 0 : (n / stats.total) * 100;

          return (
            <button key={z.id} className="v-card v-zone-card" onClick={() => onSelectZone(z.id)}>
              <div className="v-zone-name">{z.label}</div>
              <div className="v-zone-count">{stats.total} producto{stats.total === 1 ? '' : 's'}</div>

              {stats.total > 0 ? (
                <>
                  <div className="v-zone-bar">
                    {ok > 0 && <span style={{ width: pct(ok) + '%', background: STATUS_META.ok.color }} />}
                    {stats.bajoStock > 0 && <span style={{ width: pct(stats.bajoStock) + '%', background: STATUS_META.bajo.color }} />}
                    {stats.agotados > 0 && <span style={{ width: pct(stats.agotados) + '%', background: STATUS_META.agotado.color }} />}
                  </div>
                  <div className="v-zone-legend">
                    {stats.agotados > 0 && <span><i className="dot" style={{ background: STATUS_META.agotado.color }} />{stats.agotados} agotado{stats.agotados === 1 ? '' : 's'}</span>}
                    {stats.bajoStock > 0 && <span><i className="dot" style={{ background: STATUS_META.bajo.color }} />{stats.bajoStock} bajo{stats.bajoStock === 1 ? '' : 's'}</span>}
                    {stats.agotados === 0 && stats.bajoStock === 0 && <span><i className="dot" style={{ background: STATUS_META.ok.color }} />Todo en orden</span>}
                  </div>
                </>
              ) : (
                <div className="v-zone-legend">Sin productos registrados</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
