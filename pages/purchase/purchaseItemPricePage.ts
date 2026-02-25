import { expect, Locator, Page } from "@playwright/test";
import { selectors } from "../../selectors/selectors";
import { PurchaseItemPricePayload } from "../../utils/types";
import { CommonPage } from "../common/commonPage";

type CounterpartySelection = {
  type: "supplier" | "customer";
  value: string;
};

export class PurchaseItemPricePage {
  constructor(
    private readonly page: Page,
    private readonly common: CommonPage
  ) {}

  async openList(route: string): Promise<void> {
    await this.page.goto(route, { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle");
  }

  async openAddForm(): Promise<void> {
    await this.common.click(selectors.purchaseItemPriceList.addItemPriceButton);
    const itemCodeInput = await this.common.get(selectors.purchaseItemPriceForm.itemCodeInput);
    await expect(itemCodeInput).toBeVisible();
  }

  async openFullFormFromQuickEntry(): Promise<void> {
    const onFullForm = this.page.url().includes("/app/item-price/new-item-price");
    if (onFullForm) {
      return;
    }

    const activeModal = this.page.locator(".modal.show").first();
    if (await activeModal.isVisible().catch(() => false)) {
      let fullFormButton = activeModal.locator(selectors.itemForm.editFullFormButton.join(", ")).first();
      if (!(await fullFormButton.isVisible().catch(() => false))) {
        fullFormButton = this.page.locator(selectors.itemForm.editFullFormButton.join(", ")).first();
      }
      if (await fullFormButton.isVisible().catch(() => false)) {
        await fullFormButton.click({ force: true });
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForTimeout(1200);
      }
    }

    if (!this.page.url().includes("/app/item-price/new-item-price")) {
      throw new Error("Could not switch from quick-entry to full form for Item Price.");
    }
  }

  async clickSave(): Promise<void> {
    const activeModal = this.page.locator(".modal.show").first();
    if (await activeModal.isVisible().catch(() => false)) {
      const modalSave = activeModal.locator(selectors.itemForm.modalSaveButton.join(", ")).first();
      if (await modalSave.isVisible().catch(() => false)) {
        await modalSave.click({ force: true });
        return;
      }
    }

    // Full-form save can be blocked by open dropdowns or off-screen header actions.
    await this.page.keyboard.press("Escape").catch(() => {});
    await this.page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});

    const saveCandidates = [
      this.page.locator('button:has-text("Save"):visible').first(),
      this.page.locator('.page-actions button:has-text("Save"):visible, .form-page button:has-text("Save"):visible').first(),
      this.page.locator(selectors.purchaseItemPriceForm.saveButton.join(", ")).first()
    ];

    for (const candidate of saveCandidates) {
      const isVisible = await candidate.isVisible().catch(() => false);
      if (!isVisible) {
        continue;
      }
      await candidate.scrollIntoViewIfNeeded().catch(() => {});
      await candidate.click({ force: true });
      return;
    }

    // Keyboard fallback for frameworks that bind save shortcut on form pages.
    await this.page.keyboard.press("Control+S").catch(() => {});
  }

  async fillOnlyItemCode(itemCode: string): Promise<void> {
    await this.selectLinkField(selectors.purchaseItemPriceForm.itemCodeInput, itemCode, "Item Code");
  }

  async selectItemCodeByQuery(query: string): Promise<string> {
    const input = await this.common.get(selectors.purchaseItemPriceForm.itemCodeInput);
    await input.click({ force: true });
    await input.fill("");
    await input.fill(query);
    await this.page.waitForTimeout(900);

    const visibleOptionSelectors = selectors.common.autocompleteOption.map((selector) => `${selector}:visible`).join(", ");
    const options = this.page.locator(visibleOptionSelectors);
    const count = await options.count();
    for (let i = 0; i < count; i += 1) {
      const option = options.nth(i);
      const text = ((await option.textContent().catch(() => "")) || "").trim().toLowerCase();
      if (!text || text.includes("create a new") || text.includes("advanced search")) {
        continue;
      }
      await option.click({ force: true });
      await input.press("Tab").catch(() => {});
      const selected = (await input.inputValue().catch(() => "")).trim();
      if (selected) {
        return selected;
      }
    }

    throw new Error(`No selectable Item Code option found for query: ${query}`);
  }

  async fillOnlyPriceList(priceList: string): Promise<void> {
    await this.selectLinkField(selectors.purchaseItemPriceForm.priceListInput, priceList, "Price List");
  }

  async fillOnlySupplier(supplier: string): Promise<void> {
    await this.selectLinkField(selectors.purchaseItemPriceForm.supplierInput, supplier, "Supplier");
  }

  async fillOnlyUom(uom: string): Promise<void> {
    await this.selectLinkField(selectors.purchaseItemPriceForm.uomInput, uom, "UOM");
  }

  async fillOnlyRate(priceListRate: string): Promise<void> {
    await this.common.clearThenType(selectors.purchaseItemPriceForm.priceListRateInput, priceListRate);
  }

  async fillCounterpartyWithFirstOption(): Promise<void> {
    await this.fillCounterpartyWithOption(false);
  }

  async fillCounterpartyWithRandomOption(): Promise<CounterpartySelection> {
    return this.fillCounterpartyWithOption(true);
  }

  private async fillCounterpartyWithOption(randomPick: boolean): Promise<CounterpartySelection> {
    const counterparty = await this.getCounterparty();
    const candidates = counterparty?.candidates;
    if (!candidates) {
      throw new Error("Counterparty field (Supplier/Customer) is not visible.");
    }
    const input = await this.common.get(candidates);
    await input.click({ force: true });
    await input.fill("");
    await this.page.waitForTimeout(500);

    const visibleOptionSelectors = selectors.common.autocompleteOption.map((selector) => `${selector}:visible`).join(", ");
    const options = this.page.locator(visibleOptionSelectors);
    const count = await options.count();
    if (count > 0) {
      const maxSteps = Math.min(count, 5);
      const stepCount = randomPick ? Math.max(1, Math.floor(Math.random() * maxSteps) + 1) : 1;
      for (let i = 0; i < stepCount; i += 1) {
        await input.press("ArrowDown").catch(() => {});
      }
      await input.press("Enter").catch(() => {});
      await input.press("Tab").catch(() => {});
      const selected = (await input.inputValue().catch(() => "")).trim();
      if (selected) {
        return { type: counterparty.type, value: selected };
      }
    }

    await input.press("ArrowDown").catch(() => {});
    await input.press("Enter").catch(() => {});
    await input.press("Tab").catch(() => {});
    const selected = (await input.inputValue().catch(() => "")).trim();
    if (!selected) {
      throw new Error("Could not select counterparty (Supplier/Customer) in Item Price form.");
    }
    return { type: counterparty.type, value: selected };
  }

  async clearItemCode(): Promise<void> {
    await this.clearLinkField(selectors.purchaseItemPriceForm.itemCodeInput);
  }

  async clearUom(): Promise<void> {
    await this.clearLinkField(selectors.purchaseItemPriceForm.uomInput);
  }

  async clearPriceList(): Promise<void> {
    await this.clearLinkField(selectors.purchaseItemPriceForm.priceListInput);
  }

  async clearCounterparty(): Promise<void> {
    const counterparty = await this.getCounterparty();
    if (!counterparty?.candidates) {
      return;
    }
    await this.clearLinkField(counterparty.candidates);
  }

  async hasCounterpartyField(): Promise<boolean> {
    const counterparty = await this.getCounterparty();
    return Boolean(counterparty?.candidates);
  }

  async clearRate(): Promise<void> {
    await this.common.clearThenType(selectors.purchaseItemPriceForm.priceListRateInput, "");
  }

  async fillRequiredFields(data: PurchaseItemPricePayload): Promise<void> {
    await this.fillOnlyItemCode(data.itemCode);
    await this.fillOnlyUom(data.uom);
    await this.fillOnlyPriceList(data.priceList);
    if (data.supplier) {
      await this.fillOnlySupplier(data.supplier);
    }
    await this.fillOnlyRate(data.priceListRate);
  }

  async searchByItemCode(itemCode: string): Promise<void> {
    await this.clearFiltersIfVisible();
    const input = await this.common.get(selectors.purchaseItemPriceList.searchItemCodeInput);
    await input.click({ force: true });
    await input.fill("");
    await input.fill(itemCode);
    await this.page.waitForTimeout(700);

    const visibleOptionSelectors = selectors.common.autocompleteOption.map((selector) => `${selector}:visible`).join(", ");
    const options = this.page.locator(visibleOptionSelectors);
    const optionCount = await options.count();
    const expectedLower = itemCode.toLowerCase();
    let selected = false;
    for (let i = 0; i < optionCount; i += 1) {
      const option = options.nth(i);
      const text = ((await option.textContent().catch(() => "")) || "").trim().toLowerCase();
      if (!text || text.includes("create a new") || text.includes("advanced search")) {
        continue;
      }
      if (text.includes(expectedLower)) {
        await option.click({ force: true });
        selected = true;
        break;
      }
    }

    if (!selected) {
      await input.press("ArrowDown").catch(() => {});
      await input.press("Enter").catch(() => {});
    }

    await input.press("Tab").catch(() => {});
    await this.page.keyboard.press("Enter");
    await this.page.waitForLoadState("networkidle");
  }

  async expectSavedByToastOrNavigation(savedText: string): Promise<void> {
    const toast = this.page.locator(selectors.common.toast.join(", ")).first();
    if (await toast.isVisible({ timeout: 4000 }).catch(() => false)) {
      await expect(toast).toContainText(savedText);
      return;
    }

    await this.page.waitForURL(
      (url) => url.pathname.startsWith("/app/item-price/") && !url.pathname.includes("/new-item-price"),
      { timeout: 15000 }
    );
  }

  private async selectLinkField(candidates: readonly string[], value: string, fieldName: string): Promise<void> {
    const input = await this.common.get(candidates);
    await input.click({ force: true });
    await input.fill("");
    await input.fill(value);
    await this.page.waitForTimeout(900);

    const visibleOptionSelectors = selectors.common.autocompleteOption.map((selector) => `${selector}:visible`).join(", ");
    const options = this.page.locator(visibleOptionSelectors);
    const optionCount = await options.count();
    const expectedLower = value.toLowerCase().trim();
    const noResultsStatus = this.page.locator('[role="status"]:visible').filter({ hasText: "No results found" }).first();
    for (let i = 0; i < optionCount; i += 1) {
      const option = options.nth(i);
      const text = ((await option.textContent().catch(() => "")) || "").trim().toLowerCase();
      if (!text || text.includes("create a new") || text.includes("advanced search")) {
        continue;
      }
      if (text.includes(expectedLower)) {
        await option.click({ force: true });
        await input.press("Tab").catch(() => {});
        if (await noResultsStatus.isVisible().catch(() => false)) {
          throw new Error(`Dropdown did not resolve a valid ${fieldName} option for: ${value}`);
        }
        if (await this.hasExpectedValue(input, value)) {
          return;
        }
      }
    }

    if (await noResultsStatus.isVisible().catch(() => false)) {
      const retrySeed = value.slice(0, 2).trim();
      if (retrySeed) {
        await input.click({ force: true });
        await input.fill("");
        await input.fill(retrySeed);
        await this.page.waitForTimeout(900);
        const retryVisibleOptionSelectors = selectors.common.autocompleteOption.map((selector) => `${selector}:visible`).join(", ");
        const retryOptions = this.page.locator(retryVisibleOptionSelectors);
        const retryCount = await retryOptions.count();
        for (let i = 0; i < retryCount; i += 1) {
          const option = retryOptions.nth(i);
          const text = ((await option.textContent().catch(() => "")) || "").trim().toLowerCase();
          if (!text || text.includes("create a new") || text.includes("advanced search")) {
            continue;
          }
          if (text.includes(expectedLower)) {
            await option.click({ force: true });
            await input.press("Tab").catch(() => {});
            if (!(await noResultsStatus.isVisible().catch(() => false)) && (await this.hasExpectedValue(input, value))) {
              return;
            }
          }
        }
      }
      throw new Error(`No ${fieldName} dropdown results found for: ${value}`);
    }

    await input.press("ArrowDown").catch(() => {});
    await input.press("Enter").catch(() => {});
    await input.press("Tab").catch(() => {});
    if (await noResultsStatus.isVisible().catch(() => false)) {
      throw new Error(`Could not select a valid ${fieldName} option for: ${value}`);
    }
    if (await this.hasExpectedValue(input, value)) {
      return;
    }

    throw new Error(`Could not select ${fieldName} from dropdown: ${value}`);
  }

  private async hasExpectedValue(input: Locator, expected: string): Promise<boolean> {
    const actual = (await input.inputValue().catch(() => "")).trim().toLowerCase();
    return actual.includes(expected.toLowerCase().trim());
  }

  private async clearLinkField(candidates: readonly string[]): Promise<void> {
    const input = await this.common.get(candidates);
    await input.click({ force: true });
    await input.fill("");
    await input.press("Tab").catch(() => {});
  }

  private async getCounterparty(): Promise<{ type: "supplier" | "customer"; candidates: readonly string[] } | null> {
    const supplier = this.page.locator(`${selectors.purchaseItemPriceForm.supplierInput.join(", ")}:visible`).first();
    if (await supplier.isVisible().catch(() => false)) {
      return {
        type: "supplier",
        candidates: selectors.purchaseItemPriceForm.supplierInput
      };
    }

    const customer = this.page.locator(`${selectors.purchaseItemPriceForm.customerInput.join(", ")}:visible`).first();
    if (await customer.isVisible().catch(() => false)) {
      return {
        type: "customer",
        candidates: selectors.purchaseItemPriceForm.customerInput
      };
    }

    return null;
  }

  private async clearFiltersIfVisible(): Promise<void> {
    const clear = this.page.locator(selectors.itemList.clearFiltersButton.join(", ")).first();
    if (await clear.isVisible().catch(() => false)) {
      await clear.click({ force: true });
      await this.page.waitForLoadState("networkidle");
    }
  }
}
