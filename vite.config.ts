import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["walker-partner-demo.onrender.com"],
  },
  preview: {
    allowedHosts: ["walker-partner-demo.onrender.com"],
  },
  build: {
    rollupOptions: {
      input: {
        landing: "index.html",
        demo: "demo/index.html",
      },
    },
  },
});
