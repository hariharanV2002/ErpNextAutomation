import { expect, test } from "@playwright/test";
import itemTestData from "../../fixtures/item-test-data.json";
import { ItemFlow } from "../../flows/itemFlow";
import { CommonPage } from "../../pages/common/commonPage";
import { ItemPage } from "../../pages/item/itemPage";
import { DataStore } from "../../utils/dataStore";
import { ItemFactory } from "../../utils/itemFactory";

test.describe.serial("Item Master E2E", () => {
  const store = new DataStore("data/created-items.json");

  test("Negative - save without mandatory item code", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const itemPage = new ItemPage(page, commonPage);
    const itemFlow = new ItemFlow(page, commonPage, itemPage);

    await itemFlow.openNewItemFromList(itemTestData.routes.itemList);
    await itemFlow.verifyMissingItemCodeValidation(
      itemTestData.negativeMessages.missingFieldsTitle,
      [
        itemTestData.negativeMessages.missingFieldsBodyWithColon,
        itemTestData.negativeMessages.missingFieldsBody,
        itemTestData.negativeMessages.missingFieldsBodyAlternate
      ],
      itemTestData.negativeMessages.missingItemCodeField
    );
  });

  test("Negative - validate Revision Number mandatory", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const itemPage = new ItemPage(page, commonPage);
    const itemFlow = new ItemFlow(page, commonPage, itemPage);

    await itemFlow.openNewItemFromList(itemTestData.routes.itemList);
    const candidate = ItemFactory.create(itemTestData.itemDefaults);
    const { revisionNumber, ...withoutRevision } = candidate;
    await itemFlow.verifyRevisionValidation(
      withoutRevision,
      itemTestData.negativeMessages.revisionTitle,
      [
        itemTestData.negativeMessages.revisionBody,
        itemTestData.negativeMessages.revisionBodyAlternate
      ],
      itemTestData.negativeMessages.revisionField
    );
  });

  test("Negative - validate Item Group mandatory", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const itemPage = new ItemPage(page, commonPage);
    const itemFlow = new ItemFlow(page, commonPage, itemPage);

    await itemFlow.openNewItemFromList(itemTestData.routes.itemList);
    const candidate = ItemFactory.create(itemTestData.itemDefaults);
    const { itemGroup, ...withoutItemGroup } = candidate;
    await itemFlow.verifyItemGroupValidation(
      withoutItemGroup,
      itemTestData.negativeMessages.missingItemGroupField
    );
  });

  test("Negative - validate HSN/SAC mandatory", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const itemPage = new ItemPage(page, commonPage);
    const itemFlow = new ItemFlow(page, commonPage, itemPage);

    await itemFlow.openNewItemFromList(itemTestData.routes.itemList);
    const hsnCandidate = ItemFactory.create(itemTestData.itemDefaults);
    const { hsnCode, ...withoutHsn } = hsnCandidate;
    await itemFlow.verifyHsnValidation(withoutHsn, [
      itemTestData.negativeMessages.hsnRequired,
      itemTestData.negativeMessages.hsnRequiredShort,
      itemTestData.negativeMessages.hsnRequiredCodeOnly
    ]);
  });

  test("Positive - create item then search and verify row values", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const itemPage = new ItemPage(page, commonPage);
    const itemFlow = new ItemFlow(page, commonPage, itemPage);

    await itemFlow.openNewItemFromList(itemTestData.routes.itemList);
    const item = ItemFactory.create(itemTestData.itemDefaults);
    await itemFlow.createItem(item, itemTestData.positiveMessages.saved);
    await itemFlow.verifyInList(item, itemTestData.routes.itemList);

    store.append(item);
    expect(item.hsnCode).toBe(itemTestData.itemDefaults.hsnCode);
  });
});
