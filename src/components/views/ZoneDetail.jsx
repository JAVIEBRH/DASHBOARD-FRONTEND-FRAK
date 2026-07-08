// src/components/views/ZoneDetail.jsx
import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { ZONES, zoneLabel, stockStatus, statusMeta } from '../../utils/stock.js';

export function ZoneDetail({ zone, isStockZone, items, onBack, onSelectZone, onAdd, onEdit }) {
  const [search, setSearch]                 = useState('');
  const [categoryFilter, setCategoryFilter]  = useState('');
  const [statusFilter, setStatusFilter]      = useState('');

  const categories = [...new Set(items.map(i => i.category))].sort();

  const filtered = items.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && i.category !== categoryFilter) return false;
    if (statusFilter && stockStatus(i, isStockZone) !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Operaciones · {zoneLabel(zone)}</div>
          <h1 className="v-section-title">Inventario <em>{zoneLabel(zone).toLowerCase()}</em>.</h1>
        </div>
        <button className="v-btn" onClick={onBack}>
          <Icon name="chevron_right" size={12} style={{ transform: 'rotate(180deg)' }} /> Todas las zonas
        </button>
      </div>

      <div className="v-zone-pills">
        {ZONES.map(z => (
          <button key={z.id} className={`v-pill${z.id === zone ? ' active' : ''}`} onClick={() => onSelectZone(z.id)}>
            {z.label}
          </button>
        ))}
      </div>

      <div className="v-card">
        <div className="v-chart-head">
          <div>
            <div className="v-chart-title">{zoneLabel(zone)}</div>
            <div className="v-chart-sub">{filtered.length} de {items.length} producto{items.length === 1 ? '' : 's'}</div>
          </div>
          <button className="v-btn primary" onClick={onAdd}>
            <Icon name="plus" size={13} /> Nuevo producto
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <Icon name="search" size={14} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="v-input" style={{ paddingLeft: 36 }} placeholder="Buscar productos…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="v-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">Categoría</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="v-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Estado</option>
            <option value="ok">{isStockZone ? 'En stock' : 'Presente'}</option>
            {isStockZone && <option value="bajo">Bajo stock</option>}
            <option value="agotado">{isStockZone ? 'Agotado' : 'Faltante'}</option>
          </select>
        </div>

        {filtered.length === 0 && <div className="v-empty">{items.length === 0 ? 'Sin productos en esta zona.' : 'Ningún producto coincide con el filtro.'}</div>}

        {filtered.length > 0 && (
          <div className="v-stock-table-wrap">
            <div className="v-stock-row-head">
              <span>Producto</span>
              <span>Categoría</span>
              <span>Stock</span>
              <span>Estado</span>
              <span></span>
            </div>
            {filtered.map((item, i) => {
              const status = stockStatus(item, isStockZone);
              const meta = statusMeta(status, isStockZone);
              const qty = isStockZone ? item.qtyBodega : item.qty;
              return (
                <div key={item.id} className="v-stock-row" style={{ animationDelay: Math.min(i * 25, 250) + 'ms' }}>
                  <div>
                    <div className="v-stock-name">{item.name}</div>
                    {isStockZone && item.pctEnUso != null && (
                      <div className="v-stock-meta">Envase abierto: {item.pctEnUso}% en uso</div>
                    )}
                  </div>
                  <div className="v-stock-cat">{item.category}</div>
                  <div className="v-stock-qty">
                    {qty}{isStockZone && <span className="thresh">mín. {item.umbralUnidades}</span>}
                  </div>
                  <div className="v-stock-status" style={{ color: meta.color }}>
                    <i className="dot" style={{ background: meta.color }} />
                    {meta.label}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <button className="v-btn ghost" style={{ padding: 6 }} onClick={() => onEdit(item)}>
                      <Icon name="edit" size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
