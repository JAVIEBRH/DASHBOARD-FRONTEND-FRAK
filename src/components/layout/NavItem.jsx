// src/components/layout/NavItem.jsx
import { Icon } from '../ui/Icon.jsx';

export function NavItem({ item, active, onClick }) {
  return (
    <button
      className={`nav-item${active ? ' nav-item--active' : ''}`}
      onClick={() => onClick(item.id)}
    >
      <Icon name={item.icon} size={16} />
      <span>{item.label}</span>
    </button>
  );
}
