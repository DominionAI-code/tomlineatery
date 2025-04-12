import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    visualizer({
      open: true, // auto-opens report in browser
      gzipSize: true,
      brotliSize: true,
      filename: "stats.html",
    }),
  ],
  resolve: {
    alias: {
      // Add any aliases if needed
    },
  },
  build: {
    sourcemap: true, // Added for better debugging
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react")) return "react-vendor";
            if (id.includes("chart.js")) return "chart-vendor";
            return "vendor";
          }
        },
      },
    },
  },
});
