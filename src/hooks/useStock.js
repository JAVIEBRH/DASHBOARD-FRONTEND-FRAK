// src/hooks/useStock.js
import { api } from '../services/api.js';

export function useStock(data, setData) {
  const addStockItem = async (itemData) => {
    const id = `stock-manual-${Date.now()}`;
    const newItem = { ...itemData, id };
    setData(prev => ({ ...prev, stock: [newItem, ...prev.stock] }));
    try {
      await api.createStock({ ...itemData, id });
    } catch {
      setData(prev => ({ ...prev, stock: prev.stock.filter(s => s.id !== id) }));
    }
  };

  const editStockItem = async (id, itemData) => {
    setData(prev => ({
      ...prev,
      stock: prev.stock.map(s => s.id === id ? { ...s, ...itemData } : s),
    }));
    try {
      await api.updateStock(id, itemData);
    } catch {
      api.getData().then(setData);
    }
  };

  const deleteStockItem = async (id) => {
    setData(prev => ({ ...prev, stock: prev.stock.filter(s => s.id !== id) }));
    await api.deleteStock(id);
  };

  return { addStockItem, editStockItem, deleteStockItem };
}
