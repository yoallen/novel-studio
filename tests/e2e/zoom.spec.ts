import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { newNovel, TOKEN, editor } from './helpers';

const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });
const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}

test('zoom from the whole story to a scene and its page, and back, never losing the place (AC13, R-C-066, R-C-072)', async ({ page }) => {
  await newNovel(page, 'Zoom One');
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('button', { name: 'Use your Save the Cat beat sheet' }).click();
  await page.getByRole('button', { name: 'Act One' }).click();
  await page.getByRole('button', { name: '4. Catalyst' }).click();
  await expect(page.getByText('With the catlyst, we knock it all down.')).toBeVisible();
  await page.getByLabel('New scene card').fill('The fish guts');
  await page.getByRole('button', { name: 'Add scene card' }).click();
  await page.getByRole('button', { name: 'The fish guts' }).first().click();
  const crumbs = page.getByRole('navigation', { name: 'Where you are' });
  await expect(crumbs).toContainText('Zoom One');
  await expect(crumbs).toContainText('Act One');
  await expect(crumbs).toContainText('Catalyst');
  await page.getByRole('button', { name: 'Write this scene' }).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('The smell hit Anthony before the sun did.');
  await page.getByRole('button', { name: 'Show in Narrative Zoom' }).click();
  await expect(page.getByRole('heading', { name: 'The fish guts' })).toBeVisible();
  await expect(page.getByText('The smell hit Anthony before the sun did.')).toBeVisible();
  await crumbs.getByRole('button', { name: 'Act One' }).click();
  await expect(page.getByRole('heading', { name: 'Act One' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to Writing' }).click();
  await expect(editor(page)).toContainText('before the sun did.');
});

test('her placement models for her target length, at 250 and 300 words per page (R-C-007, R-C-008)', async ({ page, request }) => {
  await newNovel(page, 'Zoom Two');
  const pid = await pidOf(request, 'Zoom Two');
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { targetWords: 90000 } });
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Beats and placement' }).click();
  await expect(page.getByText('Based on your target of 90,000 words.')).toBeVisible();
  const cat = page.getByRole('row').filter({ hasText: '4. Catalyst' });
  await expect(cat).toContainText('10%, words 9,000');
  await expect(cat).toContainText('p. 36 at 250; p. 30 at 300');
});

test('moving a scene shows what it would change first; leaving it changes nothing; making it is one undoable step (R-C-075 to R-C-077)', async ({ page, request }) => {
  await newNovel(page, 'Zoom Three');
  const pid = await pidOf(request, 'Zoom Three');
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  const board = await (await request.get(`/api/projects/${pid}/board`, { headers: H })).json();
  const beat = (k: string) => board.rows.flatMap((r: any) => r.beats).find((b: any) => b.key === k).id;
  const find = await (await request.post(`/api/projects/${pid}/cards`, { headers: H, data: { title: 'Kevin finds the ledger', beatId: beat('all_is_lost') } })).json();
  const show = await (await request.post(`/api/projects/${pid}/cards`, { headers: H, data: { title: 'Kevin shows Anthony', beatId: beat('dark_night') } })).json();
  await request.post(`/api/projects/${pid}/links`, { headers: H, data: { fromId: find.id, toId: show.id, relation: 'causes' } });

  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Board' }).click();
  await page.getByRole('button', { name: 'Kevin shows Anthony' }).click();
  await page.getByRole('button', { name: 'Move…' }).click();
  await page.getByLabel('Move to beat').selectOption({ label: '8. Fun and Games' });
  await expect(page.getByRole('dialog')).toContainText('"Kevin shows Anthony" is caused by "Kevin finds the ledger", but would now come first in the book.');
  await page.getByRole('button', { name: 'Leave it' }).click();
  await expect(page.getByRole('navigation', { name: 'Where you are' })).toContainText('Dark Night of the Soul');

  await page.getByRole('button', { name: 'Move…' }).click();
  await page.getByLabel('Move to beat').selectOption({ label: '8. Fun and Games' });
  await page.getByRole('button', { name: 'Make this move' }).click();
  await expect(page.getByRole('navigation', { name: 'Where you are' })).toContainText('Fun and Games');
  await nav(page).getByRole('button', { name: 'Story Trail' }).click();
  await page.locator('li').filter({ hasText: 'Move "Kevin shows Anthony" to Fun and Games' }).getByRole('button', { name: 'Undo' }).click();
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await expect(page.getByRole('navigation', { name: 'Where you are' })).toContainText('Dark Night of the Soul');
});

test('an alternate structure is saved, compared without touching the story, and adopted (D-17, R-C-082)', async ({ page, request }) => {
  await newNovel(page, 'Zoom Four');
  const pid = await pidOf(request, 'Zoom Four');
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  const board = await (await request.get(`/api/projects/${pid}/board`, { headers: H })).json();
  const beat = (k: string) => board.rows.flatMap((r: any) => r.beats).find((b: any) => b.key === k).id;
  await request.post(`/api/projects/${pid}/cards`, { headers: H, data: { title: 'Ledger found', beatId: beat('all_is_lost') } });
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Board' }).click();
  await page.getByRole('button', { name: 'Ledger found' }).click();
  await page.getByRole('button', { name: 'Move…' }).click();
  await page.getByLabel('Move to beat').selectOption({ label: '9. Midpoint' });
  await page.getByLabel('Alternate name').fill('Ledger at the Midpoint');
  await page.getByRole('button', { name: 'Save as an alternate' }).click();
  await expect(page.getByRole('navigation', { name: 'Where you are' })).toContainText('All Is Lost');
  await page.getByRole('tab', { name: 'Alternate structures' }).click();
  await page.getByRole('button', { name: 'Compare' }).click();
  await expect(page.getByText('Ledger found: All Is Lost → Midpoint')).toBeVisible();
  await page.getByRole('button', { name: 'Adopt' }).click();
  await page.getByRole('tab', { name: 'Zoom' }).click();
  await expect(page.getByRole('navigation', { name: 'Where you are' })).toContainText('Midpoint');
});

test("I'm stuck: one beat, its example, one sentence, and that counts (R-B-021, R-C-006)", async ({ page, request }) => {
  await newNovel(page, 'Zoom Five');
  const pid = await pidOf(request, 'Zoom Five');
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  await page.locator('.hero').getByRole('button', { name: 'Write' }).click();
  await page.getByRole('button', { name: "I'm stuck" }).click();
  await expect(page.getByText('Read only this beat. Do not look at the others.')).toBeVisible();
  await expect(page.getByText(/Jack Torrance is interviewing for a job/)).toBeVisible();
  await page.getByLabel('One sentence of what happens at this beat').fill('Kevin waters the lawn like it owes him money.');
  await page.getByRole('button', { name: 'Save the sentence' }).click();
  await expect(page.getByText('Saved. That counts.')).toBeVisible();
});
