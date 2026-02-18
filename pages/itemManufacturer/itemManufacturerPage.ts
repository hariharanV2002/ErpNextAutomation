import { expect, Locator, Page } from "@playwright/test";
import { selectors } from "../../selectors/selectors";
import { ItemManufacturerPayload } from "../../utils/types";
import { CommonPage } from "../common/commonPage";

export class ItemManufacturerPage {
  constructor(
    private readonly page: Page,
    private readonly common: CommonPage
  ) {}

  async openList(route: string): Promise<void> {
    await this.page.goto(route, { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle");
  }

  async openAddForm(): Promise<void> {
    await this.common.click(selectors.itemManufacturerList.addItemManufacturerButton);
    const input = await this.common.get(selectors.itemManufacturerForm.itemCodeInput);
    await expect(input).toBeVisible();
  }

  async openFullFormFromQuickEntry(): Promise<void> {
    const onFullForm = this.page.url().includes("/app/item-manufacturer/new-");
    if (onFullForm) {
      return;
    }

    const activeModal = this.getQuickEntryModal();
    if (await activeModal.isVisible().catch(() => false)) {
      let quickEntryButton = activeModal.locator(selectors.itemForm.editFullFormButton.join(", ")).first();
      if (!(await quickEntryButton.isVisible().catch(() => false))) {
        quickEntryButton = this.page.locator(selectors.itemForm.editFullFormButton.join(", ")).first();
      }
      if (await quickEntryButton.isVisible().catch(() => false)) {
        await quickEntryButton.click({ force: true });
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(1200);
      }
    }

    const switched = this.page.url().includes("/app/item-manufacturer/new-");
    if (!switched) {
      throw new Error("Could not switch from quick-entry to full form for Item Manufacturer.");
    }

    if (await activeModal.isVisible().catch(() => false)) {
      const closeButton = activeModal.locator(selectors.common.dialogClose.join(", ")).first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click({ force: true });
        await this.page.waitForTimeout(500);
      }
    }
  }

  async filterByItemCode(itemCode: string): Promise<void> {
    await this.clearFiltersIfVisible();
    await this.common.clearThenType(selectors.itemManufacturerForm.itemCodeInput, `%${itemCode}%`);
    await this.page.keyboard.press("Enter");
    await this.page.waitForLoadState("networkidle");
  }

  async clickSave(): Promise<void> {
    if (this.isOnFullFormPage()) {
      await this.common.click(selectors.itemManufacturerForm.saveButton);
      return;
    }
    const activeModal = this.getQuickEntryModal();
    if (await activeModal.isVisible().catch(() => false)) {
      const modalSave = activeModal.locator(selectors.itemForm.modalSaveButton.join(", ")).first();
      if (await modalSave.isVisible().catch(() => false)) {
        await modalSave.click({ force: true });
        return;
      }
    }
    await this.common.click(selectors.itemManufacturerForm.saveButton);
  }

  async fillForm(payload: ItemManufacturerPayload): Promise<void> {
    if (this.isOnFullFormPage()) {
      await this.setLinkFieldByValue(selectors.itemManufacturerForm.itemCodeInput, payload.itemCode);
      await this.setLinkFieldByValue(selectors.itemManufacturerForm.manufacturerInput, payload.manufacturer);
      await this.common.clearThenType(selectors.itemManufacturerForm.manufacturerPartNumberInput, payload.manufacturerPartNumber);
      return;
    }

    const activeModal = this.getQuickEntryModal();
    if (await activeModal.isVisible().catch(() => false)) {
      await this.fillInActiveModal(activeModal, payload.itemCode, payload.manufacturer, payload.manufacturerPartNumber);
      return;
    }
    await this.common.selectAutocomplete(selectors.itemManufacturerForm.itemCodeInput, payload.itemCode);
    await this.selectManufacturer(payload.manufacturer);
    await this.common.clearThenType(selectors.itemManufacturerForm.manufacturerPartNumberInput, payload.manufacturerPartNumber);
  }

  async fillWithoutPartNumber(payload: Omit<ItemManufacturerPayload, "manufacturerPartNumber">): Promise<void> {
    if (this.isOnFullFormPage()) {
      await this.setLinkFieldByValue(selectors.itemManufacturerForm.itemCodeInput, payload.itemCode);
      await this.setLinkFieldByValue(selectors.itemManufacturerForm.manufacturerInput, payload.manufacturer);
      await this.common.clearThenType(selectors.itemManufacturerForm.manufacturerPartNumberInput, "");
      return;
    }

    const activeModal = this.getQuickEntryModal();
    if (await activeModal.isVisible().catch(() => false)) {
      await this.fillInActiveModal(activeModal, payload.itemCode, payload.manufacturer, "");
      return;
    }
    await this.common.selectAutocomplete(selectors.itemManufacturerForm.itemCodeInput, payload.itemCode);
    await this.selectManufacturer(payload.manufacturer);
    await this.common.clearThenType(selectors.itemManufacturerForm.manufacturerPartNumberInput, "");
  }

  async fillOnlyItemCode(itemCode: string): Promise<void> {
    if (this.isOnFullFormPage()) {
      await this.setLinkFieldByValue(selectors.itemManufacturerForm.itemCodeInput, itemCode);
      return;
    }

    const activeModal = this.getQuickEntryModal();
    if (await activeModal.isVisible().catch(() => false)) {
      await this.fillAutocompleteInModal(activeModal, selectors.itemManufacturerForm.itemCodeInput, itemCode, "Item Code");
      return;
    }
    await this.common.selectAutocomplete(selectors.itemManufacturerForm.itemCodeInput, itemCode);
  }

  async fillOnlyManufacturer(manufacturer: string): Promise<void> {
    if (this.isOnFullFormPage()) {
      await this.setLinkFieldByValue(selectors.itemManufacturerForm.manufacturerInput, manufacturer);
      return;
    }

    const activeModal = this.getQuickEntryModal();
    if (await activeModal.isVisible().catch(() => false)) {
      await this.fillAutocompleteInModal(activeModal, selectors.itemManufacturerForm.manufacturerInput, manufacturer, "Manufacturer");
      return;
    }
    await this.selectManufacturer(manufacturer);
  }

  async fillOnlyPartNumber(partNumber: string): Promise<void> {
    if (this.isOnFullFormPage()) {
      await this.common.clearThenType(selectors.itemManufacturerForm.manufacturerPartNumberInput, partNumber);
      return;
    }

    const activeModal = this.getQuickEntryModal();
    if (await activeModal.isVisible().catch(() => false)) {
      const partNumberInput = activeModal.locator(selectors.itemManufacturerForm.manufacturerPartNumberInput.join(", ")).first();
      await partNumberInput.click({ force: true });
      await partNumberInput.fill("");
      await partNumberInput.fill(partNumber);
      await partNumberInput.press("Tab");
      return;
    }
    await this.common.clearThenType(selectors.itemManufacturerForm.manufacturerPartNumberInput, partNumber);
  }

  async clearMandatoryFieldsInQuickEntry(): Promise<void> {
    const modal = this.getQuickEntryModal();
    const itemCodeInput = modal.locator(selectors.itemManufacturerForm.itemCodeInput.join(", ")).first();
    const manufacturerInput = modal.locator(selectors.itemManufacturerForm.manufacturerInput.join(", ")).first();
    const partNumberInput = modal.locator(selectors.itemManufacturerForm.manufacturerPartNumberInput.join(", ")).first();

    await itemCodeInput.click({ force: true });
    await itemCodeInput.fill("");
    await manufacturerInput.click({ force: true });
    await manufacturerInput.fill("");
    await partNumberInput.click({ force: true });
    await partNumberInput.fill("");
  }

  async selectItemCodeInQuickEntry(itemCode: string): Promise<void> {
    await this.selectLinkInQuickEntry(selectors.itemManufacturerForm.itemCodeInput, itemCode);
  }

  async selectManufacturerInQuickEntry(shortName: string): Promise<void> {
    const modal = this.getQuickEntryModal();
    const input = modal.locator(selectors.itemManufacturerForm.manufacturerInput.join(", ")).first();
    await input.click({ force: true });
    await input.fill("");
    await input.fill(shortName);
    await this.page.waitForTimeout(2200);

    const option = this.page
      .locator(`${selectors.common.autocompleteOption.join(", ")}:visible`)
      .filter({ hasText: shortName })
      .first();

    if (await option.isVisible().catch(() => false)) {
      await option.click({ force: true });
      return;
    }

    const firstVisibleOption = this.page.locator(`${selectors.common.autocompleteOption.join(", ")}:visible`).first();
    if (await firstVisibleOption.isVisible().catch(() => false)) {
      await firstVisibleOption.click({ force: true });
      return;
    }

    throw new Error(`Manufacturer dropdown option not visible for short name: ${shortName}`);
  }

  async searchByPartNumber(partNumber: string): Promise<void> {
    await this.clearFiltersIfVisible();
    await this.common.clearThenType(selectors.itemManufacturerList.searchPartNumberInput, `%${partNumber.toLowerCase()}%`);
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

  private async selectManufacturer(value: string): Promise<void> {
    await this.common.clearThenType(selectors.itemManufacturerForm.manufacturerInput, value);
    const manufacturer = await this.common.get(selectors.itemManufacturerForm.manufacturerInput);
    await this.page.waitForTimeout(700);
    const exactOption = this.page.locator(selectors.templates.autocompleteOptionByText(value)).first();
    if (await exactOption.isVisible().catch(() => false)) {
      await exactOption.click({ force: true });
    } else {
      await manufacturer.press("ArrowDown");
      await manufacturer.press("Enter");
    }

    let selected = (await manufacturer.inputValue().catch(() => "")).trim();
    if (selected && selected.toLowerCase().includes(value.toLowerCase())) {
      return;
    }
    const fallbackSeed = value.slice(0, 1);
    await this.common.clearThenType(selectors.itemManufacturerForm.manufacturerInput, fallbackSeed);
    await manufacturer.press("ArrowDown");
    await manufacturer.press("Enter");
    selected = (await manufacturer.inputValue().catch(() => "")).trim();
    if (!selected || !selected.toLowerCase().includes(value.toLowerCase())) {
      throw new Error(`Could not select requested Manufacturer from autocomplete: ${value}`);
    }
  }

  private async fillInActiveModal(
    modal: Locator,
    itemCode: string,
    manufacturerName: string,
    partNumber: string
  ): Promise<void> {
    const currentItemCode = await this.readModalFieldValue(modal, selectors.itemManufacturerForm.itemCodeInput);
    if (!currentItemCode) {
      await this.fillAutocompleteInModal(modal, selectors.itemManufacturerForm.itemCodeInput, itemCode, "Item Code");
    }
    await this.fillAutocompleteInModal(modal, selectors.itemManufacturerForm.manufacturerInput, manufacturerName, "Manufacturer");

    const partNumberInput = modal.locator(selectors.itemManufacturerForm.manufacturerPartNumberInput.join(", ")).first();
    await partNumberInput.click({ force: true });
    await partNumberInput.fill("");
    if (partNumber) {
      await partNumberInput.fill(partNumber);
    }
    await partNumberInput.press("Tab");
  }

  private async fillAutocompleteInModal(
    modal: Locator,
    candidates: readonly string[],
    value: string,
    fieldName: string
  ): Promise<void> {
    const visibleCandidates = candidates.map((candidate) => `${candidate}:visible`).join(", ");
    const input = modal.locator(visibleCandidates).first();
    await expect(input).toBeVisible();
    await input.click({ force: true });
    await input.fill("");
    await input.fill(value);
    await this.page.waitForTimeout(700);

    const option = modal.locator(selectors.templates.autocompleteOptionByText(value)).first();
    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click({ force: true });
    } else {
      await input.press("ArrowDown");
      await input.press("Enter");
    }

    await input.press("Tab", { timeout: 2000 }).catch(async () => {
      await this.page.keyboard.press("Tab");
    });

    const selectedInputValue = (await input.inputValue().catch(() => "")).trim();
    if (selectedInputValue) {
      return;
    }

    const selectedText = modal.locator(selectors.templates.visibleTextLocator(value)).first();
    if (await selectedText.isVisible().catch(() => false)) {
      return;
    }

    const fallbackSeed = value.slice(0, 2);
    if (fallbackSeed) {
      await input.click({ force: true });
      await input.fill("");
      await input.fill(fallbackSeed);
      await input.press("ArrowDown");
      await input.press("Enter");
      await input.press("Tab", { timeout: 2000 }).catch(async () => {
        await this.page.keyboard.press("Tab");
      });
    }

    const anyOption = modal.locator(selectors.common.autocompleteOption.join(", ")).first();
    if (await anyOption.isVisible().catch(() => false)) {
      await anyOption.click({ force: true });
      await input.press("Tab", { timeout: 2000 }).catch(async () => {
        await this.page.keyboard.press("Tab");
      });
      return;
    }

    await input.click({ force: true });
    await input.fill("");
    await input.type(value.slice(0, 1), { delay: 60 });
    await this.page.waitForTimeout(400);
    const retryOption = modal.locator(selectors.common.autocompleteOption.join(", ")).first();
    if (await retryOption.isVisible().catch(() => false)) {
      await retryOption.click({ force: true });
      await input.press("Tab", { timeout: 2000 }).catch(async () => {
        await this.page.keyboard.press("Tab");
      });
    }
  }

  private async readModalFieldValue(modal: Locator, candidates: readonly string[]): Promise<string> {
    const visibleCandidates = candidates.map((candidate) => `${candidate}:visible`).join(", ");
    const input = modal.locator(visibleCandidates).first();
    const visible = await input.isVisible().catch(() => false);
    if (!visible) {
      return "";
    }
    return (await input.inputValue().catch(() => "")).trim();
  }

  private getQuickEntryModal(): Locator {
    return this.page
      .locator(".modal.show")
      .filter({
        has: this.page.locator(selectors.itemManufacturerForm.manufacturerPartNumberInput.join(", "))
      })
      .first();
  }

  private isOnFullFormPage(): boolean {
    return this.page.url().includes("/app/item-manufacturer/new-");
  }

  private async setLinkFieldByValue(candidates: readonly string[], value: string): Promise<void> {
    const input = await this.common.get(candidates);
    await input.click({ force: true });
    await input.fill("");
    await input.fill(value);
    await this.page.waitForTimeout(600);
    await input.press("ArrowDown").catch(() => {});
    await input.press("Enter").catch(() => {});
    await input.press("Tab").catch(() => {});
  }

  private async selectLinkInQuickEntry(candidates: readonly string[], value: string): Promise<void> {
    const modal = this.getQuickEntryModal();
    const input = modal.locator(candidates.join(", ")).first();
    await input.click({ force: true });
    await input.fill("");
    await input.fill(value);
    await this.page.waitForTimeout(1800);

    const option = modal.locator(selectors.templates.autocompleteOptionByText(value)).first();
    if (await option.isVisible().catch(() => false)) {
      await option.click({ force: true });
    } else {
      await input.press("ArrowDown").catch(() => {});
      await input.press("Enter").catch(() => {});
    }
    await input.press("Tab").catch(async () => {
      await this.page.keyboard.press("Tab");
    });
  }
}
