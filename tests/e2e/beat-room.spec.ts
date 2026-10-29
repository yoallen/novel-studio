import { test, expect, Page } from '@playwright/test';
import { newNovel, TOKEN } from './helpers';
const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });

// Jessica Brody's sizes: every beat says how much room it takes, and asks only when the cards do not fit.
test('a beat names itself on every page, says how much room it takes, and teaches what Brody teaches', async ({ page, request }) => {
  await newNovel(page, 'Room Book');
  const list = await (await request.get('/api/projects', { headers: H })).json();
  const pid = list.find((p: any) => p.title === 'Room Book').id;
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { targetWords: 80000 } });
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  const board = await (await request.get(`/api/projects/${pid}/board`, { headers: H })).json();
  const beat = (k: string) => board.rows.flatMap((r: any) => r.beats).find((b: any) => b.key === k).id;
  for (const t of ['The dog in the garden', 'The violation notice', 'Kevin vows war']) await request.post(`/api/projects/${pid}/cards`, { headers: H, data: { title: t, beatId: beat('catalyst') } });
  await request.post(`/api/projects/${pid}/cards`, { headers: H, data: { title: 'The first prank', beatId: beat('fun_and_games') } });
  await page.reload();
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('button', { name: 'Act One' }).click();
  await expect(page.getByText('10%, one scene')).toBeVisible();
  await expect(page.getByText('1% to 10%, several scenes')).toBeVisible();
  if (process.env.SHOT_DIR) { await page.setViewportSize({ width: 1440, height: 1000 }); await page.screenshot({ path: `${process.env.SHOT_DIR}/room-act-one.png` }); }
  await page.getByRole('button', { name: '4. Catalyst' }).click();
  await expect(page.locator('.record-page-head').first()).toHaveText(/About this beat: Catalyst/);
  await expect(page.getByText('Scene type:')).toHaveCount(0);
  const room = page.locator('.beat-room').first();
  await expect(room).toContainText('A single-scene beat.');
  await expect(room.locator('.room-question')).toContainText('In your book: 3 scene cards. A single-scene beat lands in one scene or one chapter. Is all of this the Catalyst, or is some of it the Debate?');
  await expect(page.locator('.beat-room').nth(1)).toContainText('Questions to check it');
  await expect(page.locator('.beat-room').nth(1)).toContainText('Story Canon is not affiliated with or endorsed by Jessica Brody or Save the Cat!');
  if (process.env.SHOT_DIR) { await room.scrollIntoViewIfNeeded(); await page.screenshot({ path: `${process.env.SHOT_DIR}/room-catalyst.png` }); await page.locator('.beat-room').nth(1).scrollIntoViewIfNeeded(); await page.screenshot({ path: `${process.env.SHOT_DIR}/room-catalyst-brody.png` }); }
  await page.getByRole('tab', { name: /In this book/ }).click();
  await expect(page.locator('.record-page-head')).toHaveText(/In this book: Catalyst/);

  await page.getByRole('navigation', { name: 'Where you are' }).getByRole('button').first().click();
  await page.getByRole('button', { name: 'Act Two, first half' }).click();
  await page.getByRole('button', { name: '8. Fun and Games' }).click();
  const fg = page.locator('.beat-room').first();
  await expect(fg).toContainText('A multi-scene beat. It spans several scenes or chapters, from 20% to 50% of the book');
  await expect(fg).toContainText('At your target of 80,000 words, that is about 24,000 words.');
  await expect(fg.locator('.room-question')).toContainText('In your book: 1 scene card so far. It spans several scenes or chapters. Is it getting the room it needs?');
  if (process.env.SHOT_DIR) { await fg.scrollIntoViewIfNeeded(); await page.screenshot({ path: `${process.env.SHOT_DIR}/room-fun-and-games.png` }); }

  await page.getByRole('tab', { name: 'Story review' }).click();
  await expect(page.getByText(/Catalyst is a single-scene beat and holds 3 scene cards/)).toBeVisible();
});
