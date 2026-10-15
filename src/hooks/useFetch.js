// Custom Hook: useFetch
// Encapsula la lógica de fetch con useEffect + AbortController (cleanup).
// Cualquier componente que necesite datos async lo reutiliza sin duplicar código.
//
// Paso 2 de la práctica:
//   - useEffect con array de dependencias [url]
//   - AbortController previene memory leaks si el componente se desmonta
//     antes de que el fetch termine
//   - En React.StrictMode el efecto se monta, desmonta y remonta en dev;
//     por eso [] NO garantiza "una sola ejecución" en desarrollo, solo en producción.
//     El AbortController hace que el fetch cancelado no actualice estado ya desmontado.

import { useState, useEffect } from "react";

/**
 * @param {string | null} url  - URL a fetchear; si es null no hace nada
 * @returns {{ datos: any, cargando: boolean, error: string | null }}
 */
export function useFetch(url) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si no hay URL no disparamos nada
    if (!url) return;

    // AbortController — cleanup: si el componente se desmonta antes de
    // que la promesa resuelva, abortamos la petición para evitar
    // "Can't perform a React state update on an unmounted component"
    const controller = new AbortController();

    async function fetchDatos() {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await fetch(url, { signal: controller.signal });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        const json = await respuesta.json();
        setDatos(json);
      } catch (err) {
        // AbortError no es un error real, es la limpieza normal
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setCargando(false);
      }
    }

    fetchDatos();

    // Función de limpieza: se ejecuta cuando url cambia o el componente desmonta
    return () => controller.abort();
  }, [url]); // Solo re-ejecuta si la URL cambia

  return { datos, cargando, error };
}
