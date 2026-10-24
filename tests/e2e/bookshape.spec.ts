import { test, expect, APIRequestContext } from '@playwright/test';
import { newNovel, TOKEN, editor, heroWrite, waitSaved } from './helpers';

const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}
const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// Two measures, kept apart: the book map at the top (the whole book and its beats) and the push below
// (only how far into the push's word goal). A push never lands on a beat.
test('the book map and the push are separate: beats belong to the book, the push only to its goal', async ({ page, request }) => {
  await newNovel(page, 'Shape One');
  const pid = await pidOf(request, 'Shape One');
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'Nothing Push', start: day(-1), end: day(28), words: 100 } } });
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  await page.reload();
  await heroWrite(page).click();
  await editor(page).click();
  await page.keyboard.type(Array.from({ length: 40 }, (_, i) => `w${i}`).join(' ') + '.');
  await waitSaved(page);
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();

  // With no target length, the map shows the beats and asks for a length; it shows no place yet.
  const map = page.locator('.book-map');
  await expect(map).toContainText('Midpoint');
  await expect(map.locator('.book-shape-note')).toContainText("Set your book's target length");
  await expect(map).not.toContainText('you are here');

  // The push: 40 of 100, on its own line, with no beat on it.
  const push = page.getByRole('img', { name: /^Nothing Push: 40 of 100 words/ });
  await expect(push).toContainText('halfway');
  await expect(push).toContainText('goal, 100 words');
  await expect(push).toContainText('you are here, day 2');
  await expect(push).not.toContainText('Midpoint');
  await expect(page.locator('.drafting')).not.toContainText('The whole book');
  await expect(page.locator('.drafting')).toContainText("Today's share of Nothing Push is");

  // With a target length, the map places her in the whole book: 40 of 1,000 is 4%.
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { targetWords: 1000 } });
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await expect(page.getByRole('img', { name: /^Your book: 4% of the way, 40 of 1,000 words/ })).toBeVisible();
  await expect(map).toContainText('you are here');
  // The map sits above Next.
  const mapTop = (await map.boundingBox())!.y, nextTop = (await page.locator('.hero').boundingBox())!.y;
  expect(mapTop).toBeLessThan(nextTop);
  await expect(page.locator('.tally')).toHaveCount(0);
  await expect(page.getByRole('list', { name: /^Words each day/ }).getByRole('listitem')).toHaveCount(30);
  // One pen for the coach's titles; Caslon italic in plum for its sentences.
  expect(await page.locator('.coach-note h3').evaluate((e) => getComputedStyle(e).fontFamily)).toContain('Just Another Hand');
  expect(await page.locator('.coach-body').last().evaluate((e) => getComputedStyle(e).fontStyle)).toBe('italic');
});

test('finishing a draft: a button she has to mean, the coach says so for a week, and the shelf remembers', async ({ page, request }) => {
  await newNovel(page, 'Done Book');
  const pid = await pidOf(request, 'Done Book');
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { targetWords: 1000 } });
  await page.reload();
  await heroWrite(page).click();
  await editor(page).click();
  await page.keyboard.insertText('A short draft, finished whenever she says so.');
  await waitSaved(page);
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  const map = page.locator('.book-map');
  // There from the day the book is made: Story Canon never guesses when a draft is done.
  await map.getByRole('button', { name: 'I finished this draft' }).click();
  await expect(map.getByRole('group', { name: 'Finish this draft' })).toContainText('Mark the first draft of Done Book finished?');
  await map.getByRole('button', { name: 'Not yet' }).click();
  await expect(map.locator('.finished-note')).toHaveCount(0);
  await map.getByRole('button', { name: 'I finished this draft' }).click();
  if (process.env.SHOT_DIR) { await page.setViewportSize({ width: 1440, height: 1100 }); await page.screenshot({ path: `${process.env.SHOT_DIR}/finish-confirm.png` }); }
  await map.getByRole('button', { name: "Yes, I'm finished with this draft" }).click();
  await expect(map.locator('.finished-note')).toContainText('You finished the first draft of Done Book');
  if (process.env.SHOT_DIR) { await page.setViewportSize({ width: 1440, height: 1100 }); await page.screenshot({ path: `${process.env.SHOT_DIR}/finished.png` }); }
  await page.getByRole('tab', { name: /The shelf/ }).click();
  await expect(page.locator('.ms-say')).toContainText('First draft finished');
});
