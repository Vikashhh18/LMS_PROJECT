import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    allowedHosts: ['lms-vdemy.onrender.com', 'localhost', '127.0.0.1'],
  },
})

// vite.config.js
// export default {
// };

// export default defineConfig({
//   plugins: [
    
//   ],
// })