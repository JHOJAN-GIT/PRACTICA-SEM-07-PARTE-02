// App.jsx — Dashboard de Gestión de Estudiantes
//
// Hooks usados:
//   useReducer     → gestión centralizada del estado de estudiantes (items, filter, sort)
//   useContext     → useTema() consume ThemeContext para tema global
//   useEffect      → hidratación desde localStorage al montar; sincronización items→localStorage
//   useMemo        → estadísticas calculadas; lista filtrada por búsqueda debounceada
//   useCallback    → handlers estabilizados para pasar a componentes hijos sin re-renders
//   useState       → searchTerm local del input de búsqueda
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

export default function App() {
  // ── Reducer — lógica de estudiantes ─────────────────────────────────────
  const [state, dispatch] = useReducer(studentsReducer, initialState);

  // ── Contexto de tema ─────────────────────────────────────────────────────
  const { tema, toggleTema } = useTema();

  // ── Persistencia — localStorage vía custom hook ──────────────────────────
  const [savedStudents, setSavedStudents] = useLocalStorage("students-data", []);

  // ── Búsqueda con debounce ─────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);

  // ── Efecto de hidratación (solo en mount) ─────────────────────────────────
  // Lee los datos guardados en localStorage y los carga en el reducer.
  // Se ejecuta una sola vez al montar; savedStudents se lee en el momento
  // de creación del efecto, no se pone como dependencia para evitar el loop.
  useEffect(() => {
    if (savedStudents.length > 0) {
      dispatch({ type: "HYDRATE", payload: savedStudents });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intencional: solo al montar

  // ── Efecto de sincronización (items → localStorage) ───────────────────────
  // Cada vez que el reducer actualiza items, persiste en localStorage.
  // setSavedStudents viene de useLocalStorage (referencia estable).
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

  // ── useMemo — lista filtrada por búsqueda ─────────────────────────────────
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
    <div className="dashboard" data-tema={tema}>
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-title">
          <span aria-hidden="true">🎓</span>
          <h1>Dashboard de Gestión de Estudiantes</h1>
          <span className="subtitle">UNCP — Práctica Semana 07 Parte 2</span>
        </div>
        <button
          className="btn btn-theme"
          onClick={toggleTema}
          aria-label="Cambiar tema"
        >
          {tema === "light" ? "🌙 Modo Oscuro" : "☀️ Modo Claro"}
        </button>
      </header>

      {/* Estadísticas */}
      <section className="stats-grid" aria-label="Estadísticas">
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
      </section>

      {/* Formulario */}
      <StudentForm onAdd={handleAdd} />

      {/* Controles de búsqueda, filtro y orden */}
      <section className="controls" aria-label="Controles de búsqueda y filtrado">
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
      </section>

      {/* Tabla de estudiantes */}
      <StudentList
        students={filteredStudents}
        filter={state.filter}
        sort={state.sort}
        onRemove={handleRemove}
      />
    </div>
  );
}
