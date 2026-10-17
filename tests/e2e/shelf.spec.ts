import { test, expect } from '@playwright/test';
import { newNovel } from './helpers';

// A test novel can be taken off the Library shelf and put back, with nothing lost.
test('a novel is removed from the shelf and put back', async ({ page }) => {
  await newNovel(page, 'Shelf test');
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  const shelf = page.getByRole('list', { name: 'Your novels' });
  await expect(shelf.getByRole('button', { name: 'Shelf test', exact: true })).toBeVisible();
  page.once('dialog', (d) => { expect(d.message()).toContain('Nothing in it is deleted'); void d.accept(); });
  await page.getByRole('button', { name: 'Remove Shelf test from the shelf' }).click();
  await expect(shelf.getByRole('button', { name: 'Shelf test', exact: true })).toHaveCount(0);
  const removed = page.getByRole('region', { name: 'Removed novels' });
  await expect(removed).toContainText('Shelf test');
  await removed.getByRole('button', { name: 'Put Shelf test back on the shelf' }).click();
  await expect(shelf.getByRole('button', { name: 'Shelf test', exact: true })).toBeVisible();
});
