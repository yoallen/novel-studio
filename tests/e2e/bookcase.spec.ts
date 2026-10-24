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
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'Nothing Push', start: day(-20), end: day(-20), words: 30 } } });
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'Fall Draft', start: day(-3), end: day(10), words: 3000 } } });
  await page.reload();
  await heroWrite(page).click(); await editor(page).click();
  // A draft pasted in from elsewhere is kept, but it is not words written in the push.
  await page.locator('.ProseMirror').evaluate((el, text) => {
    const dt = new DataTransfer(); dt.setData('text/plain', text);
    el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  }, Array.from({ length: 300 }, (_, i) => `p${i}`).join(' ') + '. ');
  await page.keyboard.insertText(Array.from({ length: 500 }, (_, i) => `w${i}`).join(' ') + '.'); await waitSaved(page);
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await page.getByRole('tab', { name: /The shelf/ }).click();
  await expect(page.getByRole('img', { name: /^Shelf One: 3 pages, 800 words/ })).toBeVisible();
  await expect(page.locator('.ms-say')).toContainText('3 pages');
  // The push she is in, day by day, on a shelf as long as the push; the finished ones as single books.
  const shelves = page.locator('.bookcase .shelf-drawing');
  await expect(shelves).toHaveCount(2);
  await expect(shelves.first()).toHaveAttribute('aria-label', /^Fall Draft: 500 of 3,000 words, day 4 of 14/);
  await expect(shelves.first()).toContainText('10 more days');
  await expect(shelves.first()).not.toContainText('room for the rest');
  const done = page.locator('.finished-shelf');
  await expect(done).toContainText('Finished pushes');
  await expect(done).toContainText('Summer push');
  await expect(done).toContainText('Nothing Push');
  await expect(done).toHaveAttribute('aria-label', /Summer push, 0 of 2,100 words\. Nothing Push, 0 of 30 words\./);
  if (process.env.SHOT_DIR) { await page.setViewportSize({ width: 1440, height: 1400 }); await page.locator('.bookcase').screenshot({ path: `${process.env.SHOT_DIR}/shelf-page.png` }); }

  // The week after a push ends, the Today page shows its recap in place of the shape.
  // A running push is never replaced; she ends it early first. Then a push that is already over shows its recap.
  const refused = await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'Last Month', start: day(-30), end: day(-1), words: 3000 } } });
  expect(refused.status()).toBe(400);
  expect((await request.post(`/api/projects/${pid}/push/end`, { headers: H, data: {} })).ok()).toBe(true);
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'Last Month', start: day(-30), end: day(-1), words: 3000 } } });
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await page.getByRole('tab', { name: /Today/ }).click();
  await expect(page.locator('.recap')).toContainText('Last Month is over.');
  await expect(page.locator('.push-line')).toHaveCount(0);
  if (process.env.SHOT_DIR) await page.locator('.drafting').screenshot({ path: `${process.env.SHOT_DIR}/recap.png` });
});
