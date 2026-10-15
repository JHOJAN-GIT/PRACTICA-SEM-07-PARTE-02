// useReducer — centraliza toda la lógica de mutación del carrito.
// Separar el reducer del contexto hace cada acción testeable de forma aislada.

export const ACCIONES = {
  AGREGAR: "AGREGAR",
  AUMENTAR: "AUMENTAR",
  DISMINUIR: "DISMINUIR",
  QUITAR: "QUITAR",
  VACIAR: "VACIAR",
};

/**
 * @param {Array} state  - lista actual de ítems { ...producto, cantidad }
 * @param {{ type: string, payload: any }} action
 */
export function carritoReducer(state, action) {
  switch (action.type) {
    case ACCIONES.AGREGAR: {
      const existe = state.find((item) => item.id === action.payload.id);
      if (existe) {
        // Si ya está en el carrito solo aumenta la cantidad
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      // Producto nuevo → lo añade con cantidad 1
      return [...state, { ...action.payload, cantidad: 1 }];
    }

    case ACCIONES.AUMENTAR:
      return state.map((item) =>
        item.id === action.payload
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      );

    case ACCIONES.DISMINUIR:
      return state
        .map((item) =>
          item.id === action.payload
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        // Si llega a 0 se elimina automáticamente
        .filter((item) => item.cantidad > 0);

    case ACCIONES.QUITAR:
      return state.filter((item) => item.id !== action.payload);

    case ACCIONES.VACIAR:
      return [];

    default:
      return state;
  }
}
