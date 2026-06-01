import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // react-draggable (via react-grid-layout) reads process.env.DRAGGABLE_DEBUG at
  // drag start, which throws in the browser where process is undefined. Replace it
  // statically for both the dev pre-bundle and the production build.
  define: {
    "process.env.DRAGGABLE_DEBUG": "false",
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
