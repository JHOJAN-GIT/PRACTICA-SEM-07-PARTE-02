// Custom Hook: useLocalStorage
// Sincroniza estado de React con localStorage.
// Permite que el valor persista entre recargas sin duplicar lógica en cada componente.

import { useState, useEffect } from "react";

/**
 * @param {string} key           - Clave en localStorage
 * @param {*}      defaultValue  - Valor inicial si la clave no existe o hay error
 * @returns {[any, Function]}    - [value, setValue]
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  // Persiste el valor en localStorage cada vez que cambia
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Si localStorage no está disponible (ej. modo privado lleno), ignorar
    }
  }, [key, value]);

  return [value, setValue];
}
