// src/components/views/Stock.jsx
import { useState } from 'react';
import { StockOverview } from './StockOverview.jsx';
import { ZoneDetail } from './ZoneDetail.jsx';
import { StockModal } from '../StockModal.jsx';

export function Stock({
  stock, furniture,
  addStockItem, editStockItem, deleteStockItem,
  addFurnitureItem, editFurnitureItem, deleteFurnitureItem,
  showToast,
}) {
  const [zone, setZone]         = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem]   = useState(null);

  const isStockZone = zone === 'stock';
  const items = zone === null ? [] : isStockZone ? stock : furniture.filter(f => f.zone === zone);

  const handleAdd  = () => { setEditItem(null); setModalOpen(true); };
  const handleEdit = (item) => { setEditItem(item); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = async (itemData) => {
    if (isStockZone) {
      if (editItem) { await editStockItem(editItem.id, itemData); showToast('Producto actualizado'); }
      else          { await addStockItem(itemData);              showToast('Producto creado'); }
    } else {
      const payload = { ...itemData, zone };
      if (editItem) { await editFurnitureItem(editItem.id, payload); showToast('Producto actualizado'); }
      else           { await addFurnitureItem(payload);               showToast('Producto creado'); }
    }
    handleClose();
  };

  const handleDelete = async (id) => {
    if (isStockZone) await deleteStockItem(id);
    else              await deleteFurnitureItem(id);
    showToast('Producto eliminado', 'error');
    handleClose();
  };

  return (
    <div>
      {zone === null ? (
        <StockOverview stock={stock} furniture={furniture} onSelectZone={setZone} />
      ) : (
        <ZoneDetail
          zone={zone}
          isStockZone={isStockZone}
          items={items}
          onBack={() => setZone(null)}
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      )}
      <StockModal
        open={modalOpen}
        item={editItem}
        isStockZone={isStockZone}
        zone={zone}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    </div>
  );
}
