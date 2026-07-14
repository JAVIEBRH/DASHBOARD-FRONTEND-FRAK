// src/hooks/useLimpiezas.js
import { api } from '../services/api.js';

export function useLimpiezas(data, setData) {
  const addLimpieza = async (itemData) => {
    const id = `limpieza-manual-${Date.now()}`;
    const newItem = { ...itemData, id };
    setData(prev => ({ ...prev, limpiezas: [newItem, ...prev.limpiezas] }));
    try {
      await api.createLimpieza({ ...itemData, id });
    } catch {
      setData(prev => ({ ...prev, limpiezas: prev.limpiezas.filter(s => s.id !== id) }));
    }
  };

  const editLimpieza = async (id, itemData) => {
    setData(prev => ({
      ...prev,
      limpiezas: prev.limpiezas.map(s => s.id === id ? { ...s, ...itemData } : s),
    }));
    try {
      await api.updateLimpieza(id, itemData);
    } catch {
      api.getData().then(setData);
    }
  };

  const deleteLimpieza = async (id) => {
    setData(prev => ({ ...prev, limpiezas: prev.limpiezas.filter(s => s.id !== id) }));
    await api.deleteLimpieza(id);
  };

  return { addLimpieza, editLimpieza, deleteLimpieza };
}
