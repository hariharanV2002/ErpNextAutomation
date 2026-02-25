import { test } from "@playwright/test";
import itemManufacturerData from "../../../fixtures/item-manufacturer-test-data.json";
import { CommonPage } from "../../../pages/common/commonPage";
import { ItemManufacturerPage } from "../../../pages/itemManufacturer/itemManufacturerPage";
import { DataStore } from "../../../utils/dataStore";
import { ManufacturerFactory } from "../../../utils/manufacturerFactory";
import { CreatedItemRecord, CreatedManufacturerRecord } from "../../../utils/types";

test.describe.serial("Item Manufacturer E2E", () => {
  const itemStore = new DataStore("data/created-items.json");
  const manufacturerStore = new DataStore("data/created-manufacturers.json");
  const itemManufacturerStore = new DataStore("data/created-item-manufacturers.json");

  test("Validate mandatory, create with last JSON item/manufacturer, search and verify", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const itemManufacturerPage = new ItemManufacturerPage(page, commonPage);

    const lastItem = itemStore.getLast<CreatedItemRecord>();
    if (!lastItem) {
      throw new Error("No created item found in JSON. Run item positive test first.");
    }

    const lastManufacturer = manufacturerStore.getLast<CreatedManufacturerRecord>();
    if (!lastManufacturer) {
      throw new Error("No created manufacturer found in JSON. Run manufacturer positive test first.");
    }

    await itemManufacturerPage.openList(itemManufacturerData.routes.itemManufacturerList);
    await itemManufacturerPage.openAddForm();
    await itemManufacturerPage.clearMandatoryFieldsInQuickEntry();
    await itemManufacturerPage.clickSave();
    await commonPage.expectDialogContains("Item Code");
    await commonPage.expectDialogContains("Manufacturer");
    await commonPage.expectDialogContains("Manufacturer Part Number");
    await commonPage.closeDialogIfVisible();

    const payload = ManufacturerFactory.createItemManufacturer(lastItem.itemCode, lastManufacturer.shortName);
    await itemManufacturerPage.selectItemCodeInQuickEntry(lastItem.itemCode);
    await itemManufacturerPage.selectManufacturerInQuickEntry(lastManufacturer.shortName);
    await itemManufacturerPage.fillOnlyPartNumber(payload.manufacturerPartNumber);
    await itemManufacturerPage.clickSave();
    await commonPage.closeDialogIfVisible();

    await itemManufacturerPage.openList(itemManufacturerData.routes.itemManufacturerList);
    await itemManufacturerPage.searchByPartNumber(payload.manufacturerPartNumber);
    await commonPage.expectRowVisibleByCellValue(payload.manufacturerPartNumber);
    itemManufacturerStore.appendRecord(payload);
  });
});
