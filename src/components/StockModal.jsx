// src/components/StockModal.jsx
import { useState, useEffect } from 'react';
import { Icon } from './ui/Icon.jsx';
import { zoneLabel } from '../utils/stock.js';

const EMPTY = { category: '', name: '', qty: '', unit: '', umbral: '1', umbralPct: '', enUso: [] };

// Los productos se alertan de una de dos formas, nunca ambas a la vez:
// por cantidad de unidades cerradas en bodega (bolsas, esponjas, papel...)
// o por el % que le queda al único envase abierto en uso (cloro, detergente...).
function validate(f, isStockZone, alertMode) {
  const e = {};
  if (!f.name.trim())     e.name = 'El nombre es requerido';
  if (!f.category.trim()) e.category = 'La categoría es requerida';
  if (f.qty === '')                                    e.qty = 'La cantidad es requerida';
  else if (isNaN(Number(f.qty)) || Number(f.qty) < 0)  e.qty = 'Ingresa un número válido';
  if (isStockZone) {
    if (alertMode === 'unit') {
      if (f.umbral === '')                                     e.umbral = 'El umbral es requerido';
      else if (isNaN(Number(f.umbral)) || Number(f.umbral) < 0) e.umbral = 'Ingresa un número válido';
    } else {
      if (f.umbralPct === '')                                                                    e.umbralPct = 'El umbral es requerido';
      else if (isNaN(Number(f.umbralPct)) || Number(f.umbralPct) < 0 || Number(f.umbralPct) > 100) e.umbralPct = 'Ingresa un valor entre 0 y 100';
      f.enUso.forEach((pct, i) => {
        if (pct === '' || isNaN(Number(pct)) || Number(pct) < 0 || Number(pct) > 100)
          e[`enUso-${i}`] = 'Ingresa un valor entre 0 y 100';
      });
    }
  }
  return e;
}

export function StockModal({ open, item, isStockZone, zone, zones, onSave, onDelete, onClose }) {
  const [form, setForm]          = useState(EMPTY);
  const [alertMode, setAlertMode] = useState('unit');
  const [errors, setErrors]      = useState({});
  const [confirmDel, setConfirm] = useState(false);

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          category: item.category,
          name: item.name,
          qty: String(isStockZone ? item.qtyBodega : item.qty),
          unit: item.unit ?? '',
          umbral: String(item.umbralUnidades),
          umbralPct: item.umbralPctEnUso != null ? String(item.umbralPctEnUso) : '',
          enUso: (item.enUso ?? []).map(u => String(u.pct)),
        });
        setAlertMode(item.umbralPctEnUso != null ? 'pct' : 'unit');
      } else {
        setForm(EMPTY);
        setAlertMode('unit');
      }
      setErrors({});
      setConfirm(false);
    }
  }, [open, item, isStockZone]);

  if (!open) return null;

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = () => {
    const e = validate(form, isStockZone, alertMode);
    if (Object.keys(e).length) { setErrors(e); return; }
    const base = {
      category: form.category.trim(),
      name: form.name.trim(),
    };
    const payload = isStockZone
      ? {
          ...base, unit: form.unit.trim(), qtyBodega: Number(form.qty),
          umbralUnidades: alertMode === 'unit' ? Number(form.umbral) : 0,
          umbralPctEnUso: alertMode === 'pct' ? Number(form.umbralPct) : null,
          enUso: alertMode === 'pct' ? form.enUso.map(pct => ({ pct: Number(pct) })) : (item?.enUso ?? []),
        }
      : { ...base, qty: Number(form.qty) };
    onSave(payload);
  };

  const isEdit = !!item;

  return (
    <div className="v-modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="v-modal" onClick={e => e.stopPropagation()}>
        <div className="v-modal-head">
          <div>
            <div className="v-modal-eyebrow">{isEdit ? 'Editar' : 'Nuevo producto'}{zone ? ` · ${zoneLabel(zones, zone)}` : ''}</div>
            <div className="v-modal-title">{isEdit ? 'Editar producto' : 'Nuevo producto'}</div>
          </div>
          <button className="v-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14"/>
            </svg>
          </button>
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Nombre</div>
          <input className={'v-input' + (errors.name ? ' v-input-error' : '')}
            placeholder="ej: jabón 750ml, Sofá 3 Cuerpos…"
            value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          {errors.name && <div className="v-form-error">{errors.name}</div>}
        </div>

        <div className="v-form-row">
          <div className="v-form-label">Categoría</div>
          <input className={'v-input' + (errors.category ? ' v-input-error' : '')}
            placeholder="ej: ASEO, Muebles, Vajilla…"
            value={form.category} onChange={e => set('category', e.target.value)} />
          {errors.category && <div className="v-form-error">{errors.category}</div>}
        </div>

        {isStockZone ? (
          <div className="v-form-row">
            <div className="v-form-label">Cantidad en bodega</div>
            <input className={'v-input' + (errors.qty ? ' v-input-error' : '')}
              type="number" min="0" value={form.qty} onChange={e => set('qty', e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', textAlign: 'right', maxWidth: 160 }} />
            {errors.qty && <div className="v-form-error">{errors.qty}</div>}
          </div>
        ) : (
          <div className="v-form-row">
            <div className="v-form-label">Cantidad</div>
            <input className={'v-input' + (errors.qty ? ' v-input-error' : '')}
              type="number" min="0" value={form.qty} onChange={e => set('qty', e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', textAlign: 'right', maxWidth: 160 }} />
            {errors.qty && <div className="v-form-error">{errors.qty}</div>}
          </div>
        )}

        {isStockZone && (
          <div className="v-form-row">
            <div className="v-form-label">Unidad</div>
            <input className="v-input" placeholder="ej: 750ml, rollo, litro…"
              value={form.unit} onChange={e => set('unit', e.target.value)} />
          </div>
        )}

        {isStockZone && (
          <>
            <div className="v-form-divider" />
            <div className="v-form-section-label">Disparador de alerta</div>
            <div className="v-segmented" style={{ marginBottom: 16 }}>
              <button type="button" className={alertMode === 'unit' ? 'active' : ''} onClick={() => setAlertMode('unit')}>
                Por unidades<br />en bodega
              </button>
              <button type="button" className={alertMode === 'pct' ? 'active' : ''} onClick={() => setAlertMode('pct')}>
                Por % del envase<br />en uso
              </button>
            </div>

            {alertMode === 'unit' ? (
              <div className="v-form-row">
                <div className="v-form-label">Umbral de alerta</div>
                <input className={'v-input' + (errors.umbral ? ' v-input-error' : '')}
                  type="number" min="0" value={form.umbral} onChange={e => set('umbral', e.target.value)}
                  style={{ fontFamily: 'var(--font-mono)', textAlign: 'right', maxWidth: 160 }} />
                {errors.umbral && <div className="v-form-error">{errors.umbral}</div>}
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 4 }}>
                  Avisa cuando queden esta cantidad o menos en bodega.
                </div>
              </div>
            ) : (
              <>
                <div className="v-rule-row">
                  <div className="v-rule-icon">
                    <Icon name="settings" size={13} />
                  </div>
                  <div className="v-rule-text">
                    Regla: avisar cuando quede
                    <input className={'v-rule-input' + (errors.umbralPct ? ' v-input-error' : '')}
                      type="number" min="0" max="100" value={form.umbralPct}
                      onChange={e => set('umbralPct', e.target.value)} />
                    % o menos.
                  </div>
                </div>
                {errors.umbralPct && <div className="v-form-error" style={{ marginTop: -10, marginBottom: 12 }}>{errors.umbralPct}</div>}

                <div className="v-form-label" style={{ marginBottom: 8 }}>Envase actualmente en uso</div>
                {form.enUso.map((pct, i) => {
                  const numPct = Number(pct);
                  const threshold = Number(form.umbralPct) || 0;
                  const valid = pct !== '' && !isNaN(numPct);
                  const ok = valid && numPct > threshold;
                  const gaugeColor = !valid ? 'var(--ink-3)' : ok ? 'var(--signal-pos)' : 'var(--signal-neg)';
                  const gaugeGlow = !valid ? 'var(--surface-2)' : ok ? 'var(--signal-pos-soft)' : 'var(--signal-neg-soft)';
                  const diff = valid ? Math.abs(numPct - threshold) : 0;
                  return (
                    <div key={i} className="v-gauge-card">
                      <div className="v-gauge-head">
                        <div className="v-gauge-label">
                          <i className="v-live-dot" style={{ background: gaugeColor, boxShadow: `0 0 0 3px ${gaugeGlow}` }} />
                          Envase{form.enUso.length > 1 ? ` #${i + 1}` : ''}
                        </div>
                        <div className="v-gauge-value" style={{ color: gaugeColor }}>{valid ? `${numPct}%` : '—'}</div>
                      </div>
                      <div className="v-gauge-bar-track">
                        <div className="v-gauge-bar-fill" style={{ width: `${Math.max(0, Math.min(100, numPct || 0))}%`, background: gaugeColor }} />
                      </div>
                      {valid && (
                        <div className="v-gauge-status" style={{ color: gaugeColor }}>
                          {ok
                            ? `${diff} puntos por encima del umbral — todo bien.`
                            : `${diff} puntos por debajo del umbral — esto ya debería estar en la lista de compras.`}
                        </div>
                      )}
                      <div className="v-gauge-edit">
                        <input className={'v-input' + (errors[`enUso-${i}`] ? ' v-input-error' : '')}
                          type="number" min="0" max="100" placeholder="ej: 40" value={pct}
                          onChange={e => {
                            const next = [...form.enUso]; next[i] = e.target.value;
                            set('enUso', next);
                          }}
                          style={{ fontFamily: 'var(--font-mono)', textAlign: 'right', maxWidth: 80 }} />
                        <span>actualizar % restante</span>
                        <button className="v-btn ghost" style={{ padding: '4px 8px', marginLeft: 'auto' }}
                          onClick={() => set('enUso', form.enUso.filter((_, j) => j !== i))}>
                          <Icon name="trash" size={12} />
                        </button>
                      </div>
                      {errors[`enUso-${i}`] && <div className="v-form-error" style={{ marginTop: 6 }}>{errors[`enUso-${i}`]}</div>}
                    </div>
                  );
                })}
                <button className="v-btn ghost" style={{ marginTop: form.enUso.length ? 4 : 0 }}
                  onClick={() => set('enUso', [...form.enUso, ''])}>
                  <Icon name="plus" size={12} /> Agregar envase en uso
                </button>
              </>
            )}
          </>
        )}

        {confirmDel ? (
          <div style={{ marginTop: 18, padding: 14, background: 'rgba(212,58,42,0.06)', border: '1px solid var(--signal-neg)', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>¿Eliminar este producto?</div>
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
              {isEdit ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
