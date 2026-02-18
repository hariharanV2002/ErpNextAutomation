import { Locator, Page } from "@playwright/test";

export class SelfHealingLocator {
  constructor(private readonly page: Page) {}

  async resolve(candidates: readonly string[], timeoutMs = 1500): Promise<Locator> {
    for (const candidate of candidates) {
      const locatorGroup = this.page.locator(candidate);
      const count = await locatorGroup.count().catch(() => 0);
      for (let i = 0; i < count; i += 1) {
        const locator = locatorGroup.nth(i);
        const visible = await locator.isVisible({ timeout: timeoutMs }).catch(() => false);
        if (visible) {
          return locator;
        }
      }
    }

    throw new Error(`Self-heal failed. No selector matched: ${candidates.join(" | ")}`);
  }
}
