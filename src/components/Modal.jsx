// src/components/Modal.jsx
import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon.jsx';

const EMPTY = { concepto: '', amount: '', date: '', category: '', type: 'neg', property: '', notes: '' };

function validate(f) {
  const e = {};
  if (!f.concepto.trim()) e.concepto = 'Campo requerido';
  if (!f.amount) e.amount = 'Campo requerido';
  else if (isNaN(Number(f.amount))) e.amount = 'Debe ser un número';
  else if (Number(f.amount) <= 0) e.amount = 'Debe ser mayor a 0';
  if (!f.date) e.date = 'Campo requerido';
  if (!f.category) e.category = 'Campo requerido';
  return e;
}

export function Modal({ open, tx, categoryMeta, properties, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(tx ? { ...EMPTY, ...tx, amount: String(Math.abs(tx.amount)) } : EMPTY);
      setErrors({});
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
    onSave({ ...form, amount: sign * Math.abs(Number(form.amount)) });
  };

  const cats = Object.entries(categoryMeta ?? {});
  const props = Object.entries(properties ?? {});

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal__header">
          <h2>{tx ? 'Editar movimiento' : 'Nuevo movimiento'}</h2>
          <button className="btn btn--ghost btn--icon" onClick={onClose}><Icon name="plus" size={16} style={{ transform: 'rotate(45deg)' }} /></button>
        </div>
        <div className="modal__body">
          <Field label="Concepto" error={errors.concepto}>
            <input className={errors.concepto ? 'input input--error' : 'input'} value={form.concepto} onChange={e => set('concepto', e.target.value)} />
          </Field>
          <div className="modal__row">
            <Field label="Tipo" error={null}>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="neg">Costo</option>
                <option value="pos">Ingreso</option>
              </select>
            </Field>
            <Field label="Monto ($)" error={errors.amount}>
              <input className={errors.amount ? 'input input--error' : 'input'} type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} />
            </Field>
          </div>
          <div className="modal__row">
            <Field label="Fecha" error={errors.date}>
              <input className={errors.date ? 'input input--error' : 'input'} type="date" value={form.date} onChange={e => set('date', e.target.value)} />
            </Field>
            <Field label="Categoría" error={errors.category}>
              <select className={errors.category ? 'input input--error' : 'input'} value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">— elegir —</option>
                {cats.map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Propiedad" error={null}>
            <select className="input" value={form.property} onChange={e => set('property', e.target.value)}>
              <option value="">— ninguna —</option>
              {props.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
            </select>
          </Field>
          <Field label="Notas" error={null}>
            <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
          </Field>
        </div>
        <div className="modal__footer">
          {tx && <button className="btn btn--danger" onClick={() => onDelete(tx.id)}>Eliminar</button>}
          <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn--primary" onClick={handleSubmit}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      {children}
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
