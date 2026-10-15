# Student Management Dashboard — React Hooks Implementation (Pass 2)

This change delivers a university student grade dashboard built on top of a React hooks architecture. Every hook required by the practice spec is present and functional: `useReducer`, `useContext`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useLocalStorage`, and `useDebounce`. Both blocking issues flagged in the first review have been resolved — the dead `useRef`/`useEffect` on the readOnly input in `StudentList` was removed, and the dual theme-targeting decision was explicitly documented as intentional. No new issues were introduced.

**Watch for:** Nothing blocking remains. The `data-tema` attribute on `.dashboard` coexists with `body.dark`/`body.light` class targeting — the author has documented this as a forward-looking extension point with no current CSS rules targeting it, which is an acceptable trade-off.

**Verdict**: APPROVED

---

## High-level view

All eight required hooks are wired in and each plays a real role: the reducer owns student data and filter/sort state; `useLocalStorage` owns the persistence layer; `useDebounce` gates the search filter; `useMemo` computes stats and the filtered list; `useCallback` stabilizes the four dispatch wrappers; `useRef` handles auto-focus in the form (the correct, interactive input); `useTema`/`useContext` delivers theme globally with body-class side effects.

The dead-ref issue from the first review is fully resolved. `StudentList` now only uses `useMemo` and `useCallback` — the `inputRef` and its focus `useEffect` were removed. The comment at the top of the file documents the removal and the reasoning.

The hydration/sync pair remains safe: `useLocalStorage` initializes synchronously from localStorage, the HYDRATE effect fires once at mount with the correct captured value, and the write-back sync effect is a storage no-op on first render. The `eslint-disable` comment is correct and intentional.

The dual theme targeting (`body.dark` class via `ThemeContext` and `data-tema` attribute on `.dashboard`) is now documented in the code. The App.jsx comment clarifies that no CSS rules currently target `[data-tema]` and the attribute is retained as a future extension point. This is a deliberate, documented trade-off — not a latent inconsistency.

---

<details>
<summary>Issues (0)</summary>

No blocking or actionable concerns remain.

</details>

---

<details>
<summary>Details</summary>

### Dead ref — confirmed fixed

`StudentList` no longer declares `inputRef` or the `useEffect` that called `focus()` on a readOnly element. The hook inventory for `StudentList` is now `useMemo` (filtered+sorted list) and `useCallback` (stable `handleRemove`). The auto-focus `useRef`/`useEffect` pattern was moved to `StudentForm`, where it targets the `nombre` text input — an interactive field that correctly receives focus on mount and after each submission.

### Hydration / sync loop — unchanged, confirmed safe

The mount-only `useEffect` reads `savedStudents` captured at effect-creation time and dispatches `HYDRATE`. A second `useEffect` watching `state.items` calls `setSavedStudents` to write back to storage. No loop: `useLocalStorage` does not re-read from storage on subsequent renders (value lives in a `useState` slot initialized once via lazy initializer), and the HYDRATE effect's empty `[]` dependency array ensures it fires exactly once. The `eslint-disable-next-line react-hooks/exhaustive-deps` suppression on the HYDRATE effect is correct — adding `savedStudents` to the deps would cause the loop the suppression avoids. — **confirmed**

### Dual theme targeting — deliberate, documented

`ThemeContext` applies `dark`/`light` to `document.body.classList`; `App.jsx` sets `data-tema={tema}` on the root `.dashboard` div. The inline comment in App.jsx explicitly states: no CSS rules currently target `[data-tema]`, the attribute is informational and reserved for future selectors or debugging. The cleanup in `ThemeContext`'s `useEffect` removes both classes before the next run, so no stale classes accumulate on toggle. As long as the stylesheet continues to use only `body.dark`/`body.light` as the active selector family, no inconsistency arises. — **confirmed non-blocking**

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `src/App.jsx` | Dashboard root: useReducer + useLocalStorage + useDebounce + dispatch handlers; data-tema comment added |
| `src/hooks/useStudentsReducer.js` | Reducer: ADD_STUDENT, REMOVE_STUDENT, SET_FILTER, SET_SORT, HYDRATE |
| `src/hooks/useLocalStorage.js` | Custom hook: syncs React state to localStorage |
| `src/hooks/useDebounce.js` | Custom hook: debounces a value with setTimeout cleanup |
| `src/context/ThemeContext.jsx` | useLocalStorage replaces useState; useEffect applies body class with cleanup |
| `src/components/StudentForm.jsx` | Form: useRef auto-focus on interactive nombre input, local useState for fields |
| `src/components/StudentList.jsx` | Table: useMemo filtered+sorted list, useCallback handleRemove; dead ref removed |

</details>
