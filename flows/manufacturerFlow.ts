import { expect, Page } from "@playwright/test";
import { ManufacturerPage } from "../pages/manufacturer/manufacturerPage";
import { CommonPage } from "../pages/common/commonPage";
import { selectors } from "../selectors/selectors";
import { ManufacturerPayload } from "../utils/types";

export class ManufacturerFlow {
  constructor(
    private readonly page: Page,
    private readonly common: CommonPage,
    private readonly manufacturerPage: ManufacturerPage
  ) {}

  async openNewFromList(route: string): Promise<void> {
    await this.manufacturerPage.openList(route);
    await this.manufacturerPage.openAddForm();
  }

  async verifyShortNameMandatory(payload: Omit<ManufacturerPayload, "shortName">, expectedField: string): Promise<void> {
    await this.manufacturerPage.fillWithoutShortName(payload);
    await this.manufacturerPage.clickSave();
    await this.common.expectDialogContains(expectedField);
    await this.common.closeDialogIfVisible();
  }

  async create(payload: ManufacturerPayload, expectedSavedText: string): Promise<void> {
    await this.manufacturerPage.fillForm(payload);
    await this.manufacturerPage.clickSave();
    const saveText = this.page.locator(selectors.templates.visibleTextLocator(expectedSavedText)).first();
    if (await saveText.isVisible().catch(() => false)) {
      await expect(saveText).toBeVisible();
      return;
    }
    await expect(async () => {
      const url = this.page.url();
      expect(url.includes("/app/manufacturer/")).toBeTruthy();
      expect(url.includes("/new-manufacturer")).toBeFalsy();
    }).toPass({ timeout: 15000 });
  }

  async verifyInList(payload: ManufacturerPayload, route: string): Promise<void> {
    await this.manufacturerPage.openList(route);
    await this.manufacturerPage.searchByShortName(payload.shortName);
    await this.common.expectRowVisibleByCellValue(payload.shortName);
  }
}
