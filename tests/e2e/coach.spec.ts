import { test, expect, APIRequestContext } from '@playwright/test';
import { newNovel, TOKEN } from './helpers';

const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}
const day = (offset: number) => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

test('the push coach: the day and its note, the pace, and the next scene when stuck; it can be turned off', async ({ page, request }) => {
  await newNovel(page, 'Coach One');
  const pid = await pidOf(request, 'Coach One');
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'November', start: day(-1), end: day(28), words: 50000 } } });
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  const board = await (await request.get(`/api/projects/${pid}/board`, { headers: H })).json();
  const beat = (k: string) => board.rows.flatMap((r: any) => r.beats).find((b: any) => b.key === k).id;
  const card = (await (await request.post(`/api/projects/${pid}/cards`, { headers: H, data: { title: 'The empty boat', beatId: beat('catalyst') } })).json()).id;
  await request.post(`/api/elements/${card}/statements`, { headers: H, data: { field: 'conflict', value: 'Marisol against the harbor board', status: 'established' } });
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  const coach = page.locator('.coach');
  await expect(coach).toContainText('Day 2 of 30');
  await expect(coach.locator('h3')).toHaveText('Write with the door closed');
  await expect(coach).toContainText('From Stephen King, On Writing.');
  await expect(coach).toContainText('behind an even pace');
  await coach.getByRole('button', { name: "I'm stuck" }).click();
  await expect(coach.locator('.coach-stuck')).toContainText('Write this next: The empty boat');
  await expect(coach.locator('.coach-stuck')).toContainText('Its conflict: Marisol against the harbor board');
  if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/coach.png` });
  await coach.getByRole('button', { name: 'Write this scene' }).click();
  await expect(page.getByRole('textbox').first()).toBeVisible();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await page.locator('.coach').getByRole('button', { name: 'Turn off the coach' }).click();
  await expect(page.locator('.coach')).toHaveCount(0);
  const s = await (await request.get(`/api/projects/${pid}/settings`, { headers: H })).json();
  expect(s.coach).toBe(false);
});
