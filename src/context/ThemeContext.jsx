// ThemeContext — gestión global del tema light/dark con persistencia en localStorage.
// useLocalStorage reemplaza useState para que el tema sobreviva recargas de página.
// useEffect aplica la clase al body para activar las variables CSS del tema.

import { createContext, useContext, useEffect } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [tema, setTema] = useLocalStorage("theme", "light");

  function toggleTema() {
    setTema((prev) => (prev === "light" ? "dark" : "light"));
  }

  // Aplica/quita la clase en document.body para activar las CSS custom properties
  useEffect(() => {
    if (tema === "dark") {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }

    // Cleanup: elimina ambas clases al desmontar o antes del próximo efecto
    return () => {
      document.body.classList.remove("dark", "light");
    };
  }, [tema]);

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook de conveniencia — lanza error claro si se usa fuera del provider
export function useTema() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTema debe usarse dentro de <ThemeProvider>");
  return ctx;
}
