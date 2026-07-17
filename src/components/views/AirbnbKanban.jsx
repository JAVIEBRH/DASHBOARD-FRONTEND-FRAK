// src/components/views/AirbnbKanban.jsx
import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { KanbanTaskModal } from '../KanbanTaskModal.jsx';
import { LimpiezaModal } from '../LimpiezaModal.jsx';
import { PropertySelector } from './PropertySelector.jsx';
import { AddPropertyModal } from '../AddPropertyModal.jsx';
import { fmtDate } from '../../utils/formatters.js';

const COLUMNS = [
  { status: 'todo',  label: 'Por hacer' },
  { status: 'doing', label: 'En curso' },
  { status: 'done',  label: 'Hecho' },
];

export function AirbnbKanban({
  tasks, limpiezas, stockProperties, addProperty, propertyId, setPropertyId,
  addKanbanTask, editKanbanTask, deleteKanbanTask,
  editLimpieza, deleteLimpieza,
  showToast,
}) {
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [modalTask, setModalTask] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [modalLimpieza, setModalLimpieza] = useState(null);

  const property = stockProperties.find(p => p.id === propertyId) ?? null;
  const propertyTasks = property ? tasks.filter(t => t.property === propertyId) : [];
  const propertyLimpiezas = property ? limpiezas.filter(l => l.property === propertyId) : [];

  const boardItems = [
    ...propertyTasks.map(t => ({ kind: 'task', id: t.id, title: t.title, notes: t.notes, status: t.status, raw: t })),
    ...propertyLimpiezas.map(l => ({
      kind: 'limpieza', id: l.id, title: `Limpieza · ${fmtDate(l.date)}`, notes: l.notes,
      status: l.done ? 'done' : 'todo', raw: l,
    })),
  ];

  const move = (item, dir) => {
    if (item.kind === 'limpieza') {
      editLimpieza(item.id, { done: dir > 0 });
      return;
    }
    const idx = COLUMNS.findIndex(c => c.status === item.status);
    const next = COLUMNS[idx + dir];
    if (next) editKanbanTask(item.id, { status: next.status });
  };

  const openItem = (item) => {
    if (item.kind === 'limpieza') setModalLimpieza(item.raw);
    else setModalTask(item.raw);
  };

  const handleAddProperty = async (data) => {
    const id = await addProperty(data);
    setAddPropertyOpen(false);
    showToast?.('Propiedad creada');
    setPropertyId(id);
  };

  if (!property) {
    return (
      <>
        <PropertySelector
          properties={stockProperties}
          onSelect={setPropertyId}
          onAddProperty={() => setAddPropertyOpen(true)}
          eyebrow="Airbnb"
          title={<>Kanban <em>por propiedad</em>.</>}
          subtitle="Elige una propiedad para ver su tablero de tareas."
        />
        <AddPropertyModal open={addPropertyOpen} onSave={handleAddProperty} onClose={() => setAddPropertyOpen(false)} />
      </>
    );
  }

  return (
    <div>
      <div className="v-section-head">
        <div>
          <div className="v-eyebrow">Airbnb · {property.name}</div>
          <h1 className="v-section-title">Tablero de <em>tareas</em>.</h1>
          <p className="v-section-sub">{propertyTasks.length} tarea{propertyTasks.length === 1 ? '' : 's'} · {propertyLimpiezas.length} limpieza{propertyLimpiezas.length === 1 ? '' : 's'} agendada{propertyLimpiezas.length === 1 ? '' : 's'}.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="v-btn" onClick={() => setPropertyId(null)}>
            <Icon name="chevron_right" size={12} style={{ transform: 'rotate(180deg)' }} /> Otras propiedades
          </button>
          <button className="v-btn primary" onClick={() => setModalTask(null)}>
            <Icon name="plus" size={13} /> Nueva tarea
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {COLUMNS.map((col, colIdx) => {
          const colItems = boardItems.filter(i => i.status === col.status);
          return (
            <div key={col.status} className="v-card" style={{ padding: 14, minHeight: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}>
                  {col.label}
                </div>
                <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{colItems.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colItems.map(item => (
                  <div key={item.kind + item.id} className="v-card" style={{
                    padding: 10, background: 'var(--surface-2)',
                    borderColor: item.kind === 'limpieza' ? 'var(--brass-2)' : undefined,
                  }}>
                    <div onClick={() => openItem(item)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, marginBottom: item.notes ? 4 : 0 }}>
                      {item.kind === 'limpieza' && <Icon name="sparkle" size={12} color="var(--brass-2)" />}
                      {item.title}
                    </div>
                    {item.notes && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 8 }}>{item.notes}</div>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className="v-btn ghost" disabled={colIdx === 0} style={{ padding: '3px 7px', fontSize: 11, opacity: colIdx === 0 ? 0.3 : 1 }}
                        onClick={() => move(item, -1)}>
                        <Icon name="chevron_right" size={11} style={{ transform: 'rotate(180deg)' }} />
                      </button>
                      <button className="v-btn ghost" disabled={colIdx === COLUMNS.length - 1} style={{ padding: '3px 7px', fontSize: 11, opacity: colIdx === COLUMNS.length - 1 ? 0.3 : 1 }}
                        onClick={() => move(item, 1)}>
                        <Icon name="chevron_right" size={11} />
                      </button>
                    </div>
                  </div>
                ))}
                {colItems.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', padding: '12px 0', textAlign: 'center' }}>Sin tareas</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <KanbanTaskModal
        open={modalTask !== undefined}
        item={modalTask ?? null}
        onClose={() => setModalTask(undefined)}
        onSave={(data) => {
          data = { ...data, property: propertyId };
          if (modalTask) {
            editKanbanTask(modalTask.id, data);
            showToast?.('Tarea actualizada');
          } else {
            addKanbanTask(data);
            showToast?.('Tarea creada');
          }
          setModalTask(undefined);
        }}
        onDelete={(id) => { deleteKanbanTask(id); showToast?.('Tarea eliminada', 'deleted'); setModalTask(undefined); }}
      />

      <LimpiezaModal
        open={!!modalLimpieza}
        item={modalLimpieza}
        onClose={() => setModalLimpieza(null)}
        onSave={(data) => {
          editLimpieza(modalLimpieza.id, { ...data, property: propertyId });
          showToast?.('Limpieza actualizada');
          setModalLimpieza(null);
        }}
        onDelete={(id) => { deleteLimpieza(id); showToast?.('Limpieza eliminada', 'deleted'); setModalLimpieza(null); }}
      />
    </div>
  );
}
