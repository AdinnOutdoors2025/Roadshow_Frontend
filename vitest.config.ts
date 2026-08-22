import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

// Vitest owns unit/functional/regex/API-shaped tests: **/*.test.ts(x) / *.spec.ts(x)
// under tests/module-qa/** (excluding *.e2e.spec.ts, which Playwright owns — see
// playwright.config.ts). Keep this split when generating new module-qa tests.
export default defineConfig({
  // svgr mirrors the @svgr/webpack rule in next.config.ts so `import Icon from
  // "./foo.svg"` resolves the same way under Vitest as it does in the app.
  plugins: [react(), svgr()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/**/*.e2e.spec.{ts,tsx}", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
