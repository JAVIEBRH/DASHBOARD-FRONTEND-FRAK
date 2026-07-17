// src/components/views/Stock.jsx
import { useState } from 'react';
import { PropertySelector } from './PropertySelector.jsx';
import { StockOverview } from './StockOverview.jsx';
import { ZoneDetail } from './ZoneDetail.jsx';
import { StockModal } from '../StockModal.jsx';
import { AddPropertyModal } from '../AddPropertyModal.jsx';
import { useProperties } from '../../hooks/useProperties.js';

export function Stock({
  stock, furniture, stockProperties, setData,
  propertyId, setPropertyId,
  addStockItem, editStockItem, deleteStockItem,
  addFurnitureItem, editFurnitureItem, deleteFurnitureItem,
  showToast,
}) {
  const [zone, setZone]             = useState(null);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [addPropertyOpen, setAddPropertyOpen] = useState(false);

  const { addProperty } = useProperties(setData);

  const property = stockProperties.find(p => p.id === propertyId) ?? null;
  const zones = property ? [{ id: 'stock', label: 'Stock' }, ...property.zones] : [];

  const propertyStock     = property ? stock.filter(s => s.property === propertyId) : [];
  const propertyFurniture = property ? furniture.filter(f => f.property === propertyId) : [];

  const isStockZone = zone === 'stock';
  const items = zone === null ? [] : isStockZone ? propertyStock : propertyFurniture.filter(f => f.zone === zone);

  const handleSelectProperty = (id) => { setPropertyId(id); setZone(null); };
  const handleBackToProperties = () => { setPropertyId(null); setZone(null); };

  const handleAdd  = () => { setEditItem(null); setModalOpen(true); };
  const handleEdit = (item) => { setEditItem(item); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditItem(null); };

  const handleSave = async (itemData) => {
    if (isStockZone) {
      const payload = { ...itemData, property: propertyId };
      if (editItem) { await editStockItem(editItem.id, payload); showToast('Producto actualizado'); }
      else          { await addStockItem(payload);              showToast('Producto creado'); }
    } else {
      const payload = { ...itemData, property: propertyId, zone };
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

  const handleAddProperty = async (data) => {
    const id = await addProperty(data);
    setAddPropertyOpen(false);
    showToast('Propiedad creada');
    setPropertyId(id);
  };

  if (!property) {
    return (
      <>
        <PropertySelector
          properties={stockProperties}
          onSelect={handleSelectProperty}
          onAddProperty={() => setAddPropertyOpen(true)}
        />
        <AddPropertyModal open={addPropertyOpen} onSave={handleAddProperty} onClose={() => setAddPropertyOpen(false)} />
      </>
    );
  }

  return (
    <div>
      {zone === null ? (
        <StockOverview
          propertyName={property.name}
          zones={zones}
          stock={propertyStock}
          furniture={propertyFurniture}
          onSelectZone={setZone}
          onBackToProperties={handleBackToProperties}
        />
      ) : (
        <ZoneDetail
          zone={zone}
          zones={zones}
          isStockZone={isStockZone}
          items={items}
          onBack={() => setZone(null)}
          onSelectZone={setZone}
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      )}
      <StockModal
        open={modalOpen}
        item={editItem}
        isStockZone={isStockZone}
        zone={zone}
        zones={zones}
        onSave={handleSave}
        onDelete={handleDelete}
        onClose={handleClose}
      />
    </div>
  );
}
