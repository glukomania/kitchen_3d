import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// Widget/library build:
// - outputs an IIFE bundle that defines a Custom Element via `defineConfiguratorElement()`
// - keeps it simple for "drop-in" usage
export default defineConfig({
  base: "/kitchen_3d/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: "src/widget/entry.ts",
      name: "SkoumalConfigurator",
      formats: ["iife"],
      fileName: () => "configurator-widget.iife.js"
    },
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // CSS file will have a fixed name for easier inclusion
          if (assetInfo.name === 'style.css') {
            return 'configurator-widget.css';
          }
          return assetInfo.name || 'asset';
        }
      }
    }
  }
});


