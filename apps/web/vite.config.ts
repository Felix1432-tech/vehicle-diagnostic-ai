import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/vehicle": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
