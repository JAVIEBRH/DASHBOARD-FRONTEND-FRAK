// src/components/layout/NavItem.jsx
import { Icon } from '../ui/Icon.jsx';

export function NavItem({ item, active, onClick }) {
  const supremeClass = item.supreme === 'pos' ? 'supreme-pos' : item.supreme === 'neg' ? 'supreme-neg' : '';
  return (
    <button
      className={`v-nav-item ${supremeClass}${active ? ' active' : ''}`}
      onClick={() => onClick(item.id)}
    >
      <Icon name={item.icon} size={15} color="currentColor" />
      <span>{item.label}</span>
    </button>
  );
}
