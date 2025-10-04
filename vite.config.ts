import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Enhanced Vite configuration following 2025 best practices
// https://vite.dev/config/
export default defineConfig({
  // Use the standard React plugin for better compatibility
  plugins: [
    react({
      // Automatically include JSX runtime for better performance
      jsxRuntime: 'automatic',
    }),
  ],

  // Development server configuration
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Enable hot module replacement
    hmr: true,
    // Open browser automatically in development
    open: false,
    // CORS configuration for API requests
    cors: true,
    // Proxy configuration for API routes (if needed)
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // Preview server configuration (for production build testing)
  preview: {
    port: 4173,
    host: '0.0.0.0',
  },

  // Path resolution configuration
  resolve: {
    alias: {
      // Modern path aliasing for cleaner imports
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@lib': resolve(__dirname, './src/lib'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@services': resolve(__dirname, './src/services'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },

  // ESBuild configuration for TypeScript and JSX
  esbuild: {
    // Suppress ESM warnings in development
    logOverride: {
      'this-is-undefined-in-esm': 'silent',
      'direct-eval': 'silent'
    },
    // Enable JSX in .ts files
    jsx: 'automatic',
    // Target modern browsers for better performance
    target: 'esnext',
    // Remove console logs and debugger in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },

  // Dependency optimization
  optimizeDeps: {
    // Include commonly used dependencies for faster cold starts
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
    // Exclude large dependencies that benefit from lazy loading
    exclude: [
      '@supabase/supabase-js',
    ],
    // Force optimization of specific dependencies
    force: true,
  },

  // Build configuration
  build: {
    // Output directory
    outDir: 'dist',
    // Generate source maps for debugging
    sourcemap: process.env.NODE_ENV === 'development',
    // Target modern browsers for smaller bundle sizes
    target: 'esnext',
    // Minify for production
    minify: 'esbuild',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Rollup-specific options
    rollupOptions: {
      // Optimize bundle splitting
      output: {
        manualChunks: {
          // Separate vendor libraries for better caching
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
        // Clean chunk names for debugging
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Asset handling
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    // Report compressed size (disable for faster builds)
    reportCompressedSize: true,
  },

  // CSS configuration
  css: {
    // CSS modules configuration
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    // PostCSS configuration (works with Tailwind)
    postcss: './postcss.config.js',
    // Development source maps
    devSourcemap: true,
  },

  // Define global variables
  define: {
    // Ensure compatibility with various environments
    global: 'globalThis',
    // Define build-time constants
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // Environment variables configuration
  envPrefix: ['VITE_', 'SUPABASE_'],
  envDir: './',

  // Worker configuration
  worker: {
    format: 'es',
  },

  // JSON configuration
  json: {
    namedExports: true,
    stringify: false,
  },

  // Log level for cleaner output
  logLevel: 'info',
})
