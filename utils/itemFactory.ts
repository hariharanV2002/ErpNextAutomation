import { faker } from "@faker-js/faker";
import { ItemPayload } from "./types";

export interface ItemFactoryInput {
  codePrefix: string;
  itemGroup: string;
  revisionNumber: string;
  builtType: string;
  hsnCode: string;
}

export class ItemFactory {
  static create(input: ItemFactoryInput): ItemPayload {
    const randomDigits = Math.floor(Math.random() * 9000) + 1000;
    return {
      itemCode: `${input.codePrefix}-${randomDigits}`,
      itemName: faker.commerce.productName(),
      itemGroup: input.itemGroup,
      revisionNumber: input.revisionNumber,
      builtType: input.builtType,
      hsnCode: input.hsnCode
    };
  }
}
