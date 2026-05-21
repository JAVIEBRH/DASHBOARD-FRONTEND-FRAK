// src/components/ui/Toast.jsx
export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast--${t.type}${t.removing ? ' toast--out' : ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
