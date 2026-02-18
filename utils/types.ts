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

export interface CreatedItemManufacturerRecord extends ItemManufacturerPayload {
  createdAt: string;
}
