// src/components/views/PropertySelector.jsx
import { Icon } from '../ui/Icon.jsx';

export function PropertySelector({ properties, onSelect, onAddProperty }) {
  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Operaciones</div>
          <h1 className="v-section-title">Stock <em>por propiedad</em>.</h1>
          <p className="v-section-sub">Elige una propiedad para ver su inventario de consumibles y activos fijos.</p>
        </div>
      </div>

      <div className="v-property-grid">
        {properties.map(p => (
          <button key={p.id} className="v-card v-property-card" onClick={() => onSelect(p.id)}>
            <div className="v-property-icon"><Icon name="home" size={28} /></div>
            <div className="v-property-name">{p.name}</div>
          </button>
        ))}
        <button className="v-card v-property-card add" onClick={onAddProperty}>
          <div className="v-property-icon"><Icon name="plus" size={28} /></div>
          <div className="v-property-name">Agregar propiedad</div>
        </button>
      </div>
    </div>
  );
}
