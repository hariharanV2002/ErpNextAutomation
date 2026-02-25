import { expect, Locator, Page } from "@playwright/test";
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
    await this.selectItemGroupStrict(data.itemGroup);
    await this.fillRevisionNumber(data.revisionNumber);
    await this.selectByLabelIfPresent(selectors.itemForm.builtTypeSelect, data.builtType);
    await this.common.clearThenType(selectors.itemForm.hsnInput, data.hsnCode);
  }

  async fillWithoutHsn(data: Omit<ItemPayload, "hsnCode">): Promise<void> {
    await this.common.clearThenType(selectors.itemForm.itemCodeInput, data.itemCode);
    await this.common.clearThenType(selectors.itemForm.itemNameInput, data.itemName);
    await this.selectItemGroupStrict(data.itemGroup);
    await this.fillRevisionNumber(data.revisionNumber);
    await this.selectByLabelIfPresent(selectors.itemForm.builtTypeSelect, data.builtType);
    await this.common.clearThenType(selectors.itemForm.hsnInput, "");
  }

  async fillWithoutRevision(data: Omit<ItemPayload, "revisionNumber">): Promise<void> {
    await this.common.clearThenType(selectors.itemForm.itemCodeInput, data.itemCode);
    await this.common.clearThenType(selectors.itemForm.itemNameInput, data.itemName);
    await this.selectItemGroupStrict(data.itemGroup);
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

  private async selectItemGroupStrict(value: string): Promise<void> {
    const candidates = [value, this.pluralizeLabel(value)];

    for (const candidate of candidates) {
      const selected = await this.trySelectItemGroup(candidate, value);
      if (selected) {
        return;
      }
    }

    const itemGroup = await this.getVisibleItemGroupInput();
    const finalValue = (await itemGroup.inputValue().catch(() => "")).trim();
    const visibleOptions = await this.readVisibleAutocompleteOptions();
    throw new Error(
      `Item Group selected as "${finalValue}" but expected "${value}". Visible dropdown options: ${visibleOptions.join(" | ")}`
    );
  }

  private async trySelectItemGroup(query: string, expectedValue: string): Promise<boolean> {
    const itemGroup = await this.getVisibleItemGroupInput();
    await itemGroup.click({ force: true });
    await itemGroup.fill("");
    await itemGroup.fill(query);
    await this.page.waitForTimeout(1200);

    const clicked = await this.clickBestAutocompleteOption(expectedValue);
    if (!clicked) {
      await itemGroup.press("Tab").catch(() => {});
      await this.page.waitForTimeout(250);
      const selectedWithoutClick = (await itemGroup.inputValue().catch(() => "")).trim();
      return this.isMatchingItemGroup(selectedWithoutClick, expectedValue);
    }

    await itemGroup.press("Tab").catch(() => {});
    await this.page.waitForTimeout(250);
    const selected = (await itemGroup.inputValue().catch(() => "")).trim();
    return this.isMatchingItemGroup(selected, expectedValue);
  }

  private async clickBestAutocompleteOption(value: string): Promise<boolean> {
    const options = this.page.locator(`${selectors.common.autocompleteOption.join(", ")}:visible`);
    const count = await options.count();
    if (!count) {
      return false;
    }

    const expected = this.normalizeGroupLabel(value);
    const expectedPlural = this.normalizeGroupLabel(this.pluralizeLabel(value));
    for (let i = 0; i < count; i += 1) {
      const option = options.nth(i);
      const label = await this.readPrimaryOptionLabel(option);
      if (!label || this.isUtilityAutocompleteLabel(label)) {
        continue;
      }
      const normalizedText = this.normalizeGroupLabel(label);
      if (normalizedText === expected || normalizedText === expectedPlural) {
        await option.click({ force: true });
        return true;
      }
    }

    for (let i = 0; i < count; i += 1) {
      const option = options.nth(i);
      const label = await this.readPrimaryOptionLabel(option);
      if (!label || this.isUtilityAutocompleteLabel(label)) {
        continue;
      }
      const normalizedText = this.normalizeGroupLabel(label);
      if (normalizedText.includes(expected) || normalizedText.includes(expectedPlural)) {
        await option.click({ force: true });
        return true;
      }
    }

    for (let i = 0; i < count; i += 1) {
      const option = options.nth(i);
      const label = await this.readPrimaryOptionLabel(option);
      if (!label || this.isUtilityAutocompleteLabel(label)) {
        continue;
      }
      await option.click({ force: true });
      return true;
    }

    return false;
  }

  private async readVisibleAutocompleteOptions(): Promise<string[]> {
    const options = this.page.locator(`${selectors.common.autocompleteOption.join(", ")}:visible`);
    const count = await options.count();
    const values: string[] = [];
    for (let i = 0; i < count; i += 1) {
      const text = await this.readPrimaryOptionLabel(options.nth(i));
      if (text && !this.isUtilityAutocompleteLabel(text)) {
        values.push(text);
      }
    }
    return values;
  }

  private async readPrimaryOptionLabel(option: Locator): Promise<string> {
    const raw = ((await option.textContent()) ?? "").trim();
    if (!raw) {
      return "";
    }
    // Link-option rows often contain secondary text (like parent group) on next line.
    return raw
      .split("\n")
      .map((part) => part.trim())
      .find((part) => part.length > 0) ?? "";
  }

  private isMatchingItemGroup(selectedValue: string, expectedValue: string): boolean {
    const normalizedSelected = this.normalizeGroupLabel(selectedValue);
    const normalizedExpected = this.normalizeGroupLabel(expectedValue);
    const normalizedPluralExpected = this.normalizeGroupLabel(this.pluralizeLabel(expectedValue));
    return (
      normalizedSelected === normalizedExpected ||
      normalizedSelected === normalizedPluralExpected
    );
  }

  private normalizeGroupLabel(value: string): string {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleaned.endsWith("s")) {
      return cleaned.slice(0, -1);
    }
    return cleaned;
  }

  private pluralizeLabel(value: string): string {
    const trimmed = value.trim();
    if (trimmed.endsWith("s")) {
      return trimmed;
    }
    return `${trimmed}s`;
  }

  private isUtilityAutocompleteLabel(label: string): boolean {
    return /create a new|advanced search|filters applied/i.test(label);
  }

  private async getVisibleItemGroupInput(): Promise<Locator> {
    const byLabel = this.page.getByLabel(/Item Group/i).first();
    if (await byLabel.isVisible().catch(() => false)) {
      return byLabel;
    }

    for (const candidate of selectors.itemForm.itemGroupInput) {
      const visible = this.page.locator(`${candidate}:visible`).first();
      if (await visible.isVisible().catch(() => false)) {
        return visible;
      }
    }

    const fallback = this.page.locator(selectors.itemForm.itemGroupInput.join(", ")).first();
    await expect(fallback).toBeVisible({ timeout: 5000 });
    return fallback;
  }
}
