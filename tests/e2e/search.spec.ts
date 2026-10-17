import { test, expect } from '@playwright/test';
import { newNovel } from './helpers';

const nav = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Views' });

// Every search result opens where it lives: a message opens inside its conversation, marked.
test('a search result opens its conversation at the very message', async ({ page }) => {
  await newNovel(page, 'Search opens');
  await nav(page).getByRole('button', { name: 'Conversations' }).click();
  await page.getByRole('button', { name: 'Bring in a conversation' }).click();
  await page.getByLabel('Name').fill('Theme talk');
  await page.getByLabel('The conversation').fill('### Yolanda Allen | 2026-10-13 | text\n\nAnthony says it to Kevin: people would respect you more if you gave them something to respect.\n\n### Claude | 2026-10-13 | text\n\nNow it works.');
  await page.getByRole('button', { name: 'Bring it in' }).click();
  await page.getByRole('button', { name: 'Open it' }).click();
  await nav(page).getByRole('button', { name: 'Search' }).click();
  await page.getByRole('searchbox', { name: 'Search this novel' }).fill('something to respect');
  await page.getByRole('button', { name: 'Theme talk' }).click();
  await expect(page.getByRole('heading', { name: 'Theme talk' })).toBeVisible();
  await expect(page.locator('section.found')).toContainText('gave them something to respect');
});
