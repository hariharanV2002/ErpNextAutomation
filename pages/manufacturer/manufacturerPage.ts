import { expect, Page } from "@playwright/test";
import { selectors } from "../../selectors/selectors";
import { ManufacturerPayload } from "../../utils/types";
import { CommonPage } from "../common/commonPage";

export class ManufacturerPage {
  constructor(
    private readonly page: Page,
    private readonly common: CommonPage
  ) {}

  async openList(route: string): Promise<void> {
    await this.page.goto(route, { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle");
  }

  async openAddForm(): Promise<void> {
    await this.common.click(selectors.manufacturerList.addManufacturerButton);
    const input = await this.common.get(selectors.manufacturerForm.shortNameInput);
    await expect(input).toBeVisible();
  }

  async clickSave(): Promise<void> {
    const button = await this.common.get(selectors.manufacturerForm.saveButton);
    await button.click({ force: true });
    await this.page.waitForTimeout(1200);
    const stillNew = this.page.url().includes("/new-manufacturer");
    if (stillNew) {
      await button.click({ force: true });
    }
  }

  async fillForm(payload: ManufacturerPayload): Promise<void> {
    await this.common.clearThenType(selectors.manufacturerForm.shortNameInput, payload.shortName);
    await this.common.clearThenType(selectors.manufacturerForm.fullNameInput, payload.fullName);
    await this.common.clearThenType(selectors.manufacturerForm.websiteInput, payload.website);
  }

  async fillWithoutShortName(payload: Omit<ManufacturerPayload, "shortName">): Promise<void> {
    await this.common.clearThenType(selectors.manufacturerForm.shortNameInput, "");
    await this.common.clearThenType(selectors.manufacturerForm.fullNameInput, payload.fullName);
    await this.common.clearThenType(selectors.manufacturerForm.websiteInput, payload.website);
  }

  async searchByShortName(shortName: string): Promise<void> {
    await this.clearFiltersIfVisible();
    await this.common.clearThenType(selectors.manufacturerList.searchShortNameInput, `%${shortName}%`);
    await this.page.keyboard.press("Enter");
    await this.page.waitForLoadState("networkidle");
  }

  private async clearFiltersIfVisible(): Promise<void> {
    const clear = this.page.locator(selectors.itemList.clearFiltersButton.join(", ")).first();
    if (await clear.isVisible().catch(() => false)) {
      await clear.click({ force: true });
      await this.page.waitForLoadState("networkidle");
    }
  }
}
