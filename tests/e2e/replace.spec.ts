import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { newNovel, editor, TOKEN } from './helpers';

// Find and replace in her pages: she sees every change first, ticks what should change,
// and one Undo in the Story Trail puts every scene back.
const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });
const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}
async function sceneTexts(request: APIRequestContext, pid: string) {
  const o = await (await request.get(`/api/projects/${pid}/outline`, { headers: H })).json();
  const out: Record<string, string> = {};
  for (const c of o.chapters) for (const s of c.scenes) out[s.title] = (await (await request.get(`/api/scenes/${s.id}`, { headers: H })).json()).text;
  return out;
}

test('replace a name across her pages, see it first, and undo it in one step', async ({ page, request }) => {
  await newNovel(page, 'The Keeper of Gull Point');
  const pid = await pidOf(request, 'The Keeper of Gull Point');
  const ch = await (await request.post(`/api/projects/${pid}/chapters`, { headers: H, data: { title: 'Fog Week' } })).json();
  await request.post(`/api/chapters/${ch.id}/scenes`, { headers: H, data: { title: 'The empty boat', text: 'Ana ran to the dock. Marisol ate a banana. Ana waved.' } });
  await request.post(`/api/chapters/${ch.id}/scenes`, { headers: H, data: { title: 'Logbook', text: 'Cyrus Hale wrote that Ana was late.' } });

  // Typing on the open page that has not been saved yet is counted too.
  await nav(page).getByRole('button', { name: 'The Writing Room' }).click();
  await editor(page).click();
  await page.keyboard.type('Ana came back to Port Ellery.');
  await nav(page).getByRole('button', { name: 'Search' }).click();

  await page.getByRole('button', { name: 'Replace in your pages' }).click();
  await expect(page.getByText('This changes only your pages')).toBeVisible();
  await page.getByLabel('Find').fill('Ana');
  await page.getByLabel('Replace with').fill('Ana Ruiz');
  // Whole words only is on: banana is not a match.
  await expect(page.getByText('4 matches in 3 scenes. 4 ticked.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Chapter 2: Fog Week' })).toBeVisible();
  // Leave the second Ana in the empty boat as it is.
  await page.getByRole('checkbox', { name: 'The empty boat, match 2' }).uncheck();
  await page.getByRole('button', { name: 'Replace 3 in 3 scenes' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Replaced 3 in 3 scenes. To undo, use Story Trail.' })).toBeVisible();

  let texts = await sceneTexts(request, pid);
  expect(texts['The empty boat']).toBe('Ana Ruiz ran to the dock. Marisol ate a banana. Ana waved.');
  expect(texts['Logbook']).toBe('Cyrus Hale wrote that Ana Ruiz was late.');
  expect(Object.values(texts)).toContain('Ana Ruiz came back to Port Ellery.');

  await page.getByRole('button', { name: 'Open Story Trail' }).click();
  const row = page.locator('.trail-row').filter({ hasText: 'Replaced "Ana" with "Ana Ruiz" in 3 places in 3 scenes' });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /^Undo/ }).click();
  await expect(page.locator('.trail-row').filter({ hasText: 'Undid: Replaced "Ana"' })).toBeVisible();

  texts = await sceneTexts(request, pid);
  expect(texts['The empty boat']).toBe('Ana ran to the dock. Marisol ate a banana. Ana waved.');
  expect(texts['Logbook']).toBe('Cyrus Hale wrote that Ana was late.');
  expect(Object.values(texts)).toContain('Ana came back to Port Ellery.');
});
