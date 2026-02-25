import { faker } from "@faker-js/faker";
import { BomItemRole, ItemPayload } from "./types";

export interface ItemFactoryInput {
  codePrefix: string;
  itemGroup: string;
  revisionNumber: string;
  builtType: string;
  hsnCode: string;
}

export interface SeedItemPayload extends ItemPayload {
  itemRole: BomItemRole;
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

  static createSeedItem(
    input: ItemFactoryInput,
    itemRole: BomItemRole,
    namePrefix: string
  ): SeedItemPayload {
    const generated = this.create(input);
    return {
      ...generated,
      itemName: `${namePrefix} ${generated.itemName}`.slice(0, 120),
      itemRole
    };
  }
}
