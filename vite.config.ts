import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["REACT_APP_", "VITE_", "TAURI_"],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler", // Use modern SASS API (silences deprecation warning)
      },
    },
  },
  build: {
    target: ["es2021", "chrome100", "safari13"],
    minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  // TODO: How to add import aliases in Vite ?
  resolve: {
    alias: {
      "@public": path.resolve(__dirname, "public"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@sass": path.resolve(__dirname, "src/sass"),
      "@env": path.resolve(__dirname, "./src/env"),
    },
    extensions: [".ts", ".js"],
  },
});
