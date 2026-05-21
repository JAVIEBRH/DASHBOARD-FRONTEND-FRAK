// src/components/layout/Sidebar.jsx
import { NAV_GROUPS } from '../../utils/categories.js';
import { NavItem } from './NavItem.jsx';
import { Icon } from '../ui/Icon.jsx';

export function Sidebar({ view, setView, year }) {
  return (
    <aside className="v-sidebar">
      <div className="v-brand">
        <div className="v-brand-mark">D</div>
        <div>
          <div className="v-brand-name">Diego</div>
          <div className="v-brand-sub">Contabilidad · {year}</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="v-nav-group-label">{group.label}</div>
            {group.items.map(item => (
              <NavItem key={item.id} item={item} active={view === item.id} onClick={setView} />
            ))}
          </div>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ height: 1, background: 'var(--line)', margin: '12px 2px 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 10, cursor: 'pointer', transition: 'background .13s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(26,31,27,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--emerald)', display: 'grid', placeItems: 'center', fontSize: 11.5, fontWeight: 600, color: 'var(--brass-soft)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', flexShrink: 0 }}>
            DA
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.2 }}>Diego A.</div>
            <div style={{ color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 2 }}>Propietario</div>
          </div>
          <Icon name="settings" size={14} color="var(--ink-4)" />
        </div>
      </div>
    </aside>
  );
}
