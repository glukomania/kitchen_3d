import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

// Widget/library build:
// - outputs an IIFE bundle that defines a Custom Element via `defineConfiguratorElement()`
// - keeps it simple for "drop-in" usage
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  build: {
    lib: {
      entry: "src/widget/entry.ts",
      name: "SkoumalConfigurator",
      formats: ["iife"],
      fileName: () => "configurator-widget.iife.js"
    },
    sourcemap: true,
    cssCodeSplit: false
  }
});


