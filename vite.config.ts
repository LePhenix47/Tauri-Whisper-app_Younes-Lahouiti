import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    tanstackRouter({
      routesDirectory: "./src/app/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
    }), // Must be before react()
    react(),
    tsconfigPaths(), // Automatically uses paths from tsconfig.json
  ],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["REACT_APP_", "VITE_", "TAURI_"],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
      },
    },
  },
  build: {
    target: ["es2021", "chrome100", "safari13"],
    minify: mode !== "development" ? "esbuild" : false,
    sourcemap: mode === "development",
  },
}));
