// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { useTransactions } from './hooks/useTransactions.js';
import { useFilter } from './hooks/useFilter.js';
import { useToast } from './hooks/useToast.js';
import { useStock } from './hooks/useStock.js';
import { useFurniture } from './hooks/useFurniture.js';
import { useEstadias } from './hooks/useEstadias.js';
import { useLimpiezas } from './hooks/useLimpiezas.js';
import { useKanbanTasks } from './hooks/useKanbanTasks.js';
import { useProperties } from './hooks/useProperties.js';
import { Sidebar } from './components/layout/Sidebar.jsx';
import { Topbar } from './components/layout/Topbar.jsx';
import { ToastContainer } from './components/ui/Toast.jsx';
import { Modal } from './components/Modal.jsx';
import { Overview } from './components/views/Overview.jsx';
import { Ingresos } from './components/views/Ingresos.jsx';
import { Costos } from './components/views/Costos.jsx';
import { Transactions } from './components/views/Transactions.jsx';
import { Calendar } from './components/views/Calendar.jsx';
import { Gastos } from './components/views/Gastos.jsx';
import { Socio } from './components/views/Socio.jsx';
import { Budget } from './components/views/Budget.jsx';
import { Stock } from './components/views/Stock.jsx';
import { AirbnbResumen } from './components/views/AirbnbResumen.jsx';
import { AirbnbCalendar } from './components/views/AirbnbCalendar.jsx';
import { AirbnbKanban } from './components/views/AirbnbKanban.jsx';
import { stockStatus } from './utils/stock.js';

const VIEW_TITLE = {
  overview: 'Resumen',
  ingresos: 'Ingresos',
  costos: 'Costos',
  transactions: 'Movimientos',
  calendar: 'Vista mensual',
  gastos: 'Costos',
  socio: 'Mov. de socio',
  budget: 'Presupuesto 2026',
  stock: 'Stock',
  airbnb_resumen: 'Airbnb · Resumen',
  airbnb_calendario: 'Airbnb · Calendario',
  airbnb_kanban: 'Airbnb · Kanban',
};

export default function App() {
  const [view, setView] = useState('overview');
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [activePropertyId, setActivePropertyId] = useState(null);
  const [pendingStockEditId, setPendingStockEditId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);

  const { data, setData, loading, error, addTransaction, editTransaction, deleteTransaction } = useTransactions();
  const { year, setYear, period, setPeriod, filteredTx, monthsOrder } = useFilter(
    data?.transactions, data?.monthsOrder2025, data?.monthsOrder2026
  );
  const { toasts, showToast } = useToast();
  const { addStockItem, editStockItem, deleteStockItem } = useStock(data, setData);
  const { addFurnitureItem, editFurnitureItem, deleteFurnitureItem } = useFurniture(data, setData);
  const { addEstadia, editEstadia, deleteEstadia } = useEstadias(data, setData);
  const { addLimpieza, editLimpieza, deleteLimpieza } = useLimpiezas(data, setData);
  const { addKanbanTask, editKanbanTask, deleteKanbanTask } = useKanbanTasks(data, setData);
  const { addProperty } = useProperties(setData);

  const toastedLowStockRef = useRef(false);
  useEffect(() => {
    if (!loading && data && !toastedLowStockRef.current) {
      toastedLowStockRef.current = true;
      const agotados = data.stock.filter(s => stockStatus(s, true) === 'agotado').length;
      const bajos = data.stock.filter(s => stockStatus(s, true) === 'bajo').length;
      if (agotados > 0 || bajos > 0) {
        const parts = [];
        if (agotados > 0) parts.push(`${agotados} agotado${agotados === 1 ? '' : 's'}`);
        if (bajos > 0) parts.push(`${bajos} por agotar`);
        showToast(`Stock: ${parts.join(' · ')} — click para ver`, 'error', {
          duration: 8000,
          onClick: () => setView('stock'),
        });
      }
    }
  }, [loading, data]);

  useEffect(() => {
    if (view === 'stock' || view.startsWith('airbnb_')) setExpandedGroup('airbnb');
  }, [view]);

  const handleToggleGroup = (groupId) => {
    const isExpanded = expandedGroup === groupId;
    if (isExpanded) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(groupId);
      if (groupId === 'airbnb') setView('airbnb_resumen');
    }
  };

  const handleAdd = () => { setEditTx(null); setModalOpen(true); };
  const handleEdit = (tx) => { setEditTx(tx); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditTx(null); };

  const handleSave = async (txData) => {
    if (editTx) {
      await editTransaction(editTx.id, txData);
      showToast('Movimiento actualizado');
    } else {
      await addTransaction(txData);
      showToast('Movimiento creado');
    }
    handleClose();
  };

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    showToast('Movimiento eliminado', 'error');
    handleClose();
  };

  const viewProps = { filteredTx, categoryMeta: data?.categoryMeta, onEdit: handleEdit };
  const agotadosCount = data ? data.stock.filter(s => stockStatus(s, true) === 'agotado').length : 0;
  const bajosCount = data ? data.stock.filter(s => stockStatus(s, true) === 'bajo').length : 0;
  const stockAlertCount = agotadosCount + bajosCount;
  const stockBadgeColor = agotadosCount > 0 ? 'var(--signal-neg)' : 'var(--jat)';

  // Tints the content area with each property's own color once you're
  // "inside" it (Stock/Calendario/Kanban) — the property-picker cards use
  // that same color, so this reads as "you're now in that property's space"
  // instead of the background staying identical everywhere in the app.
  const PROPERTY_SCOPED_VIEWS = ['stock', 'airbnb_calendario', 'airbnb_kanban'];
  const activeProperty = data?.stockProperties?.find(p => p.id === activePropertyId);
  const contentTint = PROPERTY_SCOPED_VIEWS.includes(view) && activeProperty?.color
    ? activeProperty.color + '14'
    : undefined;

  return (
    <div className="vault-app">
      <Sidebar
        view={view} setView={setView} year={year}
        badgeCounts={{ stock: stockAlertCount }}
        badgeColors={{ stock: stockBadgeColor }}
        expandedGroup={expandedGroup} onToggleGroup={handleToggleGroup}
      />
      <main className="v-main">
        <Topbar
          title={VIEW_TITLE[view] ?? view}
          year={year} setYear={setYear}
          period={period} setPeriod={setPeriod}
          monthsOrder={monthsOrder}
          monthLabels={data?.monthLabels}
          onAdd={handleAdd}
        />
        <div className="v-content" key={view} style={{ background: contentTint ?? 'var(--bg)', transition: 'background 0.25s ease' }}>
          {loading && <div className="v-empty" style={{ padding: '80px 0', textAlign: 'center' }}>Cargando datos…</div>}
          {error && <div className="v-empty" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--signal-neg)' }}>Error al cargar datos. Intenta recargar la página.</div>}
          {data && !loading && (
            <>
              {view === 'overview'     && <Overview {...viewProps} transactions={data.transactions} monthsOrder={monthsOrder} monthLabels={data.monthLabels} period={period} setPeriod={setPeriod} />}
              {view === 'ingresos'     && <Ingresos {...viewProps} />}
              {view === 'costos'       && <Costos {...viewProps} />}
              {view === 'transactions' && <Transactions {...viewProps} monthsOrder={monthsOrder} monthLabels={data.monthLabels} />}
              {view === 'calendar'     && <Calendar {...viewProps} monthsOrder={monthsOrder} monthLabels={data.monthLabels} />}
              {view === 'gastos'       && <Gastos {...viewProps} />}
              {view === 'socio'        && <Socio {...viewProps} properties={data.properties} />}
              {view === 'budget'       && <Budget transactions={data.transactions} categoryMeta={data.categoryMeta} />}
              {view === 'stock'        && (
                <Stock
                  stock={data.stock} furniture={data.furniture} stockProperties={data.stockProperties} setData={setData}
                  propertyId={activePropertyId} setPropertyId={setActivePropertyId}
                  addStockItem={addStockItem} editStockItem={editStockItem} deleteStockItem={deleteStockItem}
                  addFurnitureItem={addFurnitureItem} editFurnitureItem={editFurnitureItem} deleteFurnitureItem={deleteFurnitureItem}
                  showToast={showToast}
                  initialEditItemId={pendingStockEditId}
                  onConsumeInitialEdit={() => setPendingStockEditId(null)}
                />
              )}
              {view === 'airbnb_resumen' && (
                <AirbnbResumen
                  estadias={data.estadias} limpiezas={data.limpiezas} stock={data.stock} kanbanTasks={data.kanbanTasks} stockProperties={data.stockProperties} setView={setView}
                  onOpenStockItem={(item) => { setActivePropertyId(item.property); setPendingStockEditId(item.id); setView('stock'); }}
                />
              )}
              {view === 'airbnb_calendario' && (
                <AirbnbCalendar
                  estadias={data.estadias} limpiezas={data.limpiezas}
                  stockProperties={data.stockProperties} addProperty={addProperty}
                  propertyId={activePropertyId} setPropertyId={setActivePropertyId}
                  year={year} period={period} monthsOrder={monthsOrder} monthLabels={data.monthLabels}
                  addEstadia={addEstadia} editEstadia={editEstadia} deleteEstadia={deleteEstadia}
                  addLimpieza={addLimpieza} editLimpieza={editLimpieza} deleteLimpieza={deleteLimpieza}
                  showToast={showToast}
                />
              )}
              {view === 'airbnb_kanban' && (
                <AirbnbKanban
                  tasks={data.kanbanTasks} limpiezas={data.limpiezas}
                  stockProperties={data.stockProperties} addProperty={addProperty}
                  propertyId={activePropertyId} setPropertyId={setActivePropertyId}
                  addKanbanTask={addKanbanTask} editKanbanTask={editKanbanTask} deleteKanbanTask={deleteKanbanTask}
                  editLimpieza={editLimpieza} deleteLimpieza={deleteLimpieza}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </div>
      </main>
      <Modal
        open={modalOpen}
        tx={editTx}
        categoryMeta={data?.categoryMeta}
        properties={data?.properties}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={handleClose}
      />
      <ToastContainer toasts={toasts} />
    </div>
  );
}
