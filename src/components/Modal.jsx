// src/components/Modal.jsx
import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon.jsx';

const EMPTY = { concepto: '', amount: '', date: new Date().toISOString().slice(0, 10), category: '', type: 'neg', property: '', bucket: 'expense_op' };

function validate(f) {
  const e = {};
  if (!f.concepto.trim())                       e.concepto = 'El concepto es requerido';
  if (!f.amount)                                e.amount   = 'El monto es requerido';
  else if (isNaN(Number(f.amount)))             e.amount   = 'Ingresa un número válido';
  else if (Number(f.amount) <= 0)               e.amount   = 'El monto debe ser mayor a 0';
  if (!f.date)                                  e.date     = 'La fecha es requerida';
  if (!f.category)                              e.category = 'Elige una categoría';
  return e;
}

export function Modal({ open, tx, categoryMeta, properties, onSave, onDelete, onClose }) {
  const [form, setForm]         = useState(EMPTY);
  const [errors, setErrors]     = useState({});
  const [confirmDel, setConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(tx ? { ...EMPTY, ...tx, amount: String(Math.abs(tx.amount)), type: tx.amount >= 0 ? 'pos' : 'neg' } : EMPTY);
      setErrors({});
      setConfirm(false);
    }
  }, [open, tx]);

  if (!open) return null;

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = () => {
    const e = validate(form);
    if (Object.keys(e).length) { setErrors(e); return; }
    const sign = form.type === 'neg' ? -1 : 1;
    const amount = sign * Math.abs(Number(form.amount));
    const d = new Date(form.date);
    const mon = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'][d.getMonth()];
    const yr  = form.date.slice(2, 4);
    onSave({ ...form, amount, month: `${mon}-${yr}` });
  };

  const cats = Object.entries(categoryMeta ?? {});
  const props = Object.entries(properties ?? {});
  const isEdit = !!tx;

  return (
    <div className="v-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="v-modal" onClick={e => e.stopPropagation()}>
        <div className="v-modal-head">
          <div>
            <div className="v-modal-eyebrow">{isEdit ? 'Editar' : 'Registrar manualmente'}</div>
            <div className="v-modal-title">{isEdit ? 'Editar transacción' : 'Nueva transacción'}</div>
          </div>
          <button className="v-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14"/>
            </svg>
          </button>
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Tipo</div>
          <div className="v-segmented">
            <button className={form.type === 'pos' ? 'active' : ''}
              onClick={() => { set('type', 'pos'); set('bucket', 'income'); }}>
              <Icon name="arrow_up" size={11} /> Ingreso
            </button>
            <button className={form.type === 'neg' && form.bucket !== 'retiro_socio' ? 'active' : ''}
              onClick={() => { set('type', 'neg'); set('bucket', 'expense_op'); }}>
              <Icon name="arrow_down" size={11} /> Gasto operativo
            </button>
            <button className={form.bucket === 'retiro_socio' ? 'active' : ''}
              onClick={() => { set('type', 'neg'); set('bucket', 'retiro_socio'); set('category', 'RETIROS'); }}>
              <Icon name="wallet" size={11} /> Retiro socio
            </button>
          </div>
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Concepto</div>
          <input className={'v-input' + (errors.concepto ? ' v-input-error' : '')}
            placeholder="ej: Alojamientos, Aseo, Comisión banco…"
            value={form.concepto} onChange={e => set('concepto', e.target.value)} autoFocus />
          {errors.concepto && <div className="v-form-error">{errors.concepto}</div>}
        </div>

        <div className="v-form-row-split">
          <div className="v-form-row">
            <div className="v-form-label">Fecha</div>
            <input className={'v-input' + (errors.date ? ' v-input-error' : '')}
              type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            {errors.date && <div className="v-form-error">{errors.date}</div>}
          </div>
          <div className="v-form-row">
            <div className="v-form-label">Monto (CLP)</div>
            <input className={'v-input' + (errors.amount ? ' v-input-error' : '')}
              type="number" placeholder="0" min="0" value={form.amount}
              onChange={e => set('amount', e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }} />
            {errors.amount && <div className="v-form-error">{errors.amount}</div>}
          </div>
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Categoría</div>
          <select className={'v-select' + (errors.category ? ' v-input-error' : '')}
            value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">— elegir categoría —</option>
            {cats.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {errors.category && <div className="v-form-error">{errors.category}</div>}
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Propiedad</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {props.map(([pid, p]) => {
              const sel = form.property === pid;
              return (
                <button key={pid} className="v-btn" onClick={() => set('property', pid)}
                  style={{ padding: '8px 6px', flexDirection: 'column', gap: 4, borderColor: sel ? p.color : 'var(--line)', background: sel ? p.color + '1A' : 'var(--surface)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                  <span style={{ fontSize: 11 }}>{p.name.replace('Casa ', '')}</span>
                </button>
              );
            })}
          </div>
        </div>

        {confirmDel ? (
          <div style={{ marginTop: 18, padding: 14, background: 'rgba(212,58,42,0.06)', border: '1px solid var(--signal-neg)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>¿Eliminar esta transacción?</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', marginBottom: 12 }}>Esta acción no se puede deshacer.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="v-btn ghost" onClick={() => setConfirm(false)}>Cancelar</button>
              <button className="v-btn" style={{ background: 'var(--signal-neg)', color: '#fff', borderColor: 'var(--signal-neg)' }}
                onClick={() => onDelete(tx.id)}>
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
              {isEdit ? 'Guardar cambios' : 'Crear transacción'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
