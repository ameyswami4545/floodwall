import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const crateRoot = path.resolve(__dirname, "..");

function rustFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return rustFiles(full);
    return entry.name.endsWith(".rs") ? [full] : [];
  });
}

/** Count `#[test]` functions plus doc-comment code blocks that rustdoc runs. */
function countTests(source: string): number {
  let tests = (source.match(/#\[test\]/g) ?? []).length;
  let inBlock = false;
  for (const line of source.split("\n")) {
    const fence = line.match(/^\s*\/\/[/!]\s*```(\S*)/);
    if (!fence) continue;
    if (!inBlock) {
      const lang = fence[1];
      // Untagged and `rust` blocks run; `text`, `ignore` and others do not.
      if (lang === "" || lang === "rust") tests += 1;
    }
    inBlock = !inBlock;
  }
  return tests;
}

/** Version, dependency count and test count, read from the crate at build time. */
function crateStats() {
  const cargo = fs.readFileSync(path.join(crateRoot, "Cargo.toml"), "utf8");
  const version = cargo.match(/^version\s*=\s*"(\d+)\.(\d+)\.\d+"/m);
  const depsSection = cargo.match(/^\[dependencies\]\s*$([\s\S]*?)(?=^\[|(?![\s\S]))/m);
  const dependencies = (depsSection?.[1] ?? "")
    .split("\n")
    .filter((line) => /^\s*[A-Za-z0-9_-]+\s*=/.test(line)).length;
  const tests = rustFiles(path.join(crateRoot, "src")).reduce(
    (sum, file) => sum + countTests(fs.readFileSync(file, "utf8")),
    0,
  );
  return {
    version: version ? `${version[1]}.${version[2]}` : "0.1",
    dependencies,
    tests,
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: "public",
  define: {
    __CRATE_STATS__: JSON.stringify(crateStats()),
  },
  build: {
    outDir: path.resolve(__dirname, "../docs"),
    emptyOutDir: true,
  },
});
