import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // ESTA LÍNEA ES OBLIGATORIA PARA GITHUB PAGES
  base: "/facturacion-web/", 
})