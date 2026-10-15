// StudentList — tabla de estudiantes con filtrado, ordenación y acciones.
// useMemo: evita recalcular la lista procesada en cada render si props no cambian.
// useCallback: estabiliza handleRemove para no romper la memoización del hijo.
// useRef + useEffect: reenfoca el buscador visual tras agregar/eliminar estudiantes.

import { useRef, useMemo, useCallback, useEffect } from "react";

/**
 * @param {{
 *   students: Array,
 *   filter: string,
 *   sort: string,
 *   onRemove: (id: number) => void
 * }} props
 */
export default function StudentList({ students, filter, sort, onRemove }) {
  const inputRef = useRef(null);

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

  // Estabiliza la función para que no fuerce re-renders innecesarios en filas
  const handleRemove = useCallback(
    (id) => onRemove(id),
    [onRemove]
  );

  // Re-enfoca el buscador visual al agregar o eliminar un estudiante
  useEffect(() => {
    inputRef.current?.focus();
  }, [students.length]);

  return (
    <div className="table-wrapper">
      <table className="student-table" aria-label="Lista de estudiantes">
        <thead>
          <tr>
            <th colSpan={5}>
              <div className="table-search-row" style={{ padding: "0" }}>
                <input
                  ref={inputRef}
                  type="text"
                  className="search-input-table"
                  placeholder="Buscar estudiante..."
                  readOnly
                  aria-label="Campo de búsqueda de estudiantes (use el buscador principal)"
                  style={{ cursor: "default" }}
                />
              </div>
            </th>
          </tr>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Curso</th>
            <th scope="col">Nota</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {processedStudents.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={5}>No hay estudiantes registrados</td>
            </tr>
          ) : (
            processedStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.nombre}</td>
                <td>{student.curso}</td>
                <td>{student.nota.toFixed(1)}</td>
                <td>
                  <span
                    className={`badge ${
                      student.estado === "aprobado"
                        ? "badge-aprobado"
                        : "badge-reprobado"
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
