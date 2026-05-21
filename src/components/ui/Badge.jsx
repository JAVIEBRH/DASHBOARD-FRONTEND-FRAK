// src/components/ui/Badge.jsx
export function Badge({ label, color = '#94A3B8' }) {
  return (
    <span className="badge" style={{ background: color + '22', color }}>
      {label}
    </span>
  );
}
