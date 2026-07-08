import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    // Isolate ONLY three.js (big, and React-free) into its own chunk to reduce
    // peak build memory + improve caching. Do NOT manually split React or any
    // React-dependent lib — forcing React into its own chunk breaks module init
    // order (a lib calls React.createContext before React initialises → crash).
    // Everything React-related is left to Rollup's default, correctly-ordered chunking.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Only split the React-free three.js tree. Splitting @react-three, scene,
          // or mission UI into separate chunks duplicated React in production and
          // crashed the app on load (__SECRET_INTERNALS undefined).
          if (/[\\/]node_modules[\\/](three|three-mesh-bvh|three-stdlib)[\\/]/.test(id)) {
            return "three";
          }
        },
      },
    },
  },
}));
