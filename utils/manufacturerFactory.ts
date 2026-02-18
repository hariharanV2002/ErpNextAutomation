import { faker } from "@faker-js/faker";
import { ItemManufacturerPayload, ManufacturerPayload } from "./types";

export class ManufacturerFactory {
  static createManufacturer(): ManufacturerPayload {
    const short = `MFR${Math.floor(Math.random() * 900000 + 100000)}`.slice(0, 12);
    return {
      shortName: short,
      fullName: `${short} ${faker.company.name()}`.slice(0, 80),
      website: `https://www.${short.toLowerCase()}.com`
    };
  }

  static createItemManufacturer(itemCode: string, manufacturer: string): ItemManufacturerPayload {
    const suffix = Math.floor(Math.random() * 900 + 100);
    return {
      itemCode,
      manufacturer,
      manufacturerPartNumber: `MPN-${suffix}`
    };
  }
}
