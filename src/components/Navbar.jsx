// Navbar.jsx — Barra de navegación principal del Dashboard
// Consume ThemeContext vía useTema() para mostrar el botón de tema.

import { useTema } from "../context/ThemeContext";

const NAV_LINKS = [
  { href: "#estadisticas", label: "Estadísticas" },
  { href: "#registro",     label: "Registrar" },
  { href: "#lista",        label: "Lista" },
];

export default function Navbar() {
  const { tema, toggleTema } = useTema();

  return (
    <nav className="navbar" role="navigation" aria-label="Navegación principal">
      <div className="navbar-brand">
        <span className="navbar-logo" aria-hidden="true">🎓</span>
        <span className="navbar-name">GestiEstud</span>
      </div>

      <ul className="navbar-links" role="list">
        {NAV_LINKS.map(({ href, label }) => (
          <li key={href}>
            <a href={href} className="navbar-link">
              {label}
            </a>
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
