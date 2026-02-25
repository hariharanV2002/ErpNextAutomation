import { chromium, FullConfig } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";
import { LoginPage } from "../pages/auth/loginPage";
import { selectors } from "../selectors/selectors";

dotenv.config();

async function globalSetup(_config: FullConfig): Promise<void> {
  const baseUrl = process.env.BASE_URL;
  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASSWORD;
  const authPath = path.resolve("playwright/.auth/user.json");

  if (!baseUrl || !email || !password) {
    throw new Error("Missing BASE_URL, USER_EMAIL or USER_PASSWORD in .env");
  }

  const browser = await chromium.launch({
    headless: process.env.PW_HEADLESS === "true",
    slowMo: process.env.PW_HEADLESS === "true" ? 0 : 80,
    args: ["--start-maximized", "--force-device-scale-factor=1", "--high-dpi-support=1"]
  });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.open(baseUrl);
  await loginPage.login(email, password);
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  const loginButtonVisible = await page.locator(selectors.login.submitButton.join(", ")).first().isVisible().catch(() => false);
  if (currentUrl.toLowerCase().includes("/login") || loginButtonVisible) {
    await browser.close();
    throw new Error("Global setup login failed. Verify USER_EMAIL / USER_PASSWORD in .env.");
  }

  await context.storageState({ path: authPath });
  await browser.close();
}

export default globalSetup;
