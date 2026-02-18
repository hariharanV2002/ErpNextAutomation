import { expect, Locator, Page } from "@playwright/test";
import { selectors } from "../../selectors/selectors";
import { SelfHealingLocator } from "../../utils/selfHealingLocator";

export class CommonPage {
  private readonly healer: SelfHealingLocator;

  constructor(protected readonly page: Page) {
    this.healer = new SelfHealingLocator(page);
  }

  async get(candidates: readonly string[]): Promise<Locator> {
    return this.healer.resolve(candidates);
  }

  async clearThenType(candidates: readonly string[], value: string): Promise<void> {
    const input = await this.get(candidates);
    await input.click({ force: true });
    await input.clear();
    await input.fill(value);
  }

  async click(candidates: readonly string[]): Promise<void> {
    const element = await this.get(candidates);
    await element.click();
  }

  async selectAutocomplete(candidates: readonly string[], value: string): Promise<void> {
    await this.clearThenType(candidates, value);
    const option = this.page.locator(selectors.templates.autocompleteOptionByText(value)).first();

    if (await option.isVisible({ timeout: 3000 }).catch(() => false)) {
      await option.click();
      return;
    }

    const input = await this.get(candidates);
    await input.press("ArrowDown");
    await input.press("Enter");
  }

  async selectByLabel(candidates: readonly string[], value: string): Promise<void> {
    const select = await this.get(candidates);
    await select.selectOption({ label: value });
  }

  async expectDialogContains(text: string): Promise<void> {
    const bodies = this.page.locator(selectors.templates.dialogBodyByText(text));
    const count = await bodies.count();
    for (let i = 0; i < count; i += 1) {
      const body = bodies.nth(i);
      if (await body.isVisible().catch(() => false)) {
        await expect(body).toContainText(text);
        return;
      }
    }
    const fallbackMatches = this.page.locator(selectors.templates.visibleTextLocator(text));
    const fallbackCount = await fallbackMatches.count();
    for (let i = 0; i < fallbackCount; i += 1) {
      const candidate = fallbackMatches.nth(i);
      if (await candidate.isVisible().catch(() => false)) {
        await expect(candidate).toBeVisible();
        return;
      }
    }
    throw new Error(`No visible dialog/body text found for: ${text}`);
  }

  async expectDialogContainsAny(texts: string[]): Promise<void> {
    for (const text of texts) {
      const bodies = this.page.locator(selectors.templates.dialogBodyByText(text));
      const count = await bodies.count();
      for (let i = 0; i < count; i += 1) {
        const body = bodies.nth(i);
        const visible = await body.isVisible({ timeout: 8000 }).catch(() => false);
        if (visible) {
          await expect(body).toContainText(text);
          return;
        }
      }

      const fallbackMatches = this.page.locator(selectors.templates.visibleTextLocator(text));
      const fallbackCount = await fallbackMatches.count();
      for (let i = 0; i < fallbackCount; i += 1) {
        const candidate = fallbackMatches.nth(i);
        if (await candidate.isVisible().catch(() => false)) {
          await expect(candidate).toBeVisible();
          return;
        }
      }
    }
    throw new Error(`Dialog body did not match any expected text: ${texts.join(" | ")}`);
  }

  async expectDialogTitle(text: string): Promise<void> {
    const titles = this.page.locator(selectors.templates.dialogTitleByText(text));
    const count = await titles.count();
    for (let i = 0; i < count; i += 1) {
      const title = titles.nth(i);
      if (await title.isVisible().catch(() => false)) {
        await expect(title).toContainText(text);
        return;
      }
    }
    const fallbackMatches = this.page.locator(selectors.templates.visibleTextLocator(text));
    const fallbackCount = await fallbackMatches.count();
    for (let i = 0; i < fallbackCount; i += 1) {
      const candidate = fallbackMatches.nth(i);
      if (await candidate.isVisible().catch(() => false)) {
        await expect(candidate).toBeVisible();
        return;
      }
    }
    throw new Error(`No visible dialog/title text found for: ${text}`);
  }

  async closeDialogIfVisible(): Promise<void> {
    const close = this.page.locator(selectors.common.dialogClose.join(", ")).first();
    if (await close.isVisible().catch(() => false)) {
      await close.click();
    }
  }

  async expectToastContains(text: string): Promise<void> {
    const toast = this.page.locator(selectors.common.toast.join(", ")).first();
    await expect(toast).toBeVisible();
    await expect(toast).toContainText(text);
  }

  async expectRowVisibleByCellValue(value: string): Promise<Locator> {
    const row = this.page.locator(selectors.templates.listRowByText(value)).first();
    await expect(row).toBeVisible({ timeout: 15_000 });
    return row;
  }
}
