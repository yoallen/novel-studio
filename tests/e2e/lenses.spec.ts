import { test, expect, Page } from '@playwright/test';
import { newNovel, editor, waitSaved, heroWrite } from './helpers';

const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });

test('Read it back shows echoes and watch words and selects them on the page; pacing and names read the whole book', async ({ page }) => {
  await newNovel(page, 'Lens Test');
  await heroWrite(page).click();
  await editor(page).click();
  await page.keyboard.type('Kevin walked to the window. He walked back and just stood there. Later Marla laughed at Marla and Marlla. ');
  await waitSaved(page);
  await page.getByRole('button', { name: 'Read it back' }).click();
  const panel = page.getByRole('complementary', { name: 'Read it back' });
  await expect(panel.getByRole('button', { name: 'Read the scene' })).toBeVisible();
  const echo = panel.getByRole('region', { name: 'Echoes' }).getByRole('button', { name: /walked ×2/ });
  await expect(echo).toBeVisible();
  await echo.click();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('walked');
  await expect(panel.getByRole('region', { name: 'Your watch words' })).toContainText('just ×1');

  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Pacing' }).click();
  await expect(page.getByRole('img', { name: /Scene lengths for 1 scene/ })).toBeVisible();
  await page.getByRole('tab', { name: 'Names' }).click();
  await expect(page.getByRole('region', { name: 'Possible misspellings' })).toContainText('"Marlla" appears 1 time');
});
