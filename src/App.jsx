// App.jsx — Dashboard de Gestión de Estudiantes
//
// Hooks usados:
//   useReducer     → gestión centralizada del estado de estudiantes (items, filter, sort)
//   useContext     → useTema() consume ThemeContext para tema global
//   useEffect      → hidratación desde localStorage al montar; sincronización items→localStorage
//   useMemo        → estadísticas calculadas; lista filtrada por búsqueda debounceada; cursoStats
//   useCallback    → handlers estabilizados para pasar a componentes hijos sin re-renders
//   useState       → searchTerm local + vistaActual (navegación SPA)
//   useLocalStorage (custom) → persiste estudiantes en localStorage
//   useDebounce    (custom) → retrasa la búsqueda 400 ms para no filtrar en cada tecla

import { useReducer, useEffect, useMemo, useCallback, useState } from "react";
import "./App.css";

import { useTema } from "./context/ThemeContext";
import studentsReducer, { initialState } from "./hooks/useStudentsReducer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useDebounce } from "./hooks/useDebounce";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  // ── Reducer — lógica de estudiantes ─────────────────────────────────────
  const [state, dispatch] = useReducer(studentsReducer, initialState);

  // ── Contexto de tema ─────────────────────────────────────────────────────
  const { tema } = useTema();

  // ── Persistencia — localStorage vía custom hook ──────────────────────────
  const [savedStudents, setSavedStudents] = useLocalStorage("students-data", []);

  // ── Navegación por vistas (SPA) ───────────────────────────────────────────
  const [vistaActual, setVistaActual] = useState("registro");

  // ── Búsqueda con debounce ─────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // isSearching: true mientras el debounce aún no se asentó
  const isSearching = searchTerm !== debouncedSearch;

  // ── Efecto de hidratación (solo en mount) ─────────────────────────────────
  useEffect(() => {
    if (savedStudents.length > 0) {
      dispatch({ type: "HYDRATE", payload: savedStudents });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intencional: solo al montar

  // ── Efecto de sincronización (items → localStorage) ───────────────────────
  useEffect(() => {
    setSavedStudents(state.items);
  }, [state.items, setSavedStudents]);

  // ── useMemo — estadísticas ────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: state.items.length,
      aprobados: state.items.filter((s) => s.estado === "aprobado").length,
      reprobados: state.items.filter((s) => s.estado === "reprobado").length,
      promedio: state.items.length
        ? (
            state.items.reduce((acc, s) => acc + s.nota, 0) / state.items.length
          ).toFixed(1)
        : "0.0",
    }),
    [state.items]
  );

  // ── useMemo — estadísticas por curso ──────────────────────────────────────
  const cursoStats = useMemo(() => {
    const CURSOS_LIST = ["Matemáticas", "Física", "Programación", "Base de Datos", "Redes"];
    return CURSOS_LIST
      .map((curso) => {
        const del_curso = state.items.filter((s) => s.curso === curso);
        const aprobados = del_curso.filter((s) => s.estado === "aprobado").length;
        const reprobados = del_curso.filter((s) => s.estado === "reprobado").length;
        const promedio = del_curso.length
          ? (del_curso.reduce((acc, s) => acc + s.nota, 0) / del_curso.length).toFixed(1)
          : "—";
        return { curso, total: del_curso.length, aprobados, reprobados, promedio };
      })
      .filter((c) => c.total > 0);
  }, [state.items]);

  // ── useMemo — lista filtrada por búsqueda debounceada ────────────────────
  const filteredStudents = useMemo(
    () =>
      state.items.filter((s) =>
        s.nombre.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [state.items, debouncedSearch]
  );

  // ── useCallback — handlers estabilizados ─────────────────────────────────
  const handleAdd = useCallback(
    (payload) => dispatch({ type: "ADD_STUDENT", payload }),
    [dispatch]
  );

  const handleRemove = useCallback(
    (id) => dispatch({ type: "REMOVE_STUDENT", payload: id }),
    [dispatch]
  );

  const handleSetFilter = useCallback(
    (f) => dispatch({ type: "SET_FILTER", payload: f }),
    [dispatch]
  );

  const handleSetSort = useCallback(
    (s) => dispatch({ type: "SET_SORT", payload: s }),
    [dispatch]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app-layout" data-tema={tema}>
      {/* Barra de navegación */}
      <Navbar vistaActual={vistaActual} setVistaActual={setVistaActual} />

      {/* Contenido principal */}
      <main className="main-content" id="main-content">

        {/* ══ VISTA: registro ══ */}
        {vistaActual === "registro" && (
          <>
            {/* Hero section */}
            <section className="vista-hero" aria-label="Bienvenida">
              <div className="hero-text">
                <h1>Gestión Académica de Estudiantes</h1>
                <p>Registra el rendimiento académico de tus estudiantes de forma sencilla y rápida.</p>
              </div>
              <div className="hero-image" aria-hidden="true">
                {/* SVG artístico: estudiante graduado con libros */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="Ilustración de estudiante graduado">
                  {/* Fondo circular suave */}
                  <circle cx="110" cy="110" r="105" fill="#e0e7ff" opacity="0.5"/>

                  {/* Libros apilados — base */}
                  <rect x="40" y="155" width="60" height="12" rx="3" fill="#4f46e5"/>
                  <rect x="44" y="143" width="52" height="12" rx="3" fill="#6366f1"/>
                  <rect x="48" y="131" width="44" height="12" rx="3" fill="#818cf8"/>
                  {/* Detalle lomo de libros */}
                  <line x1="44" y1="155" x2="44" y2="167" stroke="#3730a3" strokeWidth="1.5"/>
                  <line x1="48" y1="143" x2="48" y2="155" stroke="#4338ca" strokeWidth="1.5"/>
                  <line x1="52" y1="131" x2="52" y2="143" stroke="#4f46e5" strokeWidth="1.5"/>

                  {/* Diploma / pergamino */}
                  <rect x="125" y="130" width="55" height="40" rx="4" fill="#f59e0b"/>
                  <rect x="129" y="134" width="47" height="32" rx="2" fill="#fef3c7"/>
                  <line x1="135" y1="142" x2="173" y2="142" stroke="#d97706" strokeWidth="1.5"/>
                  <line x1="135" y1="149" x2="173" y2="149" stroke="#d97706" strokeWidth="1.5"/>
                  <line x1="135" y1="156" x2="160" y2="156" stroke="#d97706" strokeWidth="1.5"/>
                  {/* Lazo del diploma */}
                  <circle cx="152" cy="170" r="6" fill="#ef4444"/>
                  <line x1="152" y1="164" x2="148" y2="175" stroke="#ef4444" strokeWidth="2"/>
                  <line x1="152" y1="164" x2="156" y2="175" stroke="#ef4444" strokeWidth="2"/>

                  {/* Cuerpo del estudiante */}
                  {/* Toga */}
                  <path d="M80 175 Q90 130 110 125 Q130 130 140 175 Z" fill="#4f46e5"/>
                  {/* Detalles toga */}
                  <path d="M95 150 Q110 145 125 150" stroke="#818cf8" strokeWidth="2" fill="none"/>
                  <path d="M92 160 Q110 154 128 160" stroke="#818cf8" strokeWidth="1.5" fill="none"/>
                  {/* Cabeza */}
                  <circle cx="110" cy="100" r="22" fill="#fde68a"/>
                  {/* Cara — ojos */}
                  <circle cx="103" cy="97" r="2.5" fill="#1e293b"/>
                  <circle cx="117" cy="97" r="2.5" fill="#1e293b"/>
                  {/* Cara — sonrisa */}
                  <path d="M103 106 Q110 113 117 106" stroke="#92400e" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                  {/* Cabello */}
                  <path d="M88 98 Q90 78 110 76 Q130 78 132 98 Q125 88 110 87 Q95 88 88 98Z" fill="#92400e"/>

                  {/* Birrete / toga de graduación */}
                  <rect x="92" y="76" width="36" height="7" rx="2" fill="#1e293b"/>
                  <polygon points="110,58 130,76 90,76" fill="#1e293b"/>
                  {/* Borla del birrete */}
                  <line x1="126" y1="67" x2="132" y2="82" stroke="#f59e0b" strokeWidth="2.5"/>
                  <circle cx="133" cy="84" r="4" fill="#f59e0b"/>

                  {/* Brazos */}
                  {/* Brazo izquierdo sosteniendo libros */}
                  <path d="M88 140 Q70 140 65 155" stroke="#4f46e5" strokeWidth="8" strokeLinecap="round" fill="none"/>
                  {/* Mano izquierda */}
                  <circle cx="65" cy="155" r="6" fill="#fde68a"/>
                  {/* Brazo derecho sosteniendo diploma */}
                  <path d="M132 140 Q148 138 150 152" stroke="#4f46e5" strokeWidth="8" strokeLinecap="round" fill="none"/>
                  {/* Mano derecha */}
                  <circle cx="150" cy="152" r="6" fill="#fde68a"/>

                  {/* Estrellas decorativas */}
                  <text x="32" y="75" fontSize="18" fill="#f59e0b">★</text>
                  <text x="168" y="65" fontSize="14" fill="#10b981">★</text>
                  <text x="55" y="115" fontSize="10" fill="#818cf8">✦</text>
                  <text x="170" y="110" fontSize="10" fill="#f59e0b">✦</text>

                  {/* Puntos decorativos de fondo */}
                  <circle cx="30" cy="40" r="4" fill="#a5b4fc" opacity="0.6"/>
                  <circle cx="185" cy="35" r="3" fill="#6ee7b7" opacity="0.6"/>
                  <circle cx="190" cy="175" r="5" fill="#fca5a5" opacity="0.6"/>
                  <circle cx="25" cy="180" r="3" fill="#fde68a" opacity="0.7"/>
                </svg>
              </div>
            </section>

            {/* Formulario de registro */}
            <StudentForm onAdd={handleAdd} />
          </>
        )}

        {/* ══ VISTA: lista ══ */}
        {vistaActual === "lista" && (
          <section aria-label="Lista de estudiantes">
            <h2 className="section-title">📋 Lista de Estudiantes</h2>

            {/* Controles de búsqueda, filtro y orden */}
            <div className="controls" style={{ marginBottom: "16px" }}>
              <div className="search-bar">
                <label htmlFor="search-input">Buscar:</label>
                <input
                  id="search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nombre del estudiante..."
                />
              </div>

              <div className="filter-group">
                <label>Filtrar:</label>
                {["todos", "aprobado", "reprobado"].map((f) => (
                  <button
                    key={f}
                    className={`btn btn-filter ${state.filter === f ? "active" : ""}`}
                    onClick={() => handleSetFilter(f)}
                    aria-pressed={state.filter === f}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              <div className="sort-group">
                <label htmlFor="sort-select">Ordenar:</label>
                <select
                  id="sort-select"
                  value={state.sort}
                  onChange={(e) => handleSetSort(e.target.value)}
                >
                  <option value="nombre-asc">Nombre A-Z</option>
                  <option value="nombre-desc">Nombre Z-A</option>
                  <option value="nota-asc">Nota ↑</option>
                  <option value="nota-desc">Nota ↓</option>
                </select>
              </div>
            </div>

            <StudentList
              students={filteredStudents}
              filter={state.filter}
              sort={state.sort}
              onRemove={handleRemove}
              isSearching={isSearching}
              searchTerm={searchTerm}
            />
          </section>
        )}

        {/* ══ VISTA: estadisticas ══ */}
        {vistaActual === "estadisticas" && (
          <section className="stats-page" aria-label="Estadísticas académicas">
            <h2 className="section-title">📊 Estadísticas Académicas</h2>

            {/* Tarjetas de resumen */}
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Estudiantes</span>
              </div>
              <div className="stat-card stat-success">
                <span className="stat-number">{stats.aprobados}</span>
                <span className="stat-label">Aprobados</span>
              </div>
              <div className="stat-card stat-danger">
                <span className="stat-number">{stats.reprobados}</span>
                <span className="stat-label">Reprobados</span>
              </div>
              <div className="stat-card stat-accent">
                <span className="stat-number">{stats.promedio}</span>
                <span className="stat-label">Promedio General</span>
              </div>
            </div>

            {/* Condicional: sin datos */}
            {state.items.length === 0 ? (
              <div className="empty-stats">
                <span style={{ fontSize: "3rem" }}>📭</span>
                <p>Aún no hay datos. Registra estudiantes para ver estadísticas.</p>
              </div>
            ) : (
              <>
                {/* Tabla de distribución por curso */}
                <div className="table-wrapper" style={{ marginTop: "24px" }}>
                  <table className="student-table" aria-label="Distribución por curso">
                    <thead>
                      <tr>
                        <th>Curso</th>
                        <th>Total</th>
                        <th>Aprobados</th>
                        <th>Reprobados</th>
                        <th>Promedio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cursoStats.map((c) => (
                        <tr key={c.curso}>
                          <td>{c.curso}</td>
                          <td>{c.total}</td>
                          <td>{c.aprobados}</td>
                          <td>{c.reprobados}</td>
                          <td>{c.promedio}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Gráfico de barras horizontal CSS puro */}
                <div className="curso-bar-chart" style={{ marginTop: "24px" }}>
                  <h3 style={{ marginBottom: "16px", color: "var(--text-primary)", fontSize: "1rem" }}>
                    Porcentaje de aprobados por curso
                  </h3>
                  {cursoStats.map((c) => (
                    <div key={c.curso} style={{ marginBottom: "12px" }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                      }}>
                        <span>{c.curso}</span>
                        <span>{c.total > 0 ? Math.round((c.aprobados / c.total) * 100) : 0}%</span>
                      </div>
                      <div style={{
                        background: "var(--bg-primary)",
                        borderRadius: "4px",
                        height: "28px",
                        overflow: "hidden",
                      }}>
                        <div
                          className="curso-bar"
                          style={{
                            width: c.total > 0 ? `${Math.round((c.aprobados / c.total) * 100)}%` : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

      </main>

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
