import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The console: its own page at floodwall.ai/console/, kept out of the landing
// page's bundle. `npm run build` runs it after the landing build, which
// empties docs/, so it writes only docs/console/.
export default defineConfig({
  root: path.resolve(__dirname, "console"),
  base: "/console/",
  plugins: [react(), tailwindcss()],
  // The page lives in console/, its code in src/: "/src/..." means site/src,
  // as it does for the landing page, in dev as well as in the build.
  resolve: { alias: { "/src": path.resolve(__dirname, "src") } },
  // public/ (CNAME, robots.txt, the video) ships once, with the landing page.
  publicDir: false,
  build: {
    outDir: path.resolve(__dirname, "../docs/console"),
    emptyOutDir: true,
  },
});
