// src/hooks/useKanbanTasks.js
import { api } from '../services/api.js';

export function useKanbanTasks(data, setData) {
  const addKanbanTask = async (itemData) => {
    const id = `kanban-manual-${Date.now()}`;
    const newItem = { ...itemData, id };
    setData(prev => ({ ...prev, kanbanTasks: [newItem, ...prev.kanbanTasks] }));
    try {
      await api.createKanbanTask({ ...itemData, id });
    } catch {
      setData(prev => ({ ...prev, kanbanTasks: prev.kanbanTasks.filter(s => s.id !== id) }));
    }
  };

  const editKanbanTask = async (id, itemData) => {
    setData(prev => ({
      ...prev,
      kanbanTasks: prev.kanbanTasks.map(s => s.id === id ? { ...s, ...itemData } : s),
    }));
    try {
      await api.updateKanbanTask(id, itemData);
    } catch {
      api.getData().then(setData);
    }
  };

  const deleteKanbanTask = async (id) => {
    setData(prev => ({ ...prev, kanbanTasks: prev.kanbanTasks.filter(s => s.id !== id) }));
    await api.deleteKanbanTask(id);
  };

  return { addKanbanTask, editKanbanTask, deleteKanbanTask };
}
