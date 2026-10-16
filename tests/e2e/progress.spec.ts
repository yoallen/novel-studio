import { test, expect } from '@playwright/test';
import { newNovel, waitSaved, editor, heroWrite } from './helpers';

// November in miniature: a daily goal and a writing push set in Settings; words typed today
// show on Where was I as today's column, in ink once the goal is met.
test('drafting progress: a push and a daily goal, tracked day by day on Where was I', async ({ page }) => {
  await newNovel(page, 'Push Test');
  const views = page.getByRole('navigation', { name: 'Views' });
  const day = (offset: number) => page.evaluate((o) => { const d = new Date(); d.setDate(d.getDate() + o); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }, offset);

  await views.getByRole('button', { name: 'Settings' }).click();
  const push = page.getByRole('region', { name: 'A writing push' });
  await push.getByRole('button', { name: 'Plan a writing push' }).click();
  await push.getByLabel('Name it').fill('The sprint');
  await push.getByLabel('First day').fill(await day(-2));
  await push.getByLabel('Last day').fill(await day(7));
  await push.getByLabel('Words to write in it').fill('50');
  await expect(push).toContainText('about 5 words a day for 10 days');
  await push.getByRole('button', { name: 'Make that my daily goal' }).click();
  await page.getByRole('button', { name: 'Save settings' }).click();

  await views.getByRole('button', { name: 'Where was I' }).click();
  const progress = page.getByRole('region', { name: 'The sprint' });
  await expect(progress).toContainText('Today, 0 words of your 5.');
  await expect(progress.getByRole('list', { name: /^Words each day/ }).getByRole('listitem')).toHaveCount(10);

  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('One two three four five six seven.');
  await waitSaved(page);

  await views.getByRole('button', { name: 'Where was I' }).click();
  await expect(progress).toContainText('Today, 7 words of your 5. The day’s goal is met.');
  const today = progress.locator('li[data-today]');
  await expect(today).toHaveAttribute('data-mark', 'ink');
  await expect(today).toHaveAttribute('aria-label', /7 words, goal met/);
  await expect(progress).toContainText('So far7 of 50');
  await expect(progress).toContainText('Days in a row1');
  await expect(progress).toContainText('about 6 a day, 8 days left');
});
