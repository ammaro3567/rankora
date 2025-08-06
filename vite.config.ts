import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  
  // Build optimizations
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
  
  // Development server
  server: {
    port: 5173,
    open: true,
    cors: true,
  },
  
  // Preview server
  preview: {
    port: 4173,
    open: true,
  },
  
  // Dependency optimization
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom'],
  },
  
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
});
