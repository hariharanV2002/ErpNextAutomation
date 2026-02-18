import { Page } from "@playwright/test";
import { selectors } from "../../selectors/selectors";
import { CommonPage } from "../common/commonPage";

export class LoginPage {
  private readonly common: CommonPage;

  constructor(private readonly page: Page) {
    this.common = new CommonPage(page);
  }

  async open(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  }

  async login(email: string, password: string): Promise<void> {
    await this.common.clearThenType(selectors.login.emailInput, email);
    await this.common.clearThenType(selectors.login.passwordInput, password);
    await this.common.click(selectors.login.submitButton);
    await this.page.waitForLoadState("networkidle");
  }
}
