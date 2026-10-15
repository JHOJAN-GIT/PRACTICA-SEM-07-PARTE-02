// Custom Hook: useForm
// Encapsula estado, cambios y validación EN TIEMPO REAL de un formulario.
// Paso 5 de la práctica: composition over inheritance, reglas de Hooks.
//
// Regla cumplida: los Hooks se llaman en el nivel superior del hook,
// NUNCA dentro de loops, condiciones o funciones anidadas.

import { useState, useRef } from "react";

// ── Validadores individuales ────────────────────────────────────────────────
const VALIDADORES = {
  requerido: (valor) =>
    valor.trim() === "" ? "Este campo es obligatorio" : "",

  soloLetras: (valor) =>
    /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]+$/.test(valor.trim()) || valor.trim() === ""
      ? ""
      : "Solo se permiten letras y espacios",

  email: (valor) =>
    valor.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())
      ? ""
      : "Ingresa un correo válido (ej: usuario@dominio.com)",

  telefono: (valor) =>
    valor.trim() === "" || /^\d{9}$/.test(valor.trim())
      ? ""
      : "El teléfono debe tener exactamente 9 dígitos",
};

// ── Filtros de input (previenen caracteres no permitidos al escribir) ────────
export const FILTROS = {
  // Bloquea dígitos en campos de texto
  sinDigitos: (e) => {
    if (/[\d]/.test(e.key) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(e.key)) {
      e.preventDefault();
    }
  },
  // Solo dígitos (para teléfono)
  soloDigitos: (e) => {
    if (!/[\d]/.test(e.key) && !["Backspace","Delete","ArrowLeft","ArrowRight","Tab"].includes(e.key)) {
      e.preventDefault();
    }
  },
  // Bloquea negativos y letras en campos numéricos
  sinNegativos: (e) => {
    if (["-", "e", "+"].includes(e.key)) e.preventDefault();
  },
};

/**
 * @param {Object} camposIniciales   - { nombre: '', email: '', ... }
 * @param {Object} reglasValidacion  - { nombre: ['requerido', 'soloLetras'], ... }
 * @param {Object} [tocadosIniciales] - campos que ya fueron tocados
 */
export function useForm(camposIniciales, reglasValidacion = {}) {
  // useState — valores actuales del formulario
  const [valores, setValores] = useState(camposIniciales);
  // useState — errores por campo
  const [errores, setErrores] = useState({});
  // useState — rastrea qué campos ya tocó el usuario (para no mostrar error antes de interactuar)
  const [tocados, setTocados] = useState({});

  // useRef — referencia al primer campo con error para foco sin re-render
  const primerErrorRef = useRef(null);

  // ── Validar un solo campo ──────────────────────────────────────────────────
  function validarCampo(nombre, valor) {
    const reglas = reglasValidacion[nombre] ?? [];
    for (const regla of reglas) {
      const mensaje = VALIDADORES[regla]?.(valor ?? "");
      if (mensaje) return mensaje;
    }
    return "";
  }

  // ── handleChange: validación en tiempo real ────────────────────────────────
  function handleChange(e) {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));

    // Solo valida en tiempo real si el campo ya fue tocado
    if (tocados[name]) {
      const error = validarCampo(name, value);
      setErrores((prev) => ({ ...prev, [name]: error }));
    }
  }

  // ── handleBlur: marca el campo como tocado y valida al salir ──────────────
  function handleBlur(e) {
    const { name, value } = e.target;
    setTocados((prev) => ({ ...prev, [name]: true }));
    const error = validarCampo(name, value);
    setErrores((prev) => ({ ...prev, [name]: error }));
  }

  // ── validar: valida todos los campos (al submit) ───────────────────────────
  function validar() {
    const nuevosErrores = {};
    const todosTocados = {};

    for (const campo in reglasValidacion) {
      todosTocados[campo] = true;
      const error = validarCampo(campo, valores[campo] ?? "");
      if (error) nuevosErrores[campo] = error;
    }

    setTocados(todosTocados);
    setErrores(nuevosErrores);

    // Foco en el primer campo con error
    const primerCampoConError = Object.keys(nuevosErrores)[0];
    if (primerCampoConError && primerErrorRef.current) {
      primerErrorRef.current.focus();
    }

    return Object.keys(nuevosErrores).length === 0;
  }

  function reset() {
    setValores(camposIniciales);
    setErrores({});
    setTocados({});
  }

  // Determina el estado visual de un campo
  function estadoCampo(nombre) {
    if (!tocados[nombre]) return "neutro";
    if (errores[nombre]) return "error";
    if (valores[nombre]?.trim()) return "valido";
    return "neutro";
  }

  return {
    valores,
    errores,
    tocados,
    handleChange,
    handleBlur,
    validar,
    reset,
    primerErrorRef,
    estadoCampo,
  };
}
