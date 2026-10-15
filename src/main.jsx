// main.jsx — punto de entrada del Dashboard de Gestión de Estudiantes.
//
// React.StrictMode: en desarrollo activa comprobaciones adicionales:
//   - Doble invocación de funciones de render para detectar efectos secundarios
//   - Doble montaje/desmontaje de efectos para verificar que el cleanup funciona
//   - Por eso useEffect con [] se ejecuta DOS veces en dev (comportamiento esperado)
//
// ThemeProvider envuelve toda la app para que useTema() funcione en cualquier componente.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
