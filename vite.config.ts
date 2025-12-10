import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "/",  // VERY IMPORTANT — Without this photos/music gives 404

  build: {
    outDir: "dist",
    emptyOutDir: true
  },

  define: {
    "process.env": {}
  }
});
