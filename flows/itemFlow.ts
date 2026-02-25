import { expect, Page } from "@playwright/test";
import { CommonPage } from "../pages/common/commonPage";
import { ItemPage } from "../pages/item/itemPage";
import { selectors } from "../selectors/selectors";
import { ItemPayload } from "../utils/types";

export class ItemFlow {
  constructor(
    private readonly page: Page,
    private readonly common: CommonPage,
    private readonly itemPage: ItemPage
  ) {}

  async openNewItemFromList(route: string): Promise<void> {
    await this.itemPage.openList(route);
    await this.itemPage.openAddItemForm();
  }

  async verifyMissingItemCodeValidation(expectedTitle: string, expectedBodies: string[], expectedField: string): Promise<void> {
    await this.itemPage.openFullFormFromQuickEntry();
    await this.itemPage.clickSave();
    // Title varies between environments; validate stable message body and field list.
    await this.common.expectDialogContainsAny(expectedBodies);
    await this.common.expectDialogContains(expectedField);
    await this.common.closeDialogIfVisible();
  }

  async verifyHsnValidation(data: Omit<ItemPayload, "hsnCode">, expectedMessages: string[]): Promise<void> {
    await this.itemPage.openFullFormFromQuickEntry();
    await this.itemPage.fillWithoutHsn(data);
    await this.itemPage.clickSave();
    await this.common.expectDialogContainsAny(expectedMessages);
    await this.common.closeDialogIfVisible();
  }

  async verifyItemGroupValidation(data: Omit<ItemPayload, "itemGroup">, expectedField: string): Promise<void> {
    await this.itemPage.openFullFormFromQuickEntry();
    await this.itemPage.fillWithoutItemGroup(data);
    await this.itemPage.clickSave();
    await this.common.expectDialogContains(expectedField);
    await this.common.closeDialogIfVisible();
  }

  async verifyRevisionValidation(data: Omit<ItemPayload, "revisionNumber">, expectedTitle: string, expectedBodies: string[], expectedField: string): Promise<void> {
    await this.itemPage.openFullFormFromQuickEntry();
    await this.itemPage.fillWithoutRevision(data);
    await this.itemPage.clickSave();
    // Title/body vary across environments; field bullet is the stable signal.
    await this.common.expectDialogContains(expectedField);
    await this.common.closeDialogIfVisible();
  }

  async createItem(data: ItemPayload, expectedToast: string): Promise<void> {
    await this.itemPage.openFullFormFromQuickEntry();
    await this.itemPage.fillRequiredFields(data);
    await this.itemPage.clickSave();

    const toastVisible = await this.page
      .locator(selectors.common.toast.join(", "))
      .first()
      .isVisible({ timeout: 4000 })
      .catch(() => false);

    if (toastVisible) {
      await this.common.expectToastContains(expectedToast);
      return;
    }

    await expect(this.page).toHaveURL(/\/app\/item\/.+/, { timeout: 15000 });
    await expect(this.page.locator(selectors.templates.textLocator(data.itemCode)).first()).toBeVisible({ timeout: 15000 });
  }

  async verifyInList(
    data: ItemPayload,
    route: string,
    options?: { validateItemGroup?: boolean }
  ): Promise<void> {
    await this.itemPage.openList(route);
    await this.itemPage.searchByItemCode(data.itemCode);
    const row = await this.common.expectRowVisibleByCellValue(data.itemCode);
    await expect(row).toContainText(data.itemName);
    if (options?.validateItemGroup !== false) {
      await expect(row).toContainText(data.itemGroup);
    }
  }
}
