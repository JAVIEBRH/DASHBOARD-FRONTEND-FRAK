// src/components/views/StockOverview.jsx
import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [coords, setCoords] = useState(null);
  const cellRef = useRef(null);

  // Wide enough for a 2-column grid so a realistic alert count (10-20 items)
  // reads at a glance without an internal scrollbar, which defeated the
  // "quick glance" purpose the popover exists for.
  const POPOVER_WIDTH = 440;

  const handleEnter = () => {
    const rect = cellRef.current?.getBoundingClientRect();
    if (rect) {
      // Clamp to the viewport: anchoring to `rect.left` unconditionally let the
      // popover run off the right edge (and get visually clipped) for KPI
      // cells near the right side of the screen, like "Agotados".
      const left = Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 16);
      setCoords({ top: rect.bottom + 8, left: Math.max(left, 16) });
    }
    setOpen(true);
  };

  return (
    <div
      ref={cellRef}
      style={{ position: 'relative', height: '100%' }}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open && coords && createPortal(
        // Rendered via portal to document.body, not as a nested child here:
        // several ancestors (.v-kpi-hero, .v-content) have a CSS `animation`
        // that sets `transform`, which makes them the containing block for
        // `position: fixed` descendants per spec — so a fixed-position popover
        // nested inside them is NOT actually positioned relative to the real
        // viewport, it's offset relative to that ancestor instead. Portaling
        // to <body> (which has no transform) sidesteps that entirely.
        <div style={{
          position: 'fixed', top: coords.top, left: coords.left, zIndex: 20,
          width: POPOVER_WIDTH, maxHeight: 340, overflowY: 'auto',
          background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 10,
          boxShadow: 'var(--shadow-md)', padding: '12px 14px',
        }}>
          {items.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{emptyLabel}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 16 }}>
              {items.map(item => (
                <div key={item.id} style={{ padding: '5px 0', fontSize: 12.5, borderBottom: '1px solid var(--line)' }}>
                  <div style={{ color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ color: 'var(--ink-3)', fontSize: 11 }}>
                    {item.qtyBodega} en bodega
                    {item.enUso?.length > 0 ? ` · ${item.enUso.map(u => `${u.pct}%`).join(', ')} en uso` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
