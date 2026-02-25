import { test } from "@playwright/test";
import manufacturerData from "../../../fixtures/manufacturer-test-data.json";
import { ManufacturerFlow } from "../../../flows/manufacturerFlow";
import { CommonPage } from "../../../pages/common/commonPage";
import { ManufacturerPage } from "../../../pages/manufacturer/manufacturerPage";
import { DataStore } from "../../../utils/dataStore";
import { ManufacturerFactory } from "../../../utils/manufacturerFactory";

test.describe.serial("Manufacturer E2E", () => {
  const store = new DataStore("data/created-manufacturers.json");

  test("Negative - validate Short Name mandatory", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const manufacturerPage = new ManufacturerPage(page, commonPage);
    const flow = new ManufacturerFlow(page, commonPage, manufacturerPage);

    await flow.openNewFromList(manufacturerData.routes.manufacturerList);
    const manufacturer = ManufacturerFactory.createManufacturer();
    const { shortName, ...withoutShortName } = manufacturer;
    await flow.verifyShortNameMandatory(
      withoutShortName,
      manufacturerData.negativeMessages.missingShortNameField
    );
  });

  test("Positive - create Manufacturer and verify list row", async ({ page }) => {
    const commonPage = new CommonPage(page);
    const manufacturerPage = new ManufacturerPage(page, commonPage);
    const flow = new ManufacturerFlow(page, commonPage, manufacturerPage);

    await flow.openNewFromList(manufacturerData.routes.manufacturerList);
    const manufacturer = ManufacturerFactory.createManufacturer();
    await flow.create(manufacturer, manufacturerData.positiveMessages.saved);
    await flow.verifyInList(manufacturer, manufacturerData.routes.manufacturerList);
    store.appendRecord(manufacturer);
  });
});
