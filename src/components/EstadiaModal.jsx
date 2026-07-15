// src/components/EstadiaModal.jsx
import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon.jsx';

const EMPTY = { guestName: '', checkIn: '', checkOut: '', monto: '', notes: '' };

function validate(f) {
  const e = {};
  if (!f.guestName.trim()) e.guestName = 'El nombre del huésped es requerido';
  if (!f.checkIn)  e.checkIn = 'La fecha de check-in es requerida';
  if (!f.checkOut) e.checkOut = 'La fecha de check-out es requerida';
  if (f.checkIn && f.checkOut && f.checkOut < f.checkIn) e.checkOut = 'El check-out no puede ser antes del check-in';
  if (f.monto !== '' && (isNaN(Number(f.monto)) || Number(f.monto) < 0)) e.monto = 'Ingresa un monto válido';
  return e;
}

export function EstadiaModal({ open, item, defaultDate, onSave, onDelete, onClose }) {
  const [form, setForm]     = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [confirmDel, setConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          guestName: item.guestName, checkIn: item.checkIn, checkOut: item.checkOut,
          monto: item.monto ?? '', notes: item.notes ?? '',
        });
      } else {
        setForm({ ...EMPTY, checkIn: defaultDate ?? '', checkOut: defaultDate ?? '' });
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
    onSave({
      property: 'pac',
      guestName: form.guestName.trim(),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      monto: form.monto === '' ? null : Number(form.monto),
      notes: form.notes.trim(),
    });
  };

  const isEdit = !!item;

  return (
    <div className="v-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="v-modal" onClick={e => e.stopPropagation()}>
        <div className="v-modal-head">
          <div>
            <div className="v-modal-eyebrow">Airbnb · Calendario</div>
            <div className="v-modal-title">{isEdit ? 'Editar estadía' : 'Registrar estadía'}</div>
          </div>
          <button className="v-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14"/>
            </svg>
          </button>
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Huésped</div>
          <input className={'v-input' + (errors.guestName ? ' v-input-error' : '')}
            placeholder="ej: Benjamín, Hirla…"
            value={form.guestName} onChange={e => set('guestName', e.target.value)} autoFocus />
          {errors.guestName && <div className="v-form-error">{errors.guestName}</div>}
        </div>

        <div className="v-form-row-split">
          <div className="v-form-row">
            <div className="v-form-label">Check-in</div>
            <input className={'v-input' + (errors.checkIn ? ' v-input-error' : '')}
              type="date" value={form.checkIn} onChange={e => set('checkIn', e.target.value)} />
            {errors.checkIn && <div className="v-form-error">{errors.checkIn}</div>}
          </div>
          <div className="v-form-row">
            <div className="v-form-label">Check-out</div>
            <input className={'v-input' + (errors.checkOut ? ' v-input-error' : '')}
              type="date" value={form.checkOut} onChange={e => set('checkOut', e.target.value)} />
            {errors.checkOut && <div className="v-form-error">{errors.checkOut}</div>}
          </div>
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Monto (opcional)</div>
          <input className={'v-input' + (errors.monto ? ' v-input-error' : '')}
            type="number" min="0" placeholder="ej: 120000" value={form.monto}
            onChange={e => set('monto', e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', textAlign: 'right', maxWidth: 200 }} />
          {errors.monto && <div className="v-form-error">{errors.monto}</div>}
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Notas (opcional)</div>
          <input className="v-input" placeholder="ej: llega tarde, pide late checkout…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        {confirmDel ? (
          <div style={{ marginTop: 18, padding: 14, background: 'rgba(212,58,42,0.06)', border: '1px solid var(--signal-neg)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>¿Eliminar esta estadía?</div>
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
              {isEdit ? 'Guardar cambios' : 'Registrar estadía'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
