// src/components/layout/Sidebar.jsx
import { NAV_GROUPS } from '../../utils/categories.js';
import { NavItem } from './NavItem.jsx';

export function Sidebar({ view, setView }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <span className="sidebar__logo-mark">D</span>
        <span className="sidebar__logo-text">Diego Dashboard</span>
      </div>
      <nav className="sidebar__nav">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="nav-group">
            <div className="nav-group__label">{group.label}</div>
            {group.items.map(item => (
              <NavItem key={item.id} item={item} active={view === item.id} onClick={setView} />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
