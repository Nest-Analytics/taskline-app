import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const devPort = Number(process.env.VITE_PORT || 3000);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: devPort,
    proxy: {
      "/login": "http://localhost:5000",
      "/logout": "http://localhost:5000",
      "/api": "http://localhost:5000",
    },
  },
});
