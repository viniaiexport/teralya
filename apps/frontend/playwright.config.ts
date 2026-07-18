import { defineConfig, devices } from "@playwright/test";

const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./test/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: isCi ? "github" : "list",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node test/e2e/mock-api.mjs",
      url: "http://127.0.0.1:3001/health",
      reuseExistingServer: !isCi,
      timeout: 30_000,
    },
    {
      command: isCi
        ? "npm run start -- --hostname 127.0.0.1"
        : "npm run dev -- --hostname 127.0.0.1",
      url: "http://127.0.0.1:3000",
      reuseExistingServer: !isCi,
      timeout: 120_000,
      env: {
        TERALYA_API_URL: "http://127.0.0.1:3001",
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3000",
      },
    },
  ],
});
