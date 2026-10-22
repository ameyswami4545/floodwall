import { copyFileSync } from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { readCrateStats } from "./crate-stats.mjs";

const outDir = path.resolve(__dirname, "../docs");

// GitHub Pages has no SPA fallback: a direct visit to /app/intents finds no
// file and serves 404.html. Making that the app lets the router take over.
const spaFallback: Plugin = {
  name: "spa-fallback",
  apply: "build",
  closeBundle() {
    copyFileSync(path.join(outDir, "index.html"), path.join(outDir, "404.html"));
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), spaFallback],
  publicDir: "public",
  define: {
    // Throws, failing the build, if Cargo.toml cannot be parsed.
    __CRATE_STATS__: JSON.stringify(readCrateStats(path.resolve(__dirname, ".."))),
  },
  build: {
    outDir,
    emptyOutDir: true,
  },
});
