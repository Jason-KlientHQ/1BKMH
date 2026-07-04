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
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    // Split heavy deps into their own chunks so no single chunk is huge — this
    // lowers peak memory during minify (the phase that was likely getting the
    // build OOM-killed on the CI container) and improves browser caching.
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return;
          if (
            id.includes("@react-three") ||
            /[\\/]three[\\/]/.test(id) ||
            id.includes("three-mesh-bvh") ||
            id.includes("three-stdlib")
          )
            return "three";
          if (
            id.includes("react-dom") ||
            id.includes("react-router") ||
            id.includes("/scheduler/") ||
            /[\\/]react[\\/]/.test(id)
          )
            return "react-vendor";
          if (id.includes("@radix-ui") || id.includes("lucide-react")) return "ui-vendor";
          return "vendor";
        },
      },
    },
  },
}));
