// src/components/views/AirbnbPlaceholder.jsx
import { Icon } from '../ui/Icon.jsx';

export function AirbnbPlaceholder({ title, description, icon }) {
  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Airbnb</div>
          <h1 className="v-section-title">{title}</h1>
        </div>
      </div>
      <div className="v-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <Icon name={icon} size={32} color="var(--ink-3)" />
        <p style={{ marginTop: 14, color: 'var(--ink-3)', fontSize: 14 }}>{description}</p>
      </div>
    </div>
  );
}
