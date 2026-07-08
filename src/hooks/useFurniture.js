// src/hooks/useFurniture.js
import { api } from '../services/api.js';

export function useFurniture(data, setData) {
  const addFurnitureItem = async (itemData) => {
    const id = `furniture-manual-${Date.now()}`;
    const newItem = { ...itemData, id };
    setData(prev => ({ ...prev, furniture: [newItem, ...prev.furniture] }));
    try {
      await api.createFurniture({ ...itemData, id });
    } catch {
      setData(prev => ({ ...prev, furniture: prev.furniture.filter(f => f.id !== id) }));
    }
  };

  const editFurnitureItem = async (id, itemData) => {
    setData(prev => ({
      ...prev,
      furniture: prev.furniture.map(f => f.id === id ? { ...f, ...itemData } : f),
    }));
    try {
      await api.updateFurniture(id, itemData);
    } catch {
      api.getData().then(setData);
    }
  };

  const deleteFurnitureItem = async (id) => {
    setData(prev => ({ ...prev, furniture: prev.furniture.filter(f => f.id !== id) }));
    await api.deleteFurniture(id);
  };

  return { addFurnitureItem, editFurnitureItem, deleteFurnitureItem };
}
