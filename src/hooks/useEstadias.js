// src/hooks/useEstadias.js
import { api } from '../services/api.js';

export function useEstadias(data, setData) {
  const addEstadia = async (itemData) => {
    const id = `estadia-manual-${Date.now()}`;
    const newItem = { ...itemData, id };
    setData(prev => ({ ...prev, estadias: [newItem, ...prev.estadias] }));
    try {
      await api.createEstadia({ ...itemData, id });
    } catch {
      setData(prev => ({ ...prev, estadias: prev.estadias.filter(s => s.id !== id) }));
    }
  };

  const editEstadia = async (id, itemData) => {
    setData(prev => ({
      ...prev,
      estadias: prev.estadias.map(s => s.id === id ? { ...s, ...itemData } : s),
    }));
    try {
      await api.updateEstadia(id, itemData);
    } catch {
      api.getData().then(setData);
    }
  };

  const deleteEstadia = async (id) => {
    setData(prev => ({ ...prev, estadias: prev.estadias.filter(s => s.id !== id) }));
    await api.deleteEstadia(id);
  };

  return { addEstadia, editEstadia, deleteEstadia };
}
