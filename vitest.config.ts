import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["src/test/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
    coverage: {
      provider: "v8",
      include: ["src/server/**", "src/lib/**"],
      exclude: ["src/lib/meilisearch.ts", "src/lib/redis.ts", "src/lib/rate-limit.ts"],
    },
  },
});
