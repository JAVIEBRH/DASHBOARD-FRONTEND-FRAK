// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { useTransactions } from './hooks/useTransactions.js';
import { useFilter } from './hooks/useFilter.js';
import { useToast } from './hooks/useToast.js';
import { useStock } from './hooks/useStock.js';
import { useFurniture } from './hooks/useFurniture.js';
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
import { AveAustral } from './components/views/AveAustral.jsx';
import { Budget } from './components/views/Budget.jsx';
import { Stock } from './components/views/Stock.jsx';
import { isLowStockConsumible } from './utils/stock.js';

const VIEW_TITLE = {
  overview: 'Resumen',
  ingresos: 'Ingresos',
  costos: 'Costos',
  transactions: 'Movimientos',
  calendar: 'Vista mensual',
  gastos: 'Costos',
  socio: 'Mov. de socio',
  ave_austral: 'Ave Austral',
  budget: 'Presupuesto 2026',
  stock: 'Stock',
};

export default function App() {
  const [view, setView] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);

  const { data, setData, loading, error, addTransaction, editTransaction, deleteTransaction } = useTransactions();
  const { year, setYear, period, setPeriod, filteredTx, monthsOrder } = useFilter(
    data?.transactions, data?.monthsOrder2025, data?.monthsOrder2026
  );
  const { toasts, showToast } = useToast();
  const { addStockItem, editStockItem, deleteStockItem } = useStock(data, setData);
  const { addFurnitureItem, editFurnitureItem, deleteFurnitureItem } = useFurniture(data, setData);

  const toastedLowStockRef = useRef(false);
  useEffect(() => {
    if (!loading && data && !toastedLowStockRef.current) {
      toastedLowStockRef.current = true;
      const n = data.stock.filter(isLowStockConsumible).length;
      if (n > 0) showToast(`Tienes ${n} producto${n === 1 ? '' : 's'} con stock bajo`, 'error');
    }
  }, [loading, data]);

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
  const stockAlertCount = data ? data.stock.filter(isLowStockConsumible).length : 0;

  return (
    <div className="vault-app">
      <Sidebar view={view} setView={setView} year={year} badgeCounts={{ stock: stockAlertCount }} />
      <main className="v-main">
        <Topbar
          title={VIEW_TITLE[view] ?? view}
          year={year} setYear={setYear}
          period={period} setPeriod={setPeriod}
          monthsOrder={monthsOrder}
          monthLabels={data?.monthLabels}
          onAdd={handleAdd}
        />
        <div className="v-content" key={view}>
          {loading && <div className="v-empty" style={{ padding: '80px 0', textAlign: 'center' }}>Cargando datos…</div>}
          {error && <div className="v-empty" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--signal-neg)' }}>Error al cargar datos. Intenta recargar la página.</div>}
          {data && !loading && (
            <>
              {view === 'overview'     && <Overview {...viewProps} transactions={data.transactions} monthsOrder={monthsOrder} monthLabels={data.monthLabels} period={period} setPeriod={setPeriod} />}
              {view === 'ingresos'     && <Ingresos {...viewProps} />}
              {view === 'costos'       && <Costos {...viewProps} />}
              {view === 'transactions' && <Transactions {...viewProps} />}
              {view === 'calendar'     && <Calendar {...viewProps} monthsOrder={monthsOrder} monthLabels={data.monthLabels} />}
              {view === 'gastos'       && <Gastos {...viewProps} />}
              {view === 'socio'        && <Socio {...viewProps} properties={data.properties} />}
              {view === 'ave_austral'  && <AveAustral {...viewProps} />}
              {view === 'budget'       && <Budget transactions={data.transactions} categoryMeta={data.categoryMeta} />}
              {view === 'stock'        && (
                <Stock
                  stock={data.stock} furniture={data.furniture} stockProperties={data.stockProperties} setData={setData}
                  addStockItem={addStockItem} editStockItem={editStockItem} deleteStockItem={deleteStockItem}
                  addFurnitureItem={addFurnitureItem} editFurnitureItem={editFurnitureItem} deleteFurnitureItem={deleteFurnitureItem}
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
