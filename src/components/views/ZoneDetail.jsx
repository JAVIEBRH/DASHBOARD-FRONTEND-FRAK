// src/components/views/ZoneDetail.jsx
import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { zoneLabel, stockStatus, STATUS_META } from '../../utils/stock.js';

export function ZoneDetail({ zone, isStockZone, items, onBack, onAdd, onEdit }) {
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
          <div className="v-eyebrow">Operaciones</div>
          <h1 className="v-section-title">Gestión de Zona <em>Detalle CRUD</em>.</h1>
        </div>
        <button className="v-btn" onClick={onBack}>
          <Icon name="arrow_up" size={12} style={{ transform: 'rotate(-90deg)' }} /> Back to Overview
        </button>
      </div>

      <div className="v-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 500 }}>Inventario - {zoneLabel(zone).toUpperCase()}</div>
          <button className="v-btn primary" onClick={onAdd}>
            <Icon name="plus" size={13} /> Nuevo Producto
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icon name="search" size={14} color="var(--ink-3)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input className="v-input" style={{ paddingLeft: 36 }} placeholder="Buscar productos…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="v-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">Categoría</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="v-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">Estado</option>
            <option value="ok">En Stock</option>
            <option value="bajo">Bajo Stock</option>
            <option value="agotado">Agotado</option>
          </select>
        </div>

        {filtered.length === 0 && <div className="v-empty">Sin productos.</div>}

        {filtered.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)' }}>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 11, color: 'var(--ink-3)' }}>PRODUCTO</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 11, color: 'var(--ink-3)' }}>CATEGORÍA</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 11, color: 'var(--ink-3)' }}>STOCK</th>
                <th style={{ textAlign: 'left', padding: '8px 4px', fontSize: 11, color: 'var(--ink-3)' }}>ESTADO</th>
                <th style={{ textAlign: 'right', padding: '8px 4px', fontSize: 11, color: 'var(--ink-3)' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const status = stockStatus(item, isStockZone);
                const meta = STATUS_META[status];
                const qty = isStockZone ? item.qtyBodega : item.qty;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '10px 4px' }}>
                      {item.name}
                      {isStockZone && item.pctEnUso != null && (
                        <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>En uso: {item.pctEnUso}%</div>
                      )}
                    </td>
                    <td style={{ padding: '10px 4px', color: 'var(--ink-2)' }}>{item.category}</td>
                    <td style={{ padding: '10px 4px', fontFamily: 'var(--font-mono)' }}>{qty}</td>
                    <td style={{ padding: '10px 4px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: meta.color }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: meta.color }} />
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ padding: '10px 4px', textAlign: 'right' }}>
                      <button className="v-btn ghost" style={{ padding: 6 }} onClick={() => onEdit(item)}>
                        <Icon name="edit" size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
