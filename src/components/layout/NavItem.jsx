// src/components/layout/NavItem.jsx
import { Icon } from '../ui/Icon.jsx';

export function NavItem({ item, active, onClick, badgeCount, sub = false, semiActive = false, trailing = null }) {
  const supremeClass = item.supreme === 'pos' ? 'supreme-pos' : item.supreme === 'neg' ? 'supreme-neg' : '';
  const subClass = sub ? ' sub' : '';
  const semiActiveClass = semiActive && !active ? ' semi-active' : '';
  return (
    <button
      className={`v-nav-item ${supremeClass}${subClass}${semiActiveClass}${active ? ' active' : ''}`}
      onClick={() => onClick(item.id)}
    >
      <Icon name={item.icon} size={15} color="currentColor" />
      <span>{item.label}</span>
      {trailing}
      {badgeCount > 0 && (
        <span style={{
          marginLeft: 'auto', background: 'var(--signal-neg)', color: '#fff',
          fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px',
          fontFamily: 'var(--font-mono)',
        }}>{badgeCount}</span>
      )}
    </button>
  );
}
