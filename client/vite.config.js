import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    minify: false
  },
  server: {
    port: 8081,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  }
});
