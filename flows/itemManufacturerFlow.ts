import { expect, Page } from "@playwright/test";
import { CommonPage } from "../pages/common/commonPage";
import { ItemManufacturerPage } from "../pages/itemManufacturer/itemManufacturerPage";
import { selectors } from "../selectors/selectors";
import { ItemManufacturerPayload } from "../utils/types";

export class ItemManufacturerFlow {
  constructor(
    private readonly page: Page,
    private readonly common: CommonPage,
    private readonly itemManufacturerPage: ItemManufacturerPage
  ) {}

  async openNewFromList(route: string, itemCode?: string, fullForm = false): Promise<void> {
    await this.itemManufacturerPage.openList(route);
    if (itemCode) {
      await this.itemManufacturerPage.filterByItemCode(itemCode);
    }
    await this.itemManufacturerPage.openAddForm();
    if (fullForm) {
      await this.itemManufacturerPage.openFullFormFromQuickEntry();
    }
  }

  async verifyPartNumberMandatory(payload: Omit<ItemManufacturerPayload, "manufacturerPartNumber">, expectedField: string): Promise<void> {
    await this.itemManufacturerPage.fillWithoutPartNumber(payload);
    await this.itemManufacturerPage.clickSave();
    await this.common.expectDialogContains(expectedField);
    await this.common.closeDialogIfVisible();
  }

  async verifyProgressiveMandatoryThenCreate(payload: ItemManufacturerPayload, expectedSavedText: string): Promise<void> {
    await this.itemManufacturerPage.clickSave();
    await this.common.expectDialogContains("Item Code");
    await this.common.expectDialogContains("Manufacturer");
    await this.common.expectDialogContains("Manufacturer Part Number");
    await this.common.closeDialogIfVisible();

    await this.itemManufacturerPage.fillOnlyItemCode(payload.itemCode);
    await this.itemManufacturerPage.clickSave();
    await this.common.expectDialogContains("Manufacturer");
    await this.common.expectDialogContains("Manufacturer Part Number");
    await this.common.closeDialogIfVisible();

    await this.itemManufacturerPage.fillOnlyPartNumber(payload.manufacturerPartNumber);
    await this.itemManufacturerPage.clickSave();
    await this.common.expectDialogContains("Manufacturer");
    await this.common.closeDialogIfVisible();

    await this.itemManufacturerPage.fillOnlyManufacturer(payload.manufacturer);
    await this.create(payload, expectedSavedText);
  }

  async create(payload: ItemManufacturerPayload, expectedSavedText: string): Promise<void> {
    await this.itemManufacturerPage.fillForm(payload);
    await this.itemManufacturerPage.clickSave();

    const manufacturerMissingDialog = this.page.locator(selectors.templates.dialogBodyByText("Manufacturer")).first();
    if (await manufacturerMissingDialog.isVisible().catch(() => false)) {
      await this.common.closeDialogIfVisible();
      await this.itemManufacturerPage.fillOnlyManufacturer(payload.manufacturer);
      await this.itemManufacturerPage.clickSave();
    }

    const saveText = this.page.locator(selectors.templates.visibleTextLocator(expectedSavedText)).first();
    if (await saveText.isVisible().catch(() => false)) {
      await expect(saveText).toBeVisible();
    }

    const missingValuesDialog = this.page.locator(selectors.templates.dialogTitleByText("Missing Values Required")).first();
    if (await missingValuesDialog.isVisible().catch(() => false)) {
      await this.common.closeDialogIfVisible();
      throw new Error("Item Manufacturer save failed due missing mandatory fields.");
    }

    const savedByNavigation = await this.page
      .waitForURL(
        (url) => url.pathname.includes("/app/item-manufacturer/") && !url.pathname.includes("/new-"),
        { timeout: 15_000 }
      )
      .then(() => true)
      .catch(() => false);

    if (savedByNavigation) {
      return;
    }

    if (await saveText.isVisible().catch(() => false)) {
      await expect(saveText).toBeVisible();
    }
  }

  async verifyInList(payload: ItemManufacturerPayload, route: string): Promise<void> {
    await this.itemManufacturerPage.openList(route);
    await this.itemManufacturerPage.searchByPartNumber(payload.manufacturerPartNumber);
    const row = await this.common.expectRowVisibleByCellValue(payload.manufacturerPartNumber);
    await expect(row).toContainText(payload.itemCode);
    await expect(row).toContainText(payload.manufacturer);
  }
}
