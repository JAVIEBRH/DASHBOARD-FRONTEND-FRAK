// src/components/views/StockOverview.jsx
import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { zoneStats, statusMeta, stockStatus } from '../../utils/stock.js';

export function StockOverview({ propertyName, zones, stock, furniture, onSelectZone, onBackToProperties }) {
  const totalProductos = stock.length + furniture.length;
  // "Por agotar" y "Agotados" son métricas de alerta — solo tiene sentido medirlas sobre
  // consumibles (un mueble faltante no es una alerta de reposición, es un dato de inventario).
  const stockStats = zoneStats(stock, true);
  const porAgotar = stockStats.bajoStock;
  const agotados = stockStats.agotados;

  const porAgotarItems = stock.filter(i => stockStatus(i, true) === 'bajo');
  const agotadosItems  = stock.filter(i => stockStatus(i, true) === 'agotado');

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Airbnb · {propertyName}</div>
          <h1 className="v-section-title">Inventario <em>por zona</em>.</h1>
          <p className="v-section-sub">Consumibles y activos fijos, agrupados por dónde viven.</p>
        </div>
        <button className="v-btn" onClick={onBackToProperties}>
          <Icon name="chevron_right" size={12} style={{ transform: 'rotate(180deg)' }} /> Otras propiedades
        </button>
      </div>

      <div className="v-kpi-hero">
        <div className="v-kpi-cell primary">
          <div className="v-kpi-label">Total productos</div>
          <div className="v-kpi-value">{totalProductos}</div>
          <div className="v-kpi-sub">En {zones.length} zonas</div>
        </div>
        <KpiHoverList items={porAgotarItems} emptyLabel="Nada por agotar.">
          <div className="v-kpi-cell" style={{ cursor: 'default' }}>
            <div className="v-kpi-label">Por agotar</div>
            <div className="v-kpi-value" style={{ color: 'var(--jat)' }}>{porAgotar}</div>
            <div className="v-kpi-sub">Consumibles bajo el umbral de alerta</div>
          </div>
        </KpiHoverList>
        <KpiHoverList items={agotadosItems} emptyLabel="Nada agotado.">
          <div className="v-kpi-cell">
            <div className="v-kpi-label">Agotados</div>
            <div className="v-kpi-value neg">{agotados}</div>
            <div className="v-kpi-sub">Consumibles sin unidades disponibles</div>
          </div>
        </KpiHoverList>
      </div>

      <div className="v-zone-grid">
        {zones.map(z => {
          const isStockZone = z.id === 'stock';
          const zoneItems = isStockZone ? stock : furniture.filter(f => f.zone === z.id);
          const stats = zoneStats(zoneItems, isStockZone);
          const ok = stats.total - stats.bajoStock - stats.agotados;
          const pct = (n) => stats.total === 0 ? 0 : (n / stats.total) * 100;
          const criticalLabel = isStockZone ? 'agotado' : 'faltante';

          return (
            <button key={z.id} className="v-card v-zone-card" onClick={() => onSelectZone(z.id)}>
              <div className="v-zone-name">{z.label}</div>
              <div className="v-zone-count">{stats.total} producto{stats.total === 1 ? '' : 's'}</div>

              {stats.total > 0 ? (
                <>
                  <div className="v-zone-bar">
                    {ok > 0 && <span style={{ width: pct(ok) + '%', background: statusMeta('ok', isStockZone).color }} />}
                    {stats.bajoStock > 0 && <span style={{ width: pct(stats.bajoStock) + '%', background: 'var(--jat)' }} />}
                    {stats.agotados > 0 && <span style={{ width: pct(stats.agotados) + '%', background: statusMeta('agotado', isStockZone).color }} />}
                  </div>
                  <div className="v-zone-legend">
                    {stats.agotados > 0 && <span><i className="dot" style={{ background: statusMeta('agotado', isStockZone).color }} />{stats.agotados} {criticalLabel}{stats.agotados === 1 ? '' : 's'}</span>}
                    {stats.bajoStock > 0 && <span><i className="dot" style={{ background: 'var(--jat)' }} />{stats.bajoStock} bajo{stats.bajoStock === 1 ? '' : 's'}</span>}
                    {stats.agotados === 0 && stats.bajoStock === 0 && <span><i className="dot" style={{ background: statusMeta('ok', isStockZone).color }} />Todo en orden</span>}
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

function KpiHoverList({ items, emptyLabel, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ position: 'relative', height: '100%' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 8, zIndex: 20,
          minWidth: 220, maxWidth: 300, maxHeight: 260, overflowY: 'auto',
          background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 10,
          boxShadow: 'var(--shadow-md)', padding: '10px 12px',
        }}>
          {items.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{emptyLabel}</div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{ padding: '5px 0', fontSize: 12.5, borderBottom: '1px solid var(--line)' }}>
                <div style={{ color: 'var(--ink)' }}>{item.name}</div>
                <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                  {item.category} · {item.qtyBodega} en bodega
                  {item.pctEnUso != null ? ` · ${item.pctEnUso}% en uso` : ''}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
