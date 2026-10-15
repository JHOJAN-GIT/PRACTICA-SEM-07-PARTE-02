// Navbar.jsx — Barra de navegación principal del Dashboard
// Consume ThemeContext vía useTema() para el botón de tema.
// Recibe vistaActual y setVistaActual para navegación por vistas (SPA).

import { useTema } from "../context/ThemeContext";

const NAV_LINKS = [
  { id: "registro",     label: "Registrar",    icon: "📝" },
  { id: "lista",        label: "Lista",         icon: "📋" },
  { id: "estadisticas", label: "Estadísticas",  icon: "📊" },
];

export default function Navbar({ vistaActual, setVistaActual }) {
  const { tema, toggleTema } = useTema();

  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">
      <div className="navbar-brand">
        <span className="navbar-logo" aria-hidden="true">🎓</span>
        <span className="navbar-name">GestiEstud</span>
      </div>

      <ul className="navbar-links" role="list">
        {NAV_LINKS.map(({ id, label, icon }) => (
          <li key={id}>
            <button
              className={`navbar-link${vistaActual === id ? " active" : ""}`}
              onClick={() => setVistaActual(id)}
              aria-current={vistaActual === id ? "page" : undefined}
            >
              <span aria-hidden="true">{icon}</span> {label}
            </button>
          </li>
        ))}
      </ul>

      <button
        className="btn btn-theme btn-sm"
        onClick={toggleTema}
        aria-label={tema === "light" ? "Activar modo oscuro" : "Activar modo claro"}
      >
        {tema === "light" ? "🌙 Oscuro" : "☀️ Claro"}
      </button>
    </nav>
  );
}
