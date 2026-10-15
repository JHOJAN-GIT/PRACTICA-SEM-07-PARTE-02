// Custom Hook: useDebounce
// Retrasa la actualización de un valor para evitar procesamiento excesivo
// en cada pulsación de teclado (útil en búsquedas y filtros).

import { useState, useEffect } from "react";

/**
 * @param {*}      value  - Valor a debounce-ar
 * @param {number} delay  - Milisegundos de espera (por defecto 500)
 * @returns {*}           - debouncedValue actualizado tras el delay
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Actualiza el valor debounceado solo después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: cancela el timer si value o delay cambian antes de que expire
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
