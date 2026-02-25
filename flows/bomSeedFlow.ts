import { DataStore } from "../utils/dataStore";
import { ItemFactory, SeedItemPayload } from "../utils/itemFactory";
import { ManufacturerFactory } from "../utils/manufacturerFactory";
import {
  BomItemRole,
  CreatedItemManufacturerRecord,
  CreatedItemRecord,
  CreatedManufacturerRecord
} from "../utils/types";
import { ItemFlow } from "./itemFlow";
import { ItemManufacturerFlow } from "./itemManufacturerFlow";

interface ItemSeedConfig {
  codePrefix: string;
}

interface RawMaterialSeedConfig extends ItemSeedConfig {
  catalog: string[];
}

interface SubassemblySeedConfig extends ItemSeedConfig {
  namePrefix: string;
  itemGroups: string[];
}

interface BomSeedInput {
  itemListRoute: string;
  itemManufacturerListRoute: string;
  expectedSavedText: string;
  rawMaterialCount: number;
  commonDefaults: {
    revisionNumber: string;
    builtType: string;
    hsnCode: string;
  };
  itemSeeds: {
    rawMaterial: RawMaterialSeedConfig;
    subassembly: SubassemblySeedConfig;
  };
}

export interface BomSeedResult {
  rawMaterials: SeedItemPayload[];
  subassembly: SeedItemPayload;
  latestManufacturer: CreatedManufacturerRecord;
  subassemblyManufacturerRecord: CreatedItemManufacturerRecord;
}

export class BomSeedFlow {
  constructor(
    private readonly itemFlow: ItemFlow,
    private readonly itemManufacturerFlow: ItemManufacturerFlow,
    private readonly itemStore: DataStore,
    private readonly manufacturerStore: DataStore,
    private readonly itemManufacturerStore: DataStore
  ) {}

  async createBomSeedData(input: BomSeedInput): Promise<BomSeedResult> {
    const latestManufacturer = this.manufacturerStore.getLast<CreatedManufacturerRecord>();
    if (!latestManufacturer) {
      throw new Error("No created manufacturer found in JSON. Run manufacturer positive test first.");
    }

    if (input.itemSeeds.rawMaterial.catalog.length < input.rawMaterialCount) {
      throw new Error("Raw material catalog must include at least the configured rawMaterialCount.");
    }

    const selectedRawMaterials = this.pickUniqueRandom(input.itemSeeds.rawMaterial.catalog, input.rawMaterialCount);
    const rawMaterials = selectedRawMaterials.map((materialLabel) =>
      this.buildRawMaterialItem(materialLabel, input.commonDefaults, input.itemSeeds.rawMaterial)
    );
    const subassembly = this.buildSubassemblyItem(input.commonDefaults, input.itemSeeds.subassembly);

    for (const item of [...rawMaterials, subassembly]) {
      await this.itemFlow.openNewItemFromList(input.itemListRoute);
      await this.itemFlow.createItem(item, input.expectedSavedText);
      await this.itemFlow.verifyInList(item, input.itemListRoute, { validateItemGroup: false });
      this.itemStore.appendRecord({ ...item, itemRole: item.itemRole, source: "bom_seed" });
    }

    const subassemblyManufacturer = ManufacturerFactory.createItemManufacturer(
      subassembly.itemCode,
      latestManufacturer.shortName
    );
    await this.itemManufacturerFlow.openNewFromList(input.itemManufacturerListRoute);
    await this.itemManufacturerFlow.createInQuickEntryWithExistingValues(subassemblyManufacturer, input.expectedSavedText);
    await this.itemManufacturerFlow.verifyInList(subassemblyManufacturer, input.itemManufacturerListRoute);

    const subassemblyManufacturerRecord: CreatedItemManufacturerRecord = {
      ...subassemblyManufacturer,
      itemRole: "subassembly",
      source: "bom_seed",
      createdAt: new Date().toISOString()
    };
    this.itemManufacturerStore.appendRecord({
      itemCode: subassemblyManufacturerRecord.itemCode,
      manufacturer: subassemblyManufacturerRecord.manufacturer,
      manufacturerPartNumber: subassemblyManufacturerRecord.manufacturerPartNumber,
      itemRole: subassemblyManufacturerRecord.itemRole,
      source: subassemblyManufacturerRecord.source
    });

    return {
      rawMaterials,
      subassembly,
      latestManufacturer,
      subassemblyManufacturerRecord
    };
  }

  private buildRawMaterialItem(
    materialLabel: string,
    defaults: BomSeedInput["commonDefaults"],
    seed: RawMaterialSeedConfig
  ): SeedItemPayload {
    const generated = ItemFactory.create({
      codePrefix: seed.codePrefix,
      itemGroup: materialLabel,
      revisionNumber: defaults.revisionNumber,
      builtType: defaults.builtType,
      hsnCode: defaults.hsnCode
    });
    return {
      ...generated,
      itemName: materialLabel,
      itemRole: "raw_material"
    };
  }

  private buildSubassemblyItem(
    defaults: BomSeedInput["commonDefaults"],
    seed: SubassemblySeedConfig
  ): SeedItemPayload {
    if (!seed.itemGroups.length) {
      throw new Error("Subassembly seed must include at least one item group.");
    }
    const selectedSubassemblyGroup = seed.itemGroups[Math.floor(Math.random() * seed.itemGroups.length)];
    const normalizedSelected = selectedSubassemblyGroup.toLowerCase().replace(/\s+/g, " ").trim();
    if (normalizedSelected === "raw material" || normalizedSelected === "raw materials") {
      throw new Error("Subassembly item group cannot be Raw Material/Raw Materials.");
    }

    return ItemFactory.createSeedItem(
      {
        codePrefix: seed.codePrefix,
        itemGroup: selectedSubassemblyGroup,
        revisionNumber: defaults.revisionNumber,
        builtType: defaults.builtType,
        hsnCode: defaults.hsnCode
      },
      "subassembly",
      seed.namePrefix
    );
  }

  getLastCreatedItem(): CreatedItemRecord | null {
    return this.itemStore.getLast<CreatedItemRecord>();
  }

  private pickUniqueRandom(values: string[], count: number): string[] {
    const shuffled = [...values];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
}
