import { test, expect, APIRequestContext } from '@playwright/test';
import { newNovel, TOKEN, editor, heroWrite, waitSaved } from './helpers';

const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}
const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// The bar chart is gone: the push is drawn as the shape of the book, and words move her along it.
test('the shape of the book: words move her along it, her beats are written on it, the coach writes in the same pen', async ({ page, request }) => {
  await newNovel(page, 'Shape One');
  const pid = await pidOf(request, 'Shape One');
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'November', start: day(-1), end: day(28), words: 100 } } });
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  await request.put(`/api/projects/${pid}/day-goal`, { headers: H, data: { day: day(1), words: 0 } });
  await page.reload();
  const views = page.getByRole('navigation', { name: 'Views' });
  await heroWrite(page).click();
  await editor(page).click();
  await page.keyboard.type(Array.from({ length: 40 }, (_, i) => `w${i}`).join(' ') + '.');
  await waitSaved(page);
  await views.getByRole('button', { name: /Where was I/ }).click();

  const shape = page.getByRole('img', { name: /^The shape of the book/ });
  await expect(shape).toHaveAttribute('aria-label', /40% of the way, 40 of 100 words/);
  // With no target length, the line is as long as the push would make the book, and it says so.
  await expect(page.locator('.book-shape-note')).toContainText('The line is as long as November would make the book');
  await expect(shape).toContainText('you are here, day 2');
  await expect(shape).toContainText('Fun and Games');
  await expect(shape).toContainText('Midpoint');
  await expect(shape).toContainText('THE END');
  // With a target length, the line is the whole book: 40 words of 1,000 is 4%, and the push is a stretch of it.
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { targetWords: 1000 } });
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await expect(shape).toHaveAttribute('aria-label', /4% of the way, 40 of 1,000 words/);
  await expect(page.locator('.book-shape-note')).toHaveCount(0);
  await expect(shape.locator('.push-lbl')).toHaveText('November ends here');
  await expect(page.locator('.coach-when')).toHaveText('November, day 2 of 30');
  // No more columns: the days are still listed for a screen reader.
  await expect(page.locator('.tally')).toHaveCount(0);
  await expect(page.getByRole('list', { name: /^Words each day/ }).getByRole('listitem')).toHaveCount(30);
  // One pen: the coach's note and the shape share a hand.
  const pen = await page.locator('.coach-body').last().evaluate((e) => getComputedStyle(e).fontFamily);
  expect(pen).toContain('Just Another Hand');
  await expect(page.locator('.coach-ribbon')).toHaveCount(0);
  if (process.env.SHOT_DIR) { await page.locator('.coach').screenshot({ path: `${process.env.SHOT_DIR}/today-coach.png` }); await page.locator('.drafting').screenshot({ path: `${process.env.SHOT_DIR}/today-shape.png` }); }
});
