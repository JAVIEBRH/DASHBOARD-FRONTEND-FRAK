// src/components/views/StockOverview.jsx
import { Icon } from '../ui/Icon.jsx';
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
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="v-card">
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>Total Productos</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28 }}>{totalProductos}</div>
        </div>
        <div className="v-card">
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>Por Agotar</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--jat)' }}>{porAgotar}</div>
        </div>
        <div className="v-card">
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>Agotados</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'var(--signal-neg)' }}>{agotados}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
        {ZONES.map(z => {
          const zoneItems = z.id === 'stock' ? stock : furniture.filter(f => f.zone === z.id);
          const stats = zoneStats(zoneItems, z.id === 'stock');
          const status = stats.agotados > 0 ? 'agotado' : stats.bajoStock > 0 ? 'bajo' : 'ok';
          const meta = STATUS_META[status];
          return (
            <button key={z.id} className="v-card" onClick={() => onSelectZone(z.id)}
              style={{ textAlign: 'left', cursor: 'pointer', border: 'none', display: 'block', width: '100%', font: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Icon name="box" size={18} color="var(--ink-2)" />
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 10, background: meta.color + '22', color: meta.color }}>
                  {stats.agotados > 0 ? `${stats.agotados} out of stock` : stats.bajoStock > 0 ? `${stats.bajoStock} items low stock` : 'All Good'}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{z.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{stats.total} Total Items</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
