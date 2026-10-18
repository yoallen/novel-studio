import { test, expect } from '@playwright/test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { open } from './helpers';

test('a brand-new second computer can turn on sharing from the Library, with no novel open', async ({ page }) => {
  await open(page);
  const sec = page.locator('#other-computers');
  await expect(sec.getByRole('heading', { name: 'Your other computers' })).toBeVisible();
  const dir = mkdtempSync(join(tmpdir(), 'sc-share-'));
  await sec.getByLabel('Call this computer').fill('Surface');
  await sec.getByLabel('Shared folder').fill(dir);
  await sec.getByRole('button', { name: 'Share through this folder' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sharing is on' })).toContainText('On your other computers');
  await expect(sec.getByText('This computer is')).toBeVisible();
  page.once('dialog', (d) => void d.accept());
  await sec.getByRole('button', { name: 'Stop sharing' }).click();
  await expect(sec.getByRole('button', { name: 'Share through this folder' })).toBeVisible();
});

test('the working-title reminder sits by the form, not under Your novels', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Start writing' }).click();
  await expect(page.locator('form .notice.error')).toContainText('Give the novel a working title first');
});
