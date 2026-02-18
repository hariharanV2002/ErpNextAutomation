import { expect, Page } from "@playwright/test";
import { selectors } from "../../selectors/selectors";
import { CommonPage } from "../common/commonPage";
import { ItemPayload } from "../../utils/types";

export class ItemPage {
  constructor(
    private readonly page: Page,
    private readonly common: CommonPage
  ) {}

  async openList(route: string): Promise<void> {
    await this.page.goto(route, { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle");
  }

  async openAddItemForm(): Promise<void> {
    await this.common.click(selectors.itemList.addItemButton);
    const saveButton = await this.common.get(selectors.itemForm.saveButton);
    await expect(saveButton).toBeVisible();
  }

  async openFullFormFromQuickEntry(): Promise<void> {
    const alreadyInFullForm = await this.page
      .locator(selectors.itemForm.fullFormIndicator.join(", "))
      .first()
      .isVisible()
      .catch(() => false);
    if (alreadyInFullForm) {
      return;
    }

    const activeModal = this.page.locator(selectors.itemForm.activeModal.join(", ")).first();
    if (await activeModal.isVisible().catch(() => false)) {
      let quickEntryButton = activeModal.locator(selectors.itemForm.editFullFormButton.join(", ")).first();
      if (!(await quickEntryButton.isVisible().catch(() => false))) {
        quickEntryButton = this.page.locator(selectors.itemForm.editFullFormButton.join(", ")).first();
      }
      if (await quickEntryButton.isVisible().catch(() => false)) {
        await quickEntryButton.click({ force: true });
        await this.page.waitForLoadState("networkidle");
      }
    }
    await this.page.waitForTimeout(1200);
    const fullFormVisible = await this.page.locator(selectors.itemForm.fullFormIndicator.join(", ")).first().isVisible().catch(() => false);
    if (!fullFormVisible && this.page.url().includes("/new-item")) {
      const codeInput = await this.common.get(selectors.itemForm.itemCodeInput);
      await expect(codeInput).toBeVisible();
      return;
    }
    if (fullFormVisible) {
      const codeInput = await this.common.get(selectors.itemForm.itemCodeInput);
      await expect(codeInput).toBeVisible();
      return;
    }
    throw new Error("Could not switch from quick-entry modal to full form.");
  }

  async clickSave(): Promise<void> {
    const activeModal = this.page.locator(selectors.itemForm.activeModal.join(", ")).first();
    if (await activeModal.isVisible().catch(() => false)) {
      const modalSave = activeModal.locator(selectors.itemForm.modalSaveButton.join(", ")).first();
      if (await modalSave.isVisible().catch(() => false)) {
        await modalSave.click({ force: true });
        return;
      }
    }
    await this.common.click(selectors.itemForm.saveButton);
  }

  async fillRequiredFields(data: ItemPayload): Promise<void> {
    await this.common.clearThenType(selectors.itemForm.itemCodeInput, data.itemCode);
    await this.common.clearThenType(selectors.itemForm.itemNameInput, data.itemName);
    await this.common.selectAutocomplete(selectors.itemForm.itemGroupInput, data.itemGroup);
    await this.fillRevisionNumber(data.revisionNumber);
    await this.selectByLabelIfPresent(selectors.itemForm.builtTypeSelect, data.builtType);
    await this.common.clearThenType(selectors.itemForm.hsnInput, data.hsnCode);
  }

  async fillWithoutHsn(data: Omit<ItemPayload, "hsnCode">): Promise<void> {
    await this.common.clearThenType(selectors.itemForm.itemCodeInput, data.itemCode);
    await this.common.clearThenType(selectors.itemForm.itemNameInput, data.itemName);
    await this.common.selectAutocomplete(selectors.itemForm.itemGroupInput, data.itemGroup);
    await this.fillRevisionNumber(data.revisionNumber);
    await this.selectByLabelIfPresent(selectors.itemForm.builtTypeSelect, data.builtType);
    await this.common.clearThenType(selectors.itemForm.hsnInput, "");
  }

  async fillWithoutRevision(data: Omit<ItemPayload, "revisionNumber">): Promise<void> {
    await this.common.clearThenType(selectors.itemForm.itemCodeInput, data.itemCode);
    await this.common.clearThenType(selectors.itemForm.itemNameInput, data.itemName);
    await this.common.selectAutocomplete(selectors.itemForm.itemGroupInput, data.itemGroup);
    await this.selectByLabelIfPresent(selectors.itemForm.builtTypeSelect, data.builtType);
    await this.common.clearThenType(selectors.itemForm.hsnInput, data.hsnCode);
  }

  async fillWithoutItemGroup(data: Omit<ItemPayload, "itemGroup">): Promise<void> {
    await this.common.clearThenType(selectors.itemForm.itemCodeInput, data.itemCode);
    await this.common.clearThenType(selectors.itemForm.itemNameInput, data.itemName);
    const itemGroup = await this.common.get(selectors.itemForm.itemGroupInput);
    await itemGroup.click({ force: true });
    await itemGroup.clear();
    await itemGroup.press("Tab");
    await this.fillRevisionNumber(data.revisionNumber);
    await this.selectByLabelIfPresent(selectors.itemForm.builtTypeSelect, data.builtType);
    await this.common.clearThenType(selectors.itemForm.hsnInput, data.hsnCode);
  }

  async searchByItemCode(itemCode: string): Promise<void> {
    await this.clearFiltersIfVisible();
    await this.common.clearThenType(selectors.itemList.searchIdInput, `%${itemCode}%`);
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

  private async clearThenTypeIfPresent(candidates: readonly string[], value: string): Promise<void> {
    try {
      await this.common.clearThenType(candidates, value);
    } catch {
      // Optional field in some form variants.
    }
  }

  private async selectByLabelIfPresent(candidates: readonly string[], value: string): Promise<void> {
    try {
      await this.common.selectByLabel(candidates, value);
    } catch {
      // Optional field in some form variants.
    }
  }

  private async fillRevisionNumber(value: string): Promise<void> {
    const candidateSelectors = selectors.itemForm.revisionInput;

    for (const selector of candidateSelectors) {
      const candidate = this.page.locator(selector).first();
      if (await candidate.isVisible().catch(() => false)) {
        await candidate.click({ force: true });
        await candidate.fill("");
        await candidate.fill(value);
        await candidate.press("Tab");

        const currentValue = await candidate.inputValue().catch(() => "");
        if (currentValue.trim() === value) {
          return;
        }

        await candidate.click({ force: true });
        await candidate.fill("");
        await candidate.type(value, { delay: 70 });
        await candidate.press("Tab");

        const retryValue = await candidate.inputValue().catch(() => "");
        if (retryValue.trim() === value) {
          return;
        }
      }
    }

    throw new Error("Could not locate Revision Number input in the current form.");
  }
}
