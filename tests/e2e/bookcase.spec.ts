import { test, expect, APIRequestContext } from '@playwright/test';
import { newNovel, TOKEN, editor, heroWrite, waitSaved } from './helpers';

const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}
const day = (o: number) => { const d = new Date(); d.setDate(d.getDate() + o); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

test('the shelf page: the manuscript so far, and a shelf for every push; a push that ends gets its recap', async ({ page, request }) => {
  await newNovel(page, 'Shelf One');
  const pid = await pidOf(request, 'Shelf One');
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { authorName: 'Ana Reyes', targetWords: 1000, push: { name: 'Summer push', start: day(-60), end: day(-40), words: 2100 } } });
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'Fall Draft', start: day(-3), end: day(26), words: 3000 } } });
  await page.reload();
  await heroWrite(page).click(); await editor(page).click();
  await page.keyboard.insertText(Array.from({ length: 500 }, (_, i) => `w${i}`).join(' ') + '.'); await waitSaved(page);
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await page.getByRole('tab', { name: /The shelf/ }).click();
  await expect(page.getByRole('img', { name: /^Shelf One: 2 pages, 500 words/ })).toBeVisible();
  await expect(page.locator('.ms-say')).toContainText('2 pages');
  await expect(page.locator('.ms-say')).toContainText('At 1,000 words it will be about 4.');
  const shelves = page.locator('.bookcase .shelf-drawing');
  await expect(shelves).toHaveCount(2);
  await expect(shelves.first()).toHaveAttribute('aria-label', /^Fall Draft: 500 of 3,000 words, day 4 of 30/);
  await expect(shelves.nth(1)).toHaveAttribute('aria-label', /^Summer push: 0 of 2,100 words\. Finished\./);
  await expect(shelves.first()).toContainText('room for the rest');
  await expect(shelves.nth(1)).toContainText('THE END');
  if (process.env.SHOT_DIR) await page.locator('.shelf-page').screenshot({ path: `${process.env.SHOT_DIR}/shelf-page.png` });

  // The week after a push ends, the Today page shows its recap in place of the shape.
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'Fall Draft', start: day(-30), end: day(-1), words: 3000 } } });
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await page.getByRole('tab', { name: /Today/ }).click();
  await expect(page.locator('.recap')).toContainText('Fall Draft is over.');
  await expect(page.locator('.book-shape')).toHaveCount(0);
  if (process.env.SHOT_DIR) await page.locator('.drafting').screenshot({ path: `${process.env.SHOT_DIR}/recap.png` });
});
