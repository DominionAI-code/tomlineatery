import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      // Add explicit React configuration
      jsxRuntime: "automatic",
      jsxImportSource: "react",
      babel: {
        plugins: [],
        babelrc: false,
        configFile: false,
      },
    }),
    visualizer({
      open: true, // auto-opens report in browser
      gzipSize: true,
      brotliSize: true,
      filename: "stats.html",
    }),
  ],
  resolve: {
    alias: {
      react: "react",
      "react-dom": "react-dom",
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    rollupOptions: {
      output: {
        format: "es", // Ensure ES modules format
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("chart.js")) return "chart-vendor";
            return "vendor";
          }
        },
      },
    },
    sourcemap: true,
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
    force: true,
  },
});