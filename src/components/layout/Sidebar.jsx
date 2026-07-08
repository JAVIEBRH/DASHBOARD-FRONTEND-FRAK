// src/components/layout/Sidebar.jsx
import { NAV_GROUPS } from '../../utils/categories.js';
import { NavItem } from './NavItem.jsx';

export function Sidebar({ view, setView, year, badgeCounts = {} }) {
  return (
    <aside className="v-sidebar">
      <div className="v-brand">
        <div className="v-brand-mark">S</div>
        <div>
          <div className="v-brand-name">Send Austral</div>
          <div className="v-brand-sub">Contabilidad · {year}</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <div className="v-nav-group-label">{group.label}</div>
            {group.items.map(item => (
              <NavItem key={item.id} item={item} active={view === item.id} onClick={setView} badgeCount={badgeCounts[item.id]} />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
