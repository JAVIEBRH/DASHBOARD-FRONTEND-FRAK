// src/components/KanbanTaskModal.jsx
import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon.jsx';

const EMPTY = { title: '', notes: '' };

export function KanbanTaskModal({ open, item, propertyName, onSave, onDelete, onClose }) {
  const [form, setForm]     = useState(EMPTY);
  const [error, setError]   = useState('');
  const [confirmDel, setConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(item ? { title: item.title, notes: item.notes ?? '' } : EMPTY);
      setError('');
      setConfirm(false);
    }
  }, [open, item]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!form.title.trim()) { setError('El título es requerido'); return; }
    onSave({ title: form.title.trim(), notes: form.notes.trim(), status: item?.status ?? 'todo' });
  };

  const isEdit = !!item;

  return (
    <div className="v-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="v-modal" onClick={e => e.stopPropagation()}>
        <div className="v-modal-head">
          <div>
            <div className="v-modal-eyebrow">Airbnb · Kanban · {propertyName}</div>
            <div className="v-modal-title">{isEdit ? 'Editar tarea' : 'Nueva tarea'}</div>
          </div>
          <button className="v-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14"/>
            </svg>
          </button>
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Título</div>
          <input className={'v-input' + (error ? ' v-input-error' : '')}
            placeholder="ej: Cambiar ampolleta living"
            value={form.title} onChange={e => { setForm(f => ({ ...f, title: e.target.value })); setError(''); }} autoFocus />
          {error && <div className="v-form-error">{error}</div>}
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Notas (opcional)</div>
          <input className="v-input" placeholder="detalle adicional…"
            value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        {confirmDel ? (
          <div style={{ marginTop: 18, padding: 14, background: 'rgba(212,58,42,0.06)', border: '1px solid var(--signal-neg)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>¿Eliminar esta tarea?</div>
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
              {isEdit ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
