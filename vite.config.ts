import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
          if (/[\\/]node_modules[\\/](three|three-mesh-bvh|three-stdlib)[\\/]/.test(id)) {
            return "three";
          }
          if (/[\\/]node_modules[\\/](@react-three)[\\/]/.test(id)) {
            return "r3f";
          }
          if (id.includes("/src/components/SolarSystem") || id.includes("/src/components/MissionFlight")) {
            return "scene";
          }
          if (id.includes("/src/components/MissionPlanner") || id.includes("/src/components/RouteHUD")) {
            return "mission-ui";
          }
          if (id.includes("/src/components/TechnicalReadme")) {
            return "readme";
          }
        },
      },
    },
  },
}));
