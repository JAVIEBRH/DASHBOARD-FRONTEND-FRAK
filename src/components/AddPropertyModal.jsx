// src/components/AddPropertyModal.jsx
import { useState } from 'react';
import { Icon } from './ui/Icon.jsx';

const newZone = () => ({ key: Math.random().toString(36).slice(2), value: '' });

export function AddPropertyModal({ open, onSave, onClose }) {
  const [name, setName]     = useState('');
  const [zones, setZones]   = useState(() => [newZone(), newZone()]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const setZoneValue = (key, value) => setZones(zs => zs.map(z => z.key === key ? { ...z, value } : z));
  const addZoneRow = () => setZones(zs => [...zs, newZone()]);
  const removeZoneRow = (key) => setZones(zs => zs.filter(z => z.key !== key));

  const reset = () => { setName(''); setZones([newZone(), newZone()]); setErrors({}); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    const e = {};
    if (!name.trim()) e.name = 'El nombre es requerido';
    const zoneNames = zones.map(z => z.value.trim()).filter(Boolean);
    if (zoneNames.length === 0) e.zones = 'Agrega al menos una zona';
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    try {
      await onSave({ name: name.trim(), zones: zoneNames });
      reset();
    } catch {
      setErrors({ name: 'No se pudo crear la propiedad. ¿Ya existe una con ese nombre?' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="v-modal-backdrop" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="v-modal" onClick={e => e.stopPropagation()}>
        <div className="v-modal-head">
          <div>
            <div className="v-modal-eyebrow">Nueva propiedad</div>
            <div className="v-modal-title">Agregar propiedad</div>
          </div>
          <button className="v-modal-close" onClick={handleClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14"/>
            </svg>
          </button>
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Nombre de la propiedad</div>
          <input className={'v-input' + (errors.name ? ' v-input-error' : '')}
            placeholder="ej: Casa Coyhaique"
            value={name} onChange={e => setName(e.target.value)} autoFocus />
          {errors.name && <div className="v-form-error">{errors.name}</div>}
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Zonas de la propiedad</div>
          {zones.map(z => (
            <div key={z.key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input className="v-input" placeholder="ej: Living, Cocina, Dormitorio…"
                value={z.value} onChange={e => setZoneValue(z.key, e.target.value)} />
              {zones.length > 1 && (
                <button className="v-btn ghost" style={{ padding: '8px 10px' }} onClick={() => removeZoneRow(z.key)}>
                  <Icon name="trash" size={13} />
                </button>
              )}
            </div>
          ))}
          {errors.zones && <div className="v-form-error">{errors.zones}</div>}
          <button className="v-btn ghost" style={{ marginTop: 2 }} onClick={addZoneRow}>
            <Icon name="plus" size={12} /> Agregar zona
          </button>
        </div>

        <div className="v-modal-foot">
          <button className="v-btn" onClick={handleClose}>Cancelar</button>
          <button className="v-btn primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creando…' : 'Crear propiedad'}
          </button>
        </div>
      </div>
    </div>
  );
}
