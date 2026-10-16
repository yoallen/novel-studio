import { expect, Page } from '@playwright/test';
export const TOKEN = 'e2etoken0123456789';
export async function open(page: Page) { await page.goto('/#t=' + TOKEN); }
export async function newNovel(page: Page, title: string) {
  await open(page);
  await page.getByLabel('Working title').fill(title);
  await page.getByRole('button', { name: 'Start writing' }).click();
  await expect(heroWrite(page)).toBeVisible();
}
export async function waitSaved(page: Page) { await expect(page.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible({ timeout: 10_000 }); }
export const editor = (page: Page) => page.locator('.ProseMirror');
export const heroWrite = (page: Page) => page.locator('.hero').getByRole('button', { name: 'Write' });
