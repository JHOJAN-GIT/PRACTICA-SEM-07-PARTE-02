# Dashboard de Gestión de Estudiantes — Práctica Semana 07 Parte 2

Aplicación web desarrollada como práctica académica para la Universidad Nacional del Centro del Perú (UNCP). Implementa un gestor de estudiantes con registro, filtrado, ordenación y persistencia de datos, usando **React 19 + Vite** y aplicando correctamente los Hooks de React.

---

## Cómo ejecutar

> `node_modules` ya está instalado. No es necesario correr `npm install`.

```bash
npm run dev
```

La app quedará disponible en `http://localhost:5173`.

---

## Hooks utilizados y justificación técnica

| Hook | Dónde se usa | Qué hace en el proyecto | Por qué no alcanza con una alternativa más simple |
|---|---|---|---|
| `useReducer` | `App.jsx` | Gestiona `items`, `filter` y `sort` de estudiantes con acciones tipadas (`ADD_STUDENT`, `REMOVE_STUDENT`, `SET_FILTER`, `SET_SORT`, `HYDRATE`) | Con `useState` independientes habría que sincronizar manualmente 3 variables y el estado de cada acción podría quedar inconsistente |
| `useContext` | `App.jsx`, `ThemeContext.jsx` | Consume el tema global (`light`/`dark`) sin prop drilling | Pasar `tema` y `toggleTema` como props desde `main.jsx` obligaría a atravesar componentes intermedios que no los necesitan |
| `useEffect` (hidratación) | `App.jsx` | Al montar, carga los datos guardados en localStorage al reducer con `HYDRATE` | Sin este efecto los datos se pierden al recargar la página |
| `useEffect` (sincronización) | `App.jsx` | Cada vez que `state.items` cambia, lo persiste en localStorage vía `setSavedStudents` | Sin él, el estado del reducer nunca llega a persistirse |
| `useEffect` (tema en body) | `ThemeContext.jsx` | Aplica/quita la clase `dark`/`light` en `document.body` para activar las CSS custom properties | El cambio de clase afecta al DOM fuera del árbol de React; solo `useEffect` permite este tipo de side-effect de forma segura con cleanup |
| `useEffect` (foco automático) | `StudentForm.jsx`, `StudentList.jsx` | Enfoca el input correcto al montar el formulario y al cambiar la longitud de la lista | `autoFocus` HTML no es suficiente cuando el foco debe reponerse dinámicamente después de añadir/eliminar |
| `useMemo` (stats) | `App.jsx` | Calcula total, aprobados, reprobados y promedio solo cuando `state.items` cambia | Sin memoizar, estas operaciones se recalcularían en cada render aunque la lista no haya cambiado |
| `useMemo` (filteredStudents) | `App.jsx` | Filtra la lista por el término debounceado | Filtrar en cada render con búsquedas largas penaliza el rendimiento innecesariamente |
| `useMemo` (processedStudents) | `StudentList.jsx` | Filtra y ordena la lista dentro del componente de tabla | Evita reordenar el array en cada render cuando solo cambia otro estado del padre |
| `useCallback` | `App.jsx`, `StudentList.jsx` | Estabiliza `handleAdd`, `handleRemove`, `handleSetFilter`, `handleSetSort` | Sin `useCallback`, cada render crearía nuevas referencias, rompiendo la memoización de los componentes hijos y los arrays de dependencias de sus propios hooks |
| `useRef` | `StudentForm.jsx`, `StudentList.jsx` | Referencia directa a inputs para foco programático sin re-render | Un estado `useState` para controlar el foco causaría un render extra innecesario |
| `useState` | `App.jsx`, `StudentForm.jsx` | `searchTerm` local del input; campos del formulario | Son valores simples y locales que no afectan a otros componentes |
| **`useLocalStorage`** (custom) | `App.jsx`, `ThemeContext.jsx` | Inicializa estado desde `localStorage` y lo persiste en cada cambio | `useState` puro no persiste entre sesiones; duplicar la lógica de serialización/deserialización en cada componente violaría DRY |
| **`useDebounce`** (custom) | `App.jsx` | Retrasa la aplicación del filtro de búsqueda 400 ms | Sin debounce, cada pulsación de tecla dispararía un nuevo cálculo de `filteredStudents` y potencialmente un nuevo render del componente tabla |

---

## Diagrama de flujo de estado

### Flujo principal — Gestión de estudiantes

```
Usuario interactúa (agrega / elimina / filtra / ordena)
        │
        ▼
   dispatch({ type, payload })
        │
        ▼
  studentsReducer(state, action)
  ┌─────────────────────────────────┐
  │ ADD_STUDENT  → items.push(...)  │
  │ REMOVE_STUDENT → items.filter() │
  │ SET_FILTER   → state.filter     │
  │ SET_SORT     → state.sort       │
  │ HYDRATE      → items = payload  │
  └─────────────────────────────────┘
        │
        ▼
   state.items (nuevo array)
        │
        ├──► useMemo(stats)        → tarjetas de estadísticas
        │
        ├──► useMemo(filteredStudents + debouncedSearch)
        │           │
        │           ▼
        │      <StudentList />  (renderiza tabla)
        │
        └──► useEffect([state.items])
                    │
                    ▼
              setSavedStudents(state.items)
                    │
                    ▼
              useLocalStorage → localStorage.setItem("students-data", ...)
```

### Flujo — Hidratación al montar

```
App monta (mount)
     │
     ▼
useEffect([], [])  ← solo una vez
     │
     ▼
lee savedStudents (ya cargado por useLocalStorage en useState inicial)
     │
     ▼
dispatch({ type: 'HYDRATE', payload: savedStudents })
     │
     ▼
state.items = savedStudents  → tabla se puebla con datos previos
```

### Flujo — ThemeContext

```
Usuario pulsa "Modo Oscuro / Claro"
        │
        ▼
   toggleTema()
        │
        ▼
   setTema('dark' | 'light')   ← useLocalStorage
        │
        ├──► localStorage.setItem("theme", ...)   (persist)
        │
        └──► useEffect([tema])
                  │
                  ▼
             document.body.classList → 'dark' | 'light'
                  │
                  ▼
             CSS custom properties (--bg-primary, etc.) se activan
                  │
                  ▼
             Toda la UI cambia de tema sin re-render de componentes
```

---

## Estructura del proyecto

```
src/
├── main.jsx                    ← Punto de entrada, monta ThemeProvider
├── App.jsx                     ← Orquestador del dashboard (todas las vistas SPA)
├── App.css                     ← Sistema de diseño completo (light/dark, navbar, footer)
├── index.css                   ← Reset base
│
├── context/
│   └── ThemeContext.jsx        ← createContext + useLocalStorage + useEffect(body class)
│
├── hooks/
│   ├── useLocalStorage.js      ← Custom hook: sincroniza estado con localStorage
│   ├── useDebounce.js          ← Custom hook: retrasa valor N milisegundos con cleanup
│   ├── useStudentsReducer.js   ← Reducer + initialState: ADD, REMOVE, FILTER, SORT, HYDRATE
│   ├── useFetch.js             ← Custom hook: fetch con AbortController y cleanup
│   └── useForm.js              ← Custom hook: formularios con validación genérica
│
└── components/
    ├── Navbar.jsx              ← Navegación SPA sticky (vistaActual, setVistaActual)
    ├── PageHeader.jsx          ← Cabecera de página con título, subtítulo y badges UNCP
    ├── StudentForm.jsx         ← Formulario (useRef auto-focus, validación tiempo real)
    ├── StudentList.jsx         ← Tabla (useMemo, useCallback, spinner búsqueda, empty states)
    └── Footer.jsx              ← Pie de página con hooks usados e info académica
```

---

## Vistas de la aplicación

| Vista | Ruta SPA | Contenido |
|---|---|---|
| **Registrar** | `vistaActual === "registro"` | Hero con SVG + formulario con validación en tiempo real |
| **Lista** | `vistaActual === "lista"` | Buscador con debounce + spinner + filtros + tabla de estudiantes |
| **Estadísticas** | `vistaActual === "estadisticas"` | Cards resumen + tabla por curso + gráfico de barras CSS |

---

## Autores

| Nombre | Código | Curso |
|---|---|---|
| [Nombre del estudiante] | [Código UNCP] | Desarrollo de Aplicaciones Web |
