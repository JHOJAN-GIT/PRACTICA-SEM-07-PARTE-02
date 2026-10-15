// Footer.jsx — Pie de página del Dashboard

const YEAR = new Date().getFullYear();

const HOOKS_USADOS = [
  "useReducer",
  "useContext",
  "useEffect",
  "useMemo",
  "useCallback",
  "useRef",
  "useLocalStorage",
  "useDebounce",
];

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-section">
          <h3 className="footer-heading">🎓 GestiEstud</h3>
          <p className="footer-text">
            Dashboard de Gestión de Estudiantes desarrollado con React 19 + Vite.
            Práctica académica — Desarrollo de Aplicaciones Web.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Hooks Implementados</h3>
          <ul className="footer-hooks" role="list">
            {HOOKS_USADOS.map((hook) => (
              <li key={hook} className="footer-hook-tag">
                {hook}
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-heading">Información</h3>
          <ul className="footer-info-list" role="list">
            <li>Asignatura: IS093A</li>
            <li>Unidad I: Desarrollo Web Frontend</li>
            <li>Tema: React Hooks</li>
            <li>UNCP — Facultad de Ingeniería de Sistemas</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {YEAR} UNCP — Ingeniería de Sistemas. Todos los derechos reservados.</span>
      </div>
    </footer>
  );
}
