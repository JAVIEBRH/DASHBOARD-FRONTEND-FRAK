// src/hooks/useFilter.js
import { useState, useMemo, useEffect } from 'react';

export function useFilter(transactions, monthsOrder2025, monthsOrder2026) {
  const [year, setYear] = useState('2025');
  const [period, setPeriod] = useState('all');

  useEffect(() => { setPeriod('all'); }, [year]);

  const monthsOrder = year === '2025' ? (monthsOrder2025 ?? []) : (monthsOrder2026 ?? []);

  const filteredTx = useMemo(() => {
    const suffix = year === '2025' ? '-25' : '-26';
    let base = (transactions ?? []).filter(t => t.month.endsWith(suffix));
    if (period !== 'all') base = base.filter(t => t.month === period);
    return base;
  }, [transactions, year, period]);

  return { year, setYear, period, setPeriod, filteredTx, monthsOrder };
}
