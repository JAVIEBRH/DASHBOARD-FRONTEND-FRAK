// src/components/views/AirbnbKanban.jsx
import { useState } from 'react';
import { Icon } from '../ui/Icon.jsx';
import { KanbanTaskModal } from '../KanbanTaskModal.jsx';
import { PropertySelector } from './PropertySelector.jsx';
import { AddPropertyModal } from '../AddPropertyModal.jsx';

const COLUMNS = [
  { status: 'todo',  label: 'Por hacer' },
  { status: 'doing', label: 'En curso' },
  { status: 'done',  label: 'Hecho' },
];

export function AirbnbKanban({ tasks, stockProperties, addProperty, addKanbanTask, editKanbanTask, deleteKanbanTask, showToast }) {
  const [propertyId, setPropertyId] = useState(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);
  const [modalTask, setModalTask] = useState(undefined); // undefined = closed, null = new, obj = edit

  const property = stockProperties.find(p => p.id === propertyId) ?? null;
  const propertyTasks = property ? tasks.filter(t => t.property === propertyId) : [];

  const move = (task, dir) => {
    const idx = COLUMNS.findIndex(c => c.status === task.status);
    const next = COLUMNS[idx + dir];
    if (next) editKanbanTask(task.id, { status: next.status });
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
          <p className="v-section-sub">{propertyTasks.length} tareas registradas.</p>
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
          const colTasks = propertyTasks.filter(t => t.status === col.status);
          return (
            <div key={col.status} className="v-card" style={{ padding: 14, minHeight: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-3)' }}>
                  {col.label}
                </div>
                <span style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>{colTasks.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {colTasks.map(task => (
                  <div key={task.id} className="v-card" style={{ padding: 10, background: 'var(--surface-2)' }}>
                    <div onClick={() => setModalTask(task)} style={{ cursor: 'pointer', fontSize: 13, fontWeight: 500, marginBottom: task.notes ? 4 : 0 }}>
                      {task.title}
                    </div>
                    {task.notes && <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginBottom: 8 }}>{task.notes}</div>}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button className="v-btn ghost" disabled={colIdx === 0} style={{ padding: '3px 7px', fontSize: 11, opacity: colIdx === 0 ? 0.3 : 1 }}
                        onClick={() => move(task, -1)}>
                        <Icon name="chevron_right" size={11} style={{ transform: 'rotate(180deg)' }} />
                      </button>
                      <button className="v-btn ghost" disabled={colIdx === COLUMNS.length - 1} style={{ padding: '3px 7px', fontSize: 11, opacity: colIdx === COLUMNS.length - 1 ? 0.3 : 1 }}
                        onClick={() => move(task, 1)}>
                        <Icon name="chevron_right" size={11} />
                      </button>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
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
    </div>
  );
}
