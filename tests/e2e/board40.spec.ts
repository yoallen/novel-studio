import { test, expect, APIRequestContext } from '@playwright/test';
import { newNovel, TOKEN } from './helpers';

const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}
const say = (request: APIRequestContext, id: string, field: string, value: string) =>
  request.post(`/api/elements/${id}/statements`, { headers: H, data: { field, value, status: 'established' } });

test("the Board numbers cards, counts each row, and shows each card's turn and conflict", async ({ page, request }) => {
  await newNovel(page, 'Board Forty');
  const pid = await pidOf(request, 'Board Forty');
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  const board = await (await request.get(`/api/projects/${pid}/board`, { headers: H })).json();
  const beat = (k: string) => board.rows.flatMap((r: any) => r.beats).find((b: any) => b.key === k).id;
  const add = async (title: string, k: string) => (await (await request.post(`/api/projects/${pid}/cards`, { headers: H, data: { title, beatId: beat(k) } })).json()).id as string;
  const a = await add('The lamp at dusk', 'opening_image');
  const b = await add('The empty boat', 'catalyst');
  await add('The light goes dark', 'all_is_lost');
  await say(request, b, 'value_start', 'Safety +');
  await say(request, b, 'value_end', 'Safety -');
  await say(request, b, 'conflict', 'Marisol against the harbor board');
  await say(request, a, 'value_start', 'Calm +');
  await say(request, a, 'value_end', 'Calm +');
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Board' }).click();
  await page.getByText('How the Board works').click();
  await expect(page.getByText("This is Blake Snyder's Board")).toBeVisible();
  const act1 = page.locator('.board-act').first();
  await expect(act1.locator('h2')).toContainText('2 cards. A full row is about 10.');
  const boat = page.locator('.board-card', { hasText: 'The empty boat' });
  await expect(boat.locator('.card-no')).toHaveText('2');
  await expect(boat.locator('.card-turn')).toContainText('+ to -');
  await expect(boat.locator('.card-conflict')).toHaveText('><');
  const lamp = page.locator('.board-card', { hasText: 'The lamp at dusk' });
  await expect(lamp).toContainText('no turn yet?');
  await expect(lamp).toContainText('no conflict yet');
  if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/board.png`, fullPage: false });
});
