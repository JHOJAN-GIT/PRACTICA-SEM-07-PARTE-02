// StudentList — tabla de estudiantes con filtrado, ordenación, spinner de búsqueda
// y estado vacío mejorado.
// useMemo: evita recalcular la lista procesada en cada render si props no cambian.
// useCallback: estabiliza handleRemove para no forzar re-renders en filas.

import { useMemo, useCallback } from "react";

/**
 * @param {{
 *   students: Array,
 *   filter: string,
 *   sort: string,
 *   onRemove: (id: number) => void,
 *   isSearching: boolean,
 *   searchTerm: string
 * }} props
 */
export default function StudentList({ students, filter, sort, onRemove, isSearching, searchTerm }) {
  // Filtra y ordena la lista cada vez que cambian students, filter o sort
  const processedStudents = useMemo(() => {
    // 1. Filtrar por estado
    const filtered =
      filter === "todos"
        ? students
        : students.filter((s) => s.estado === filter);

    // 2. Ordenar
    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "nombre-asc":
          return a.nombre.localeCompare(b.nombre);
        case "nombre-desc":
          return b.nombre.localeCompare(a.nombre);
        case "nota-asc":
          return a.nota - b.nota;
        case "nota-desc":
          return b.nota - a.nota;
        default:
          return 0;
      }
    });
  }, [students, filter, sort]);

  // Estabiliza la función para no forzar re-renders innecesarios en filas
  const handleRemove = useCallback(
    (id) => onRemove(id),
    [onRemove]
  );

  // ── Contenido del tbody según estado ──────────────────────────────────
  function renderTbody() {
    // 1. Buscando (debounce en curso)
    if (isSearching) {
      return (
        <tr className="searching-row">
          <td colSpan={5}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
              <div className="spinner" role="status" aria-label="Buscando"></div>
              <span>Buscando...</span>
            </div>
          </td>
        </tr>
      );
    }

    // 2. Sin resultados pero había término de búsqueda
    if (processedStudents.length === 0 && searchTerm !== "") {
      return (
        <tr>
          <td colSpan={5}>
            <div className="empty-search">
              <span className="empty-search-icon">🔍</span>
              <p className="empty-search-title">Sin resultados</p>
              <p className="empty-search-sub">No se encontraron estudiantes para "{searchTerm}"</p>
            </div>
          </td>
        </tr>
      );
    }

    // 3. Lista vacía sin búsqueda activa
    if (processedStudents.length === 0) {
      return (
        <tr className="empty-row">
          <td colSpan={5}>No hay estudiantes registrados. ¡Empieza registrando uno!</td>
        </tr>
      );
    }

    // 4. Filas normales
    return processedStudents.map((student) => (
      <tr key={student.id}>
        <td>{student.nombre}</td>
        <td>{student.curso}</td>
        <td>{student.nota.toFixed(1)}</td>
        <td>
          <span
            className={`badge ${
              student.estado === "aprobado" ? "badge-aprobado" : "badge-reprobado"
            }`}
          >
            {student.estado}
          </span>
        </td>
        <td>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleRemove(student.id)}
            aria-label={`Eliminar a ${student.nombre}`}
          >
            🗑 Eliminar
          </button>
        </td>
      </tr>
    ));
  }

  return (
    <div className="table-wrapper">
      {/* Barra de contador — solo cuando hay resultados */}
      {processedStudents.length > 0 && (
        <div className="table-header-bar">
          <span className="table-counter">
            Mostrando {processedStudents.length} de {students.length} estudiante{students.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      <table className="student-table" aria-label="Lista de estudiantes">
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Curso</th>
            <th scope="col">Nota</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {renderTbody()}
        </tbody>
      </table>
    </div>
  );
}
