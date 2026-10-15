// StudentForm — formulario de registro con validación en tiempo real.
// useState: estado de cada campo + flags "touched" por campo.
// useRef: auto-focus en el campo nombre al montar y tras submit exitoso.
// useEffect: foco automático al montar.

import { useState, useRef, useEffect } from "react";

const CURSOS = ["Matemáticas", "Física", "Programación", "Base de Datos", "Redes"];

/**
 * @param {{ onAdd: (payload: { nombre: string, curso: string, nota: number }) => void }} props
 */
export default function StudentForm({ onAdd }) {
  // ── Campos del formulario ───────────────────────────────────────────────
  const [nombre, setNombre] = useState("");
  const [curso, setCurso] = useState("");
  const [nota, setNota] = useState("");

  // ── Flags "touched" — se activan al interactuar con cada campo ──────────
  const [touchedNombre, setTouchedNombre] = useState(false);
  const [touchedCurso, setTouchedCurso] = useState(false);
  const [touchedNota, setTouchedNota] = useState(false);

  // ── Ref para auto-focus ─────────────────────────────────────────────────
  const nombreRef = useRef(null);

  useEffect(() => {
    nombreRef.current?.focus();
  }, []);

  // ── Validaciones individuales ───────────────────────────────────────────
  const nombreValido =
    nombre.trim().length > 0 &&
    nombre.trim().split(/\s+/).filter(Boolean).length <= 5;
  const cursoValido = curso !== "";
  const notaValida =
    nota !== "" &&
    !isNaN(Number(nota)) &&
    Number(nota) >= 0 &&
    Number(nota) <= 20;
  const formValido = nombreValido && cursoValido && notaValida;

  // ── Handlers ────────────────────────────────────────────────────────────

  function handleNombreChange(e) {
    const raw = e.target.value;
    // Aplicar Title Case
    const titleCased = raw.replace(/\b\w/g, (c) => c.toUpperCase());
    // Contar palabras en el valor actual del estado (antes de actualizar)
    const palabrasActuales = nombre.trim().split(/\s+/).filter(Boolean).length;
    // Si ya hay 5 palabras y se intenta añadir un espacio para crear la 6ª, bloquear
    if (palabrasActuales >= 5 && titleCased.endsWith(" ") && titleCased.trim().split(/\s+/).filter(Boolean).length >= 5) {
      setTouchedNombre(true);
      return;
    }
    setNombre(titleCased);
  }

  function handleCursoChange(e) {
    setCurso(e.target.value);
    setTouchedCurso(true);
  }

  function handleNotaChange(e) {
    setNota(e.target.value);
    if (e.target.value !== "") setTouchedNota(true);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formValido) return;

    onAdd({
      nombre: nombre.trim(),
      curso,
      nota: Number(nota),
    });

    // Resetear campos
    setNombre("");
    setCurso("");
    setNota("");
    setTouchedNombre(false);
    setTouchedCurso(false);
    setTouchedNota(false);
    nombreRef.current?.focus();
  }

  // ── Helper: icono de estado de campo ────────────────────────────────────
  function fieldIcon(touched, valido) {
    if (!touched) return null;
    return valido
      ? <span aria-hidden="true">✅</span>
      : <span aria-hidden="true">❌</span>;
  }

  return (
    <section className="student-form">
      <h2>➕ Registrar Estudiante</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-row">

          {/* ── Campo Nombre ── */}
          <div className={`form-group${touchedNombre ? (nombreValido ? " has-success" : " has-error") : ""}`}>
            <div className="field-label-row">
              <label htmlFor="sf-nombre">Nombre</label>
              {fieldIcon(touchedNombre, nombreValido)}
            </div>
            <input
              id="sf-nombre"
              ref={nombreRef}
              type="text"
              value={nombre}
              onChange={handleNombreChange}
              onBlur={() => setTouchedNombre(true)}
              placeholder="Ej: María García"
              autoComplete="off"
            />
            {touchedNombre && nombre.trim() === "" && (
              <span className="field-error">El nombre es obligatorio</span>
            )}
            {touchedNombre &&
              nombre.trim() !== "" &&
              nombre.trim().split(/\s+/).filter(Boolean).length >= 5 &&
              nombre.endsWith(" ") && (
                <span className="field-error">Máximo 5 palabras</span>
              )}
          </div>

          {/* ── Campo Curso ── */}
          <div className={`form-group${touchedCurso ? (cursoValido ? " has-success" : " has-error") : ""}`}>
            <div className="field-label-row">
              <label htmlFor="sf-curso">Curso</label>
              {fieldIcon(touchedCurso, cursoValido)}
            </div>
            <select
              id="sf-curso"
              value={curso}
              onChange={handleCursoChange}
              onBlur={() => setTouchedCurso(true)}
            >
              <option value="" disabled>-- Selecciona un curso --</option>
              {CURSOS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {touchedCurso && curso === "" && (
              <span className="field-error">Debes seleccionar un curso</span>
            )}
          </div>

          {/* ── Campo Nota ── */}
          <div className={`form-group${touchedNota ? (notaValida ? " has-success" : " has-error") : ""}`}>
            <div className="field-label-row">
              <label htmlFor="sf-nota">Nota (0–20)</label>
              {fieldIcon(touchedNota, notaValida)}
            </div>
            <input
              id="sf-nota"
              type="number"
              min={0}
              max={20}
              step={0.1}
              value={nota}
              onChange={handleNotaChange}
              onBlur={() => setTouchedNota(true)}
              placeholder="Ej: 15.5"
            />
            {touchedNota && nota === "" && (
              <span className="field-error">La nota es obligatoria</span>
            )}
            {touchedNota &&
              nota !== "" &&
              (Number(nota) < 0 || Number(nota) > 20) && (
                <span className="field-error">La nota debe estar entre 0 y 20</span>
              )}
          </div>

        </div>

        {/* ── Botón submit ── */}
        <div style={{ marginTop: "16px" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!formValido}
          >
            ➕ Agregar Estudiante
          </button>
        </div>
      </form>
    </section>
  );
}
