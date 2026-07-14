// src/components/LimpiezaModal.jsx
import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon.jsx';

const EMPTY = { date: '', notes: '' };

function validate(f) {
  const e = {};
  if (!f.date) e.date = 'La fecha es requerida';
  return e;
}

export function LimpiezaModal({ open, item, defaultDate, onSave, onDelete, onClose }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [confirmDel, setConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({ date: item.date, notes: item.notes ?? '' });
      } else {
        setForm({ date: defaultDate ?? '', notes: '' });
      }
      setErrors({});
      setConfirm(false);
    }
  }, [open, item, defaultDate]);

  if (!open) return null;

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = () => {
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ property: 'pac', date: form.date, notes: form.notes.trim(), done: item?.done ?? false });
  };

  const isEdit = !!item;

  return (
    <div className="v-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="v-modal" onClick={e => e.stopPropagation()}>
        <div className="v-modal-head">
          <div>
            <div className="v-modal-eyebrow">Airbnb · Calendario</div>
            <div className="v-modal-title">{isEdit ? 'Editar limpieza' : 'Agendar limpieza'}</div>
          </div>
          <button className="v-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14"/>
            </svg>
          </button>
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Fecha</div>
          <input className={'v-input' + (errors.date ? ' v-input-error' : '')}
            type="date" value={form.date} onChange={e => set('date', e.target.value)} autoFocus />
          {errors.date && <div className="v-form-error">{errors.date}</div>}
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Notas (opcional)</div>
          <input className="v-input" placeholder="ej: limpieza profunda, cambio de sábanas…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        {confirmDel ? (
          <div style={{ marginTop: 18, padding: 14, background: 'rgba(212,58,42,0.06)', border: '1px solid var(--signal-neg)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>¿Eliminar esta limpieza?</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 12 }}>Esta acción no se puede deshacer.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="v-btn ghost" onClick={() => setConfirm(false)}>Cancelar</button>
              <button className="v-btn" style={{ background: 'var(--signal-neg)', color: '#fff', borderColor: 'var(--signal-neg)' }}
                onClick={() => onDelete(item.id)}>
                <Icon name="trash" size={13} /> Sí, eliminar
              </button>
            </div>
          </div>
        ) : (
          <div className="v-modal-foot">
            {isEdit && (
              <button className="v-btn ghost" style={{ color: 'var(--signal-neg)', marginRight: 'auto' }}
                onClick={() => setConfirm(true)}>
                <Icon name="trash" size={13} /> Eliminar
              </button>
            )}
            <button className="v-btn" onClick={onClose}>Cancelar</button>
            <button className="v-btn primary" onClick={handleSubmit}>
              {isEdit ? 'Guardar cambios' : 'Agendar limpieza'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
