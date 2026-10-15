import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base es obligatorio para GitHub Pages: la URL es /<repo-name>/
  base: '/PRACTICA-SEM-07-PARTE-02/',
})
