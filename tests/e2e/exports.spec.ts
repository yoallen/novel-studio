import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import JSZip from 'jszip';
import { newNovel } from './helpers';

const nav = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Views' });

// A whole Claude export comes in as a zip; she finds one chat by name and brings it in word for word.
test('a chat is picked out of a Claude export zip and brought in whole', async ({ page }) => {
  const zip = new JSZip();
  zip.file('conversations.json', readFileSync(new URL('../fixtures/claude-export.json', import.meta.url)));
  zip.file('users.json', '[]');
  const buffer = await zip.generateAsync({ type: 'nodebuffer' });

  await newNovel(page, 'Exports');
  await nav(page).getByRole('button', { name: 'Conversations' }).click();
  await page.getByRole('button', { name: 'Bring in from a Claude or ChatGPT export' }).click();
  await page.getByLabel('Choose the export file').setInputFiles({ name: 'data-export.zip', mimeType: 'application/zip', buffer });
  // Searching what was said finds a chat whose name never mentions it.
  await page.getByRole('searchbox', { name: 'Find chats by name or by what was said' }).fill('Aretha');
  await expect(page.getByText('1 chat with "Aretha"')).toBeVisible();
  await expect(page.getByText('mentions it 1 time')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Writing funny with subtext and depth' }).click();
  await page.getByRole('button', { name: 'Bring in 1 chat' }).click();
  await expect(page.getByRole('status').first()).toContainText('Everything kept');
  await expect(page.getByRole('status').first()).toContainText('2 messages (1 from you); 3 behind-the-scenes steps (tools, reasoning) left out');
  await expect(page.getByText('already here')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Writing funny with subtext and depth' }).click();
  await expect(page.getByText('People would respect you more if you gave them something to respect!')).toBeVisible();
});
