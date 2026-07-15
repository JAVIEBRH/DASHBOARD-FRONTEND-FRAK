// src/hooks/useToast.js
import { useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success', { duration = 3000, onClick } = {}) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, onClick }]);
    setTimeout(() => setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t)), duration - 300);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  };

  return { toasts, showToast };
}
