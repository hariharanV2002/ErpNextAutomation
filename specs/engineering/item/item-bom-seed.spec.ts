import { expect, test } from "@playwright/test";
import bomSeedData from "../../../fixtures/item-bom-seed-test-data.json";
import { BomSeedFlow } from "../../../flows/bomSeedFlow";
import { ItemFlow } from "../../../flows/itemFlow";
import { ItemManufacturerFlow } from "../../../flows/itemManufacturerFlow";
import { CommonPage } from "../../../pages/common/commonPage";
import { ItemPage } from "../../../pages/item/itemPage";
import { ItemManufacturerPage } from "../../../pages/itemManufacturer/itemManufacturerPage";
import { DataStore } from "../../../utils/dataStore";
import { CreatedItemRecord } from "../../../utils/types";

test.describe.serial("Item BOM Seed E2E", () => {
  test.setTimeout(240_000);

  const itemStore = new DataStore("data/created-items.json");
  const manufacturerStore = new DataStore("data/created-manufacturers.json");
  const itemManufacturerStore = new DataStore("data/created-item-manufacturers.json");

  test("Create 3 raw materials and 1 subassembly, verify search, map subassembly with latest manufacturer", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const itemPage = new ItemPage(page, commonPage);
    const itemFlow = new ItemFlow(page, commonPage, itemPage);
    const itemManufacturerPage = new ItemManufacturerPage(page, commonPage);
    const itemManufacturerFlow = new ItemManufacturerFlow(page, commonPage, itemManufacturerPage);
    const bomSeedFlow = new BomSeedFlow(
      itemFlow,
      itemManufacturerFlow,
      itemStore,
      manufacturerStore,
      itemManufacturerStore
    );

    const result = await bomSeedFlow.createBomSeedData({
      itemListRoute: bomSeedData.routes.itemList,
      itemManufacturerListRoute: bomSeedData.routes.itemManufacturerList,
      expectedSavedText: bomSeedData.positiveMessages.saved,
      rawMaterialCount: bomSeedData.counts.rawMaterial,
      commonDefaults: bomSeedData.commonDefaults,
      itemSeeds: bomSeedData.itemSeeds
    });

    const lastCreatedItem = itemStore.getLast<CreatedItemRecord>();
    expect(lastCreatedItem?.itemRole).toBe("subassembly");
    expect(result.rawMaterials).toHaveLength(bomSeedData.counts.rawMaterial);
    expect(result.subassemblyManufacturerRecord.manufacturer).toBe(result.latestManufacturer.shortName);
  });
});
