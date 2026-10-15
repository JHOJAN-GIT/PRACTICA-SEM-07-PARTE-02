// useContext + useReducer + useMemo — estado global del carrito e historial.
// useReducer maneja las acciones complejas; useMemo evita recalcular
// total y cantidadTotal en cada render cuando items no cambia.

import { createContext, useContext, useReducer, useState, useMemo } from "react";
import { carritoReducer, ACCIONES } from "../reducers/carritoReducer";

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  // useReducer — acciones del carrito
  const [items, dispatch] = useReducer(carritoReducer, []);

  // useState — historial de órdenes completadas
  const [historial, setHistorial] = useState([]);

  // useMemo — total y cantidadTotal solo se recalculan cuando items cambia
  const total = useMemo(
    () => items.reduce((acc, item) => acc + item.precio * item.cantidad, 0),
    [items]
  );

  const cantidadTotal = useMemo(
    () => items.reduce((acc, item) => acc + item.cantidad, 0),
    [items]
  );

  /**
   * Registra una orden en el historial antes de vaciar el carrito.
   * @param {Object} datosEnvio - valores del formulario de checkout
   */
  function registrarOrden(datosEnvio) {
    const orden = {
      id: `ORD-${Date.now()}`,
      fecha: new Date().toISOString(),
      items: items.map((i) => ({ ...i })),   // snapshot inmutable
      total,
      cantidadTotal,
      envio: { ...datosEnvio },
    };
    setHistorial((prev) => [orden, ...prev]);
    dispatch({ type: ACCIONES.VACIAR });
  }

  return (
    <CarritoContext.Provider
      value={{ items, dispatch, total, cantidadTotal, ACCIONES, historial, registrarOrden }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export function useCarrito() {
  const ctx = useContext(CarritoContext);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
