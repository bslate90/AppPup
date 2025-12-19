import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,      // Strictly enforce port 3001
    strictPort: true, // If 3001 is taken, fail rather than switching ports
    host: true       // Expose to network (optional, checks local IP)
  }
})