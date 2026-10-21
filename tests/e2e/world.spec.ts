import { test, expect } from '@playwright/test';
import { newNovel } from './helpers';

// Choosing a speculative genre opens the worldbuilding kit in the Story Brain.
test('fantasy opens the worldbuilding kit: kinds of beings, magic, world history and more', async ({ page }) => {
  await newNovel(page, 'Aruria');
  await page.getByRole('region', { name: 'Plant the seed' }).getByRole('button', { name: 'Not now' }).click();
  const views = page.getByRole('navigation', { name: 'Views' });
  await views.getByRole('button', { name: 'Story Brain' }).click();
  await expect(page.getByRole('button', { name: /Kinds of beings/ })).toHaveCount(0);
  await views.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Open novel setup' }).click();
  await page.getByRole('tab', { name: /Genres/ }).click();
  await page.getByRole('region', { name: 'Genres' }).getByLabel('Fantasy', { exact: true }).click();
  await expect(page.getByRole('region', { name: 'Genres' }).getByLabel('Fantasy', { exact: true })).toBeChecked();
  await views.getByRole('button', { name: 'Story Brain' }).click();
  for (const k of ['Kinds of beings', 'Magic and powers', 'Cultures and peoples', 'World history', 'In-world documents']) {
    await expect(page.getByRole('complementary', { name: 'Story Brain sections' }).getByRole('button', { name: new RegExp(`^${k}`) })).toBeVisible();
  }
});
