// src/components/layout/Sidebar.jsx
import { NAV_GROUPS } from '../../utils/categories.js';
import { NavItem } from './NavItem.jsx';
import { Icon } from '../ui/Icon.jsx';

export function Sidebar({ view, setView, year, badgeCounts = {}, expandedGroup, onToggleGroup }) {
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
            {group.items.map(item => {
              if (!item.expandable) {
                return (
                  <NavItem key={item.id} item={item} active={view === item.id} onClick={setView} badgeCount={badgeCounts[item.id]} />
                );
              }

              const isExpanded = expandedGroup === item.id;
              const isChildActive = item.children.some(c => c.id === view);

              return (
                <div key={item.id}>
                  <NavItem
                    item={item}
                    active={false}
                    semiActive={isChildActive}
                    onClick={() => onToggleGroup(item.id)}
                    trailing={
                      <Icon name="chevron_right" size={11}
                        style={{ marginLeft: 'auto', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s' }} />
                    }
                  />
                  {isExpanded && item.children.map(child => (
                    <NavItem key={child.id} item={child} active={view === child.id} onClick={setView} badgeCount={badgeCounts[child.id]} sub />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
