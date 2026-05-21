// src/hooks/useTransactions.js
import { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export function useTransactions() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  const addTransaction = async (txData) => {
    const id = `manual-${Date.now()}`;
    const newTx = { ...txData, id };
    setData(prev => ({ ...prev, transactions: [newTx, ...prev.transactions] }));
    try {
      await api.createTx({ ...txData, id });
    } catch {
      setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    }
  };

  const editTransaction = async (id, txData) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.id === id ? { ...t, ...txData } : t),
    }));
    try {
      await api.updateTx(id, txData);
    } catch {
      api.getData().then(setData);
    }
  };

  const deleteTransaction = async (id) => {
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
    await api.deleteTx(id);
  };

  return { data, loading, error, addTransaction, editTransaction, deleteTransaction };
}
