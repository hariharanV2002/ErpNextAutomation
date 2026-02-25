export interface ItemPayload {
  itemCode: string;
  itemName: string;
  itemGroup: string;
  revisionNumber: string;
  builtType: string;
  hsnCode: string;
}

export interface CreatedItemRecord extends ItemPayload {
  createdAt: string;
  itemRole?: BomItemRole;
  source?: string;
}

export interface ManufacturerPayload {
  shortName: string;
  fullName: string;
  website: string;
}

export interface CreatedManufacturerRecord extends ManufacturerPayload {
  createdAt: string;
}

export interface ItemManufacturerPayload {
  itemCode: string;
  manufacturer: string;
  manufacturerPartNumber: string;
}

export interface PurchaseItemPricePayload {
  itemCode: string;
  uom: string;
  priceList: string;
  supplier?: string;
  priceListRate: string;
}

export interface CreatedItemPriceRecord extends PurchaseItemPricePayload {
  counterpartyType: "supplier" | "customer";
  counterpartyValue: string;
}

export interface CreatedItemManufacturerRecord extends ItemManufacturerPayload {
  createdAt: string;
  itemRole?: BomItemRole;
  source?: string;
}

export type BomItemRole = "raw_material" | "subassembly" | "main_fg";
