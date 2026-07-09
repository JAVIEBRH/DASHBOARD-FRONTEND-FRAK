// src/hooks/useProperties.js
import { api } from '../services/api.js';

export function useProperties(setData) {
  const addProperty = async ({ name, zones }) => {
    const result = await api.createProperty({ name, zones });
    const fresh = await api.getData();
    setData(fresh);
    return result.id;
  };

  return { addProperty };
}
