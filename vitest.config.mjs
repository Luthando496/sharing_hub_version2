import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import fs from "node:fs";

// Windows ignores letter case in folder names, so the same project can be
// opened as ".../music/..." or ".../Music/...". Vite would then treat the two
// spellings as different folders and load React twice, which breaks hooks
// ("Invalid hook call"). Always use the folder's true spelling.
const root = fs.realpathSync.native(import.meta.dirname);

export default defineConfig({
  root,
  plugins: [react()],
  resolve: {
    // same "@/..." shortcut the app uses (see jsconfig.json)
    alias: { "@": root },
    // never load a second copy of React
    dedupe: ["react", "react-dom"],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.js"],
    include: ["tests/**/*.test.{js,jsx}"],
  },
});
