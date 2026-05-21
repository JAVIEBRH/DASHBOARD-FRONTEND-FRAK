// src/App.jsx
import { useState } from 'react';
import { useTransactions } from './hooks/useTransactions.js';
import { useFilter } from './hooks/useFilter.js';
import { useToast } from './hooks/useToast.js';
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
};

export default function App() {
  const [view, setView] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);

  const { data, loading, error, addTransaction, editTransaction, deleteTransaction } = useTransactions();
  const { year, setYear, period, setPeriod, filteredTx, monthsOrder } = useFilter(
    data?.transactions, data?.monthsOrder2025, data?.monthsOrder2026
  );
  const { toasts, showToast } = useToast();

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

  return (
    <div className="vault-app">
      <Sidebar view={view} setView={setView} year={year} />
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
