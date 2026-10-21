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
  await page.getByRole('button', { name: 'Use this beat sheet' }).click();
  await page.getByRole('button', { name: 'Act One' }).click();
  await page.getByRole('button', { name: '4. Catalyst' }).click();
  await expect(page.getByText('With the catlyst, we knock it all down.')).toBeVisible();
  await page.getByRole('tab', { name: /Scenes here/ }).click();
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
  await page.getByRole('tab', { name: /The page so far/ }).click();
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
  await page.getByRole('tab', { name: 'Where beats fall' }).click();
  await expect(page.getByText('Based on your target of 90,000 words.')).toBeVisible();
  const cat = page.getByRole('row').filter({ hasText: '4. Catalyst' });
  await expect(cat.getByRole('cell').nth(1)).toHaveText('10%');
  await expect(cat.getByRole('cell').nth(2)).toHaveText('9,000');
  await expect(cat).toContainText('p. 36 at 250; p. 30 at 300');
  await expect(page.getByRole('row').filter({ hasText: '3. Setup' }).getByRole('cell').nth(1)).toHaveText('1% to 10%');
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


test('with no target length, Where beats fall says so plainly and offers to set one (finding 82)', async ({ page, request }) => {
  await newNovel(page, 'Zoom Six');
  const pid = await pidOf(request, 'Zoom Six');
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Where beats fall' }).click();
  await expect(page.getByText('Your book has no target length yet')).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Around word' })).toHaveCount(0);
  await page.getByLabel('Target length in words').fill('90000');
  await page.getByRole('button', { name: 'Set the target' }).click();
  await expect(page.getByText('Based on your target of 90,000 words.')).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: '4. Catalyst' }).getByRole('cell').nth(2)).toHaveText('9,000');
});

test('the overview shows the three worlds above their acts; a beat page credits its example and places existing cards (findings 43, 47, 56, 57)', async ({ page, request }) => {
  await newNovel(page, 'Zoom Seven');
  const pid = await pidOf(request, 'Zoom Seven');
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  await request.post(`/api/projects/${pid}/cards`, { headers: H, data: { title: 'Kevin waters the lawn' } });
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Zoom' }).click();
  const overview = page.locator('.story-overview');
  await expect(overview.locator('li').nth(0)).toContainText('Thesis World');
  await expect(overview.locator('li').nth(1)).toContainText('Act One');
  await expect(overview.locator('li').nth(2)).toContainText('Antithesis World');
  await expect(overview.locator('li').nth(3)).toContainText('Act Two, first half');
  await expect(overview.locator('li').nth(5)).toContainText('Synthesis World');
  await expect(overview.locator('li').nth(6)).toContainText('Act Three');
  await overview.getByText('Read the full description from the beat sheet').first().click();
  await expect(page.getByText('If events that follow did not occur')).toBeVisible();

  await page.getByRole('button', { name: 'Act One' }).click();
  await expect(page.locator('.act-beats > li').filter({ hasText: 'Theme Stated' })).toContainText('5%, during Setup');
  await page.getByRole('button', { name: '1. Opening Image' }).click();
  const ex = page.locator('.sheet-example');
  await expect(ex).toContainText('An example from the beat sheet, from The Shining by Stephen King');
  await expect(ex).toContainText('Jack Torrance is interviewing for a job');
  await page.getByRole('tab', { name: /Scenes here/ }).click();
  await page.getByLabel('A card you already have').selectOption({ label: 'Kevin waters the lawn' });
  await page.getByRole('button', { name: 'Place it here' }).click();
  await expect(page.getByRole('tabpanel', { name: /Scenes here/ }).getByRole('button', { name: 'Kevin waters the lawn' })).toBeVisible();

  await page.getByRole('navigation', { name: 'Where you are' }).getByRole('button', { name: 'Act One' }).click();
  await page.getByRole('button', { name: '3. Setup' }).click();
  await page.getByRole('tab', { name: /Questions for this beat/ }).click();
  await expect(page.getByText('Six things that need fixing')).toBeVisible();
  await expect(page.getByRole('heading', { name: "Save the Cat's questions for this beat" })).toBeVisible();
});

test('a field of her own can go on just one beat (finding 60)', async ({ page, request }) => {
  await newNovel(page, 'Zoom Eight');
  const pid = await pidOf(request, 'Zoom Eight');
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Zoom' }).click();
  await page.getByRole('button', { name: 'Act One' }).click();
  await page.getByRole('button', { name: '4. Catalyst' }).click();
  await page.getByRole('tab', { name: /Notes and connections/ }).click();
  await page.getByLabel('New field name').fill('The phone call');
  await page.getByLabel('Just this beat').check();
  await page.getByRole('button', { name: 'Add field' }).click();
  await expect(page.getByText('The phone call')).toBeVisible();
  await page.getByRole('navigation', { name: 'Where you are' }).getByRole('button', { name: 'Act One' }).click();
  await page.getByRole('button', { name: '5. Debate' }).click();
  await expect(page.getByRole('heading', { name: 'Debate' })).toBeVisible();
  await expect(page.getByText('The phone call')).toHaveCount(0);
});

test('the board places a card with no spot from the board itself, as a might (findings 65, 66, 68)', async ({ page, request }) => {
  await newNovel(page, 'Zoom Nine');
  const pid = await pidOf(request, 'Zoom Nine');
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  await request.post(`/api/projects/${pid}/cards`, { headers: H, data: { title: 'The brawl' } });
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Board' }).click();
  const tray = page.locator('section', { hasText: 'Not on a beat yet' });
  await tray.getByRole('button', { name: 'Place on a beat…' }).click();
  await page.getByLabel('Move to beat').selectOption({ label: '9. Midpoint' });
  await page.getByLabel('It might go here').check();
  await page.getByRole('button', { name: 'Mark it as might go here' }).click();
  await expect(page.locator('.board-beat', { hasText: '9. Midpoint' })).toContainText('The brawl');
  await expect(page.locator('.board-beat', { hasText: '9. Midpoint' })).toContainText('might go here');
  await expect(page.getByRole('heading', { name: 'Not on a beat yet' })).toHaveCount(0);
});
