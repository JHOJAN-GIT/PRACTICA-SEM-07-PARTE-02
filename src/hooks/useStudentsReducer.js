// Reducer para la gestión de estudiantes.
// Centraliza toda la lógica de estado: agregar, eliminar, filtrar y ordenar.
// useReducer es preferible a múltiples useState cuando las acciones son interdependientes.

/** @type {{ items: Array, filter: string, sort: string }} */
export const initialState = {
  items: [],
  filter: "todos",
  sort: "nombre-asc",
};

/**
 * @param {typeof initialState} state
 * @param {{ type: string, payload?: any }} action
 */
export default function studentsReducer(state, action) {
  switch (action.type) {
    case "ADD_STUDENT":
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: Date.now(),
            nombre: action.payload.nombre,
            curso: action.payload.curso,
            nota: Number(action.payload.nota),
            estado: Number(action.payload.nota) >= 11 ? "aprobado" : "reprobado",
          },
        ],
      };

    case "REMOVE_STUDENT":
      return {
        ...state,
        items: state.items.filter((s) => s.id !== action.payload),
      };

    case "SET_FILTER":
      return { ...state, filter: action.payload };

    case "SET_SORT":
      return { ...state, sort: action.payload };

    case "HYDRATE":
      // Carga masiva desde localStorage al montar la app
      return { ...state, items: action.payload };

    default:
      return state;
  }
}
