import fs from "node:fs";
import path from "node:path";
import { CreatedItemRecord, ItemPayload } from "./types";

export class DataStore {
  constructor(private readonly filePath: string) {}

  static ensureFile(filePath: string): void {
    const folder = path.dirname(filePath);
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
    }
  }

  append(item: ItemPayload): void {
    DataStore.ensureFile(this.filePath);
    const raw = fs.readFileSync(this.filePath, "utf-8");
    const list = JSON.parse(raw) as CreatedItemRecord[];
    list.push({ ...item, createdAt: new Date().toISOString() });
    fs.writeFileSync(this.filePath, JSON.stringify(list, null, 2), "utf-8");
  }

  appendRecord<T extends object>(record: T): void {
    DataStore.ensureFile(this.filePath);
    const raw = fs.readFileSync(this.filePath, "utf-8");
    const list = JSON.parse(raw) as Array<T & { createdAt: string }>;
    list.push({ ...record, createdAt: new Date().toISOString() });
    fs.writeFileSync(this.filePath, JSON.stringify(list, null, 2), "utf-8");
  }

  getAll<T>(): T[] {
    DataStore.ensureFile(this.filePath);
    const raw = fs.readFileSync(this.filePath, "utf-8");
    return JSON.parse(raw) as T[];
  }

  getLast<T>(): T | null {
    const list = this.getAll<T>();
    if (!list.length) {
      return null;
    }
    return list[list.length - 1];
  }
}
