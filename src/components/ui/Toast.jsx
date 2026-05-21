// src/components/ui/Toast.jsx
import { Icon } from './Icon.jsx';

export function ToastContainer({ toasts }) {
  return (
    <div className="v-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`v-toast ${t.type}${t.removing ? ' removing' : ''}`}>
          <Icon name={t.type === 'success' ? 'leaf' : t.type === 'error' ? 'bell' : 'download'} size={15} color="var(--brass-soft)" />
          {t.message}
        </div>
      ))}
    </div>
  );
}
