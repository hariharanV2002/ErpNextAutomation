import { test } from "@playwright/test";
import purchaseItemPriceData from "../../fixtures/purchase-item-price-test-data.json";
import { PurchaseItemPriceFlow } from "../../flows/purchaseItemPriceFlow";
import { CommonPage } from "../../pages/common/commonPage";
import { PurchaseItemPricePage } from "../../pages/purchase/purchaseItemPricePage";
import { DataStore } from "../../utils/dataStore";
import {
  CreatedItemPriceRecord,
  CreatedItemRecord,
  PurchaseItemPricePayload
} from "../../utils/types";

test.describe.serial("Purchase Item Price E2E", () => {
  const itemStore = new DataStore("data/created-items.json");
  const itemPriceStore = new DataStore("data/created-item-prices.json");

  test("Negative - validate mandatory fields in item price form", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const purchaseItemPricePage = new PurchaseItemPricePage(page, commonPage);
    const purchaseItemPriceFlow = new PurchaseItemPriceFlow(page, commonPage, purchaseItemPricePage);

    const createdItems = itemStore.getAll<CreatedItemRecord>();
    const rawMaterials = [...createdItems]
      .reverse()
      .filter((item) => item.itemRole === "raw_material")
      .slice(0, 3);
    if (!rawMaterials.length) {
      throw new Error("No raw material item found in JSON. Run item-bom-seed spec first.");
    }

    const payload: PurchaseItemPricePayload = {
      itemCode: rawMaterials[0].itemCode,
      uom: purchaseItemPriceData.defaults.uom,
      priceList: purchaseItemPriceData.defaults.priceList,
      priceListRate: purchaseItemPriceData.defaults.priceListRate
    };

    await purchaseItemPriceFlow.verifyVideoAlignedNegativeValidation(purchaseItemPriceData.routes.itemPriceList, payload, {
      itemCode: purchaseItemPriceData.negativeMessages.missingItemCodeField,
      uom: purchaseItemPriceData.negativeMessages.missingUomField,
      priceList: purchaseItemPriceData.negativeMessages.missingPriceListField,
      counterparty: [
        purchaseItemPriceData.negativeMessages.missingSupplierField,
        purchaseItemPriceData.negativeMessages.missingCustomerField
      ],
      rate: purchaseItemPriceData.negativeMessages.missingRateField
    });
  });

  test("Positive - create item price from last raw material, then search and verify all created records", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const purchaseItemPricePage = new PurchaseItemPricePage(page, commonPage);
    const purchaseItemPriceFlow = new PurchaseItemPriceFlow(page, commonPage, purchaseItemPricePage);

    const createdItems = itemStore.getAll<CreatedItemRecord>();
    const rawMaterials = [...createdItems]
      .reverse()
      .filter((item) => item.itemRole === "raw_material")
      .slice(0, 3);
    if (rawMaterials.length < 3) {
      throw new Error("Need at least 3 raw material items in JSON. Run item-bom-seed spec first.");
    }

    const createdThisRun: CreatedItemPriceRecord[] = [];
    let lockedSupplier: string | undefined;
    for (const rawMaterial of rawMaterials) {
      const payload: PurchaseItemPricePayload = {
        itemCode: rawMaterial.itemCode,
        uom: purchaseItemPriceData.defaults.uom,
        priceList: purchaseItemPriceData.defaults.priceList,
        priceListRate: purchaseItemPriceData.defaults.priceListRate,
        supplier: lockedSupplier
      };

      const createdRecord = await purchaseItemPriceFlow.createAndVerifyInList(
        purchaseItemPriceData.routes.itemPriceList,
        payload,
        purchaseItemPriceData.positiveMessages.saved
      );
      if (!lockedSupplier && createdRecord.counterpartyType === "supplier") {
        lockedSupplier = createdRecord.counterpartyValue;
      }
      itemPriceStore.appendRecord(createdRecord);
      createdThisRun.push(createdRecord);
    }

    await purchaseItemPriceFlow.verifyRecordsInList(
      purchaseItemPriceData.routes.itemPriceList,
      createdThisRun
    );
  });
});
