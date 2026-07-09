// hooks/useLocalStorage.js — CampusConnect
// React hook for reactive LocalStorage state

import { useState, useCallback } from 'react';
import { lsGet, lsSet, lsRemove } from '../utils/localStorage.js';

/**
 * useLocalStorage(key, initialValue)
 * Returns [storedValue, setValue, removeValue] — works just like useState
 * but syncs to LocalStorage automatically.
 */
export function useLocalStorage(key, initialValue = null) {
  const [storedValue, setStoredValue] = useState(() => lsGet(key, initialValue));

  const setValue = useCallback((value) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    lsSet(key, valueToStore);
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    lsRemove(key);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
