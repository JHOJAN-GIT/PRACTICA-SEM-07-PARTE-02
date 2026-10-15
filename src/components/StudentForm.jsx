// StudentForm — formulario para agregar un nuevo estudiante.
// useRef: foco automático en el campo nombre al montar el componente.
// useState local: campos del formulario (nombre, curso, nota).

import { useState, useRef, useEffect } from "react";

const CURSOS = ["Matemáticas", "Física", "Programación", "Base de Datos", "Redes"];

/**
 * @param {{ onAdd: (payload: { nombre: string, curso: string, nota: number }) => void }} props
 */
export default function StudentForm({ onAdd }) {
  const [nombre, setNombre] = useState("");
  const [curso, setCurso] = useState("Matemáticas");
  const [nota, setNota] = useState("");

  const nombreRef = useRef(null);

  // Foco automático en el campo nombre al montar el formulario
  useEffect(() => {
    nombreRef.current?.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();

    const notaNum = Number(nota);

    if (!nombre.trim()) {
      alert("El nombre del estudiante no puede estar vacío.");
      return;
    }

    if (nota === "" || isNaN(notaNum) || notaNum < 0 || notaNum > 20) {
      alert("La nota debe ser un número entre 0 y 20.");
      return;
    }

    onAdd({ nombre: nombre.trim(), curso, nota: notaNum });

    // Resetea los campos al estado inicial
    setNombre("");
    setCurso("Matemáticas");
    setNota("");
    nombreRef.current?.focus();
  }

  return (
    <section className="student-form">
      <h2>➕ Registrar Estudiante</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sf-nombre">Nombre</label>
            <input
              id="sf-nombre"
              ref={nombreRef}
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: María García"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sf-curso">Curso</label>
            <select
              id="sf-curso"
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
            >
              {CURSOS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="sf-nota">Nota (0–20)</label>
            <input
              id="sf-nota"
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej: 15.5"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Agregar Estudiante
          </button>
        </div>
      </form>
    </section>
  );
}
