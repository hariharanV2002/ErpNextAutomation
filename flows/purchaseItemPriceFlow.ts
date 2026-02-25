import { Page } from "@playwright/test";
import { CommonPage } from "../pages/common/commonPage";
import { PurchaseItemPricePage } from "../pages/purchase/purchaseItemPricePage";
import { selectors } from "../selectors/selectors";
import { CreatedItemPriceRecord, PurchaseItemPricePayload } from "../utils/types";

export class PurchaseItemPriceFlow {
  constructor(
    private readonly page: Page,
    private readonly common: CommonPage,
    private readonly purchaseItemPricePage: PurchaseItemPricePage
  ) {}

  async openNewFromList(route: string): Promise<void> {
    await this.purchaseItemPricePage.openList(route);
    await this.purchaseItemPricePage.openAddForm();
    await this.purchaseItemPricePage.openFullFormFromQuickEntry();
  }

  async verifyVideoAlignedNegativeValidation(route: string, payload: PurchaseItemPricePayload, expectations: {
    itemCode: string;
    uom: string;
    priceList: string;
    counterparty: string[];
    rate: string;
  }): Promise<void> {
    // Step 1: save empty -> baseline mandatory validation.
    await this.openNewFromList(route);
    await this.purchaseItemPricePage.clickSave();
    await this.common.expectDialogContains(expectations.itemCode);
    await this.common.expectDialogContains(expectations.uom);
    await this.common.expectDialogContains(expectations.priceList);
    await this.common.closeDialogIfVisible();
    await this.assertStillUnsaved();

    // Step 2: fill raw-material Item Code, remove it, save -> Item Code mandatory.
    await this.purchaseItemPricePage.fillOnlyItemCode(payload.itemCode);
    await this.purchaseItemPricePage.clearItemCode();
    await this.purchaseItemPricePage.clickSave();
    await this.common.expectDialogContains(expectations.itemCode);
    await this.common.closeDialogIfVisible();
    await this.assertStillUnsaved();

    // Step 3: fill item code + UOM, clear UOM, save -> UOM mandatory.
    await this.purchaseItemPricePage.fillOnlyItemCode(payload.itemCode);
    await this.purchaseItemPricePage.fillOnlyUom(payload.uom);
    await this.purchaseItemPricePage.clearUom();
    await this.purchaseItemPricePage.clickSave();
    await this.common.expectDialogContains(expectations.uom);
    await this.common.closeDialogIfVisible();
    await this.assertStillUnsaved();

    // Step 4: fill item code + UOM + select Standard Buying - INR, clear Price List, save -> Price List mandatory.
    await this.purchaseItemPricePage.fillOnlyItemCode(payload.itemCode);
    await this.purchaseItemPricePage.fillOnlyUom(payload.uom);
    await this.purchaseItemPricePage.fillOnlyPriceList(payload.priceList);
    await this.purchaseItemPricePage.clearPriceList();
    await this.purchaseItemPricePage.clickSave();
    await this.common.expectDialogContains(expectations.priceList);
    await this.common.closeDialogIfVisible();
    await this.assertStillUnsaved();

    // Step 5: reselect Price List, select random Supplier/Customer, clear it, save -> Supplier/Customer mandatory.
    await this.purchaseItemPricePage.fillOnlyPriceList(payload.priceList);
    await this.purchaseItemPricePage.fillCounterpartyWithRandomOption();
    await this.purchaseItemPricePage.clearCounterparty();
    await this.purchaseItemPricePage.clickSave();
    await this.common.expectDialogContainsAny(expectations.counterparty);
    await this.common.closeDialogIfVisible();
    await this.assertStillUnsaved();

    // Step 6: reselect random Supplier/Customer, clear Rate, save -> Rate mandatory.
    await this.purchaseItemPricePage.fillCounterpartyWithRandomOption();
    await this.purchaseItemPricePage.clearRate();
    await this.purchaseItemPricePage.clickSave();
    await this.common.expectDialogContains(expectations.rate);
    await this.common.closeDialogIfVisible();
    await this.assertStillUnsaved();
  }

  async createAndVerifyInList(
    route: string,
    payload: PurchaseItemPricePayload,
    expectedSavedText: string
  ): Promise<CreatedItemPriceRecord> {
    await this.openNewFromList(route);
    await this.purchaseItemPricePage.fillOnlyItemCode(payload.itemCode);
    await this.purchaseItemPricePage.fillOnlyUom(payload.uom);
    await this.purchaseItemPricePage.fillOnlyPriceList(payload.priceList);
    const counterparty = payload.supplier
      ? {
          type: "supplier" as const,
          value: await this.purchaseItemPricePage
            .fillOnlySupplier(payload.supplier)
            .then(() => payload.supplier as string)
        }
      : await this.purchaseItemPricePage.fillCounterpartyWithRandomOption();
    await this.purchaseItemPricePage.fillOnlyRate(payload.priceListRate);
    await this.purchaseItemPricePage.clickSave();
    const missingDialog = this.page.locator(selectors.templates.dialogTitleByText("Missing Values Required")).first();
    if (await missingDialog.isVisible().catch(() => false)) {
      throw new Error("Item Price create failed due missing mandatory fields.");
    }
    const duplicateDialog = this.page.locator(selectors.templates.dialogBodyByText("appears multiple times")).first();
    const duplicateVisible = await duplicateDialog.isVisible().catch(() => false);
    if (duplicateVisible) {
      await this.common.closeDialogIfVisible();
    } else {
      await this.purchaseItemPricePage.expectSavedByToastOrNavigation(expectedSavedText);
    }

    const record: CreatedItemPriceRecord = {
      ...payload,
      counterpartyType: counterparty.type,
      counterpartyValue: counterparty.value
    };

    await this.purchaseItemPricePage.openList(route);
    await this.purchaseItemPricePage.searchByItemCode(record.itemCode);
    const row = await this.common.expectRowVisibleByCellValue(record.priceList);
    const rowText = ((await row.textContent().catch(() => "")) || "").toLowerCase();
    if (!rowText.includes(record.counterpartyValue.toLowerCase())) {
      throw new Error(`Item Price row does not contain expected counterparty: ${record.counterpartyValue}`);
    }
    return record;
  }

  async verifyRecordsInList(route: string, records: CreatedItemPriceRecord[]): Promise<void> {
    for (const record of records) {
      await this.purchaseItemPricePage.openList(route);
      await this.purchaseItemPricePage.searchByItemCode(record.itemCode);
      const row = await this.common.expectRowVisibleByCellValue(record.priceList);
      const rowText = ((await row.textContent().catch(() => "")) || "").toLowerCase();
      if (!rowText.includes(record.counterpartyValue.toLowerCase())) {
        throw new Error(`Item Price row does not contain expected counterparty: ${record.counterpartyValue}`);
      }
    }
  }

  private async assertStillUnsaved(): Promise<void> {
    const savedToast = this.page.locator(selectors.common.toast.join(", ")).first();
    const savedVisible = await savedToast
      .locator(':scope:has-text("Saved")')
      .isVisible()
      .catch(() => false);
    if (savedVisible) {
      throw new Error("Negative validation flow unexpectedly saved a record.");
    }
  }

}
