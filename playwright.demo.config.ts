import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const baseURL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/demo-record.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  outputDir: "demos/video-raw",
  use: {
    baseURL,
    video: "on",
    screenshot: "on",
    trace: "off",
  },
  webServer: {
    command: "npm run start",
    url: `${baseURL}/api/health`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
