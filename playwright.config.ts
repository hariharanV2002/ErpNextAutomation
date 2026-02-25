import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  globalSetup: "./auth/global.setup.ts",
  testDir: "./specs",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: {
    timeout: 15_000
  },
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: process.env.BASE_URL,
    storageState: "./playwright/.auth/user.json",
    headless: process.env.PW_HEADLESS === "true",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: null,
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    launchOptions: {
      slowMo: 120,
      args: [
        "--start-maximized",
        "--force-device-scale-factor=1",
        "--high-dpi-support=1"
      ]
    }
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" }
    }
  ]
});
