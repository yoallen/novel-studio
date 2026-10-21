import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { open, newNovel, editor, heroWrite, waitSaved, TOKEN } from './helpers';

// The Writing Room and Where was I explain themselves (usability findings 6 to 40, 197).
const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });
const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}

test('Start writing opens the page, and the one sentence becomes the book\'s one sentence', async ({ page, request }) => {
  await open(page);
  await page.getByLabel('Working title').fill('Garden Variety');
  await page.getByLabel(/One sentence about it/).fill('A widowed beekeeper discovers her hives are carrying messages.');
  await page.getByRole('button', { name: 'Start writing' }).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await expect(editor(page)).toBeFocused();
  const pid = await pidOf(request, 'Garden Variety');
  const setup = await (await request.get(`/api/projects/${pid}/setup`, { headers: H })).json();
  expect(setup.premise).toBe('A widowed beekeeper discovers her hives are carrying messages.');
  // It is not also filed as a loose thought.
  await nav(page).getByRole('button', { name: 'Where was I' }).click();
  await page.getByRole('tab', { name: /Still open/ }).click();
  await expect(page.getByRole('region', { name: 'Thoughts waiting to be sorted' })).toContainText('Nothing waiting');
});

test('Return to Writing waits until there is writing to return to', async ({ page }) => {
  await open(page);
  await page.getByLabel('Working title').fill('Nothing Yet');
  await page.getByRole('button', { name: 'Set it up first' }).click();
  await expect(page.getByRole('heading', { name: /How Nothing Yet is set up/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Return to Writing' })).toHaveCount(0);
  await nav(page).getByRole('button', { name: 'The Writing Room' }).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await nav(page).getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('button', { name: 'Return to Writing' })).toBeVisible();
});

test('Where was I: questions and decisions open their record', async ({ page, request }) => {
  await newNovel(page, 'Open Things');
  const pid = await pidOf(request, 'Open Things');
  const q = await (await request.post(`/api/projects/${pid}/elements`, { headers: H, data: { kind: 'question', title: 'Why does the ledger matter?', state: 'open' } })).json();
  const kevin = await (await request.post(`/api/projects/${pid}/elements`, { headers: H, data: { kind: 'character', title: 'Kevin' } })).json();
  await request.post(`/api/elements/${kevin.id}/statements`, { headers: H, data: { field: 'want', value: 'To be right, once.', status: 'established' } });
  await page.reload();
  await nav(page).getByRole('button', { name: 'Where was I' }).click();
  await page.getByRole('tab', { name: /Still open/ }).click();
  const decisions = page.getByRole('region', { name: 'Latest decisions' });
  await expect(decisions).toContainText('To be right, once.');
  await decisions.getByRole('button', { name: 'Kevin' }).click();
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue('Kevin');
  await nav(page).getByRole('button', { name: 'Where was I' }).click();
  await page.getByRole('region', { name: 'Questions still open' }).getByRole('button', { name: q.title }).click();
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toHaveValue(q.title);
});

test('the scene plan teaches its blanks, says Saved, and the circle follows the status', async ({ page }) => {
  await newNovel(page, 'Plan Room');
  await heroWrite(page).click();
  const plan = page.getByRole('complementary', { name: 'Scene plan' });
  await expect(plan).toContainText('saves by itself');
  await expect(plan.getByText(/whether it is going well \(\+\) or badly \(-\)/)).toBeVisible();
  await expect(plan.getByLabel('What you want the reader to feel')).toBeVisible();
  // Readiness uses the names of the blanks.
  await plan.getByRole('tab', { name: /About it/ }).click();
  await expect(plan).toContainText('Open: What this scene must do');
  await plan.getByRole('tab', { name: /The plan/ }).click();
  const must = plan.getByLabel('What this scene must do');
  await must.fill('Show Kevin cannot let a slight go.');
  await plan.getByLabel('Central conflict').click();
  await expect(plan.getByRole('status').filter({ hasText: 'Saved' })).toBeVisible();
  await plan.getByRole('tab', { name: /About it/ }).click();
  await expect(plan).toContainText('Done: What this scene must do');
  // Kept for you: each marker says what it means.
  await plan.getByLabel('Kept for you to write or decide').selectOption('Mine to choreograph');
  await expect(plan).toContainText('You stage the movement');
  // The circle key, and the binder circle following the chosen status.
  const binder = page.getByRole('complementary', { name: 'Chapters and scenes' });
  await expect(binder.locator('[aria-current="true"] .mark')).toHaveAttribute('data-c', 'empty');
  await plan.getByLabel('Status').selectOption({ label: 'Drafting' });
  await expect(binder.locator('[aria-current="true"] .mark')).toHaveAttribute('data-c', 'half');
  await expect(page.getByRole('list', { name: 'What the circles in the binder mean' })).toContainText('being written: Drafting');
  await plan.getByLabel('Status').selectOption({ label: 'First draft complete' });
  await expect(binder.locator('[aria-current="true"] .mark')).toHaveAttribute('data-c', 'full');
});

test('Focus hides everything but the page, with a way back; the trail does not log itself', async ({ page }) => {
  await newNovel(page, 'Quiet Page');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await page.getByRole('button', { name: 'Focus', exact: true }).click();
  await expect(nav(page)).toBeHidden();
  await expect(page.getByRole('button', { name: 'Capture' })).toBeHidden();
  await expect(page.getByRole('complementary', { name: 'Chapters and scenes' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Leave focus' }).click();
  await expect(nav(page)).toBeVisible();
  await page.getByRole('button', { name: 'Writing Trail' }).click();
  await expect(page.getByRole('heading', { name: 'Writing Trail' })).toBeVisible();
  await expect(page.getByText('Went to Writing Trail')).toHaveCount(0);
  await expect(nav(page).getByRole('button', { name: 'The Writing Room' })).toHaveAttribute('aria-current', 'page');
});

test('Show in Narrative Zoom says plainly when a scene is not on the plan; Ask about this scene focuses on it', async ({ page, request }) => {
  await newNovel(page, 'Loose Scene');
  const pid = await pidOf(request, 'Loose Scene');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('A line.');
  await waitSaved(page);
  await page.getByRole('button', { name: 'Show in Narrative Zoom' }).click();
  await expect(page.getByText('This scene is not on your plan yet')).toBeVisible();
  await page.getByRole('button', { name: 'Ask about this scene' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('About the scene');
  const convs = await (await request.get(`/api/projects/${pid}/conversations`, { headers: H })).json();
  expect(convs.find((c: any) => String(c.title).startsWith('About the scene'))?.focus_element_id).toBeTruthy();
});

test("I'm stuck inside a planned scene starts at that scene's beat, and says where the sentence went", async ({ page, request }) => {
  await newNovel(page, 'Stuck Here');
  const pid = await pidOf(request, 'Stuck Here');
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  const lm = await (await request.get(`/api/projects/${pid}/landmarks`, { headers: H })).json();
  const catalyst = lm.beats.find((b: any) => /Catalyst/.test(b.name));
  const card = await (await request.post(`/api/projects/${pid}/elements`, { headers: H, data: { kind: 'scene_plan', title: 'The fish guts' } })).json();
  await request.post(`/api/elements/${card.id}/statements`, { headers: H, data: { field: 'beat', value: catalyst.id, status: 'established' } });
  const scene = await (await request.post(`/api/elements/${card.id}/write-scene`, { headers: H, data: {} })).json();
  // Open the scene, then ask for help from inside it.
  await request.put(`/api/projects/${pid}/writing-state`, { headers: H, data: { sceneId: scene.id } });
  await page.reload();
  await nav(page).getByRole('button', { name: 'The Writing Room' }).click();
  await expect(page.getByLabel('Scene title')).toHaveValue('The fish guts');
  const fromCard = page.getByRole('region', { name: 'From the card' });
  await expect(fromCard).toContainText('Catalyst');
  await page.getByRole('button', { name: "I'm stuck" }).click();
  await expect(page.getByRole('heading', { name: /Catalyst/ })).toBeVisible();
  await expect(page.getByText('"The fish guts" sits at this beat.')).toBeVisible();
  await page.getByLabel('One sentence of what happens at this beat').fill('The smell arrives first.');
  await page.getByRole('button', { name: 'Save the sentence' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'on the beat' })).toContainText('What it is (your plan)');
});
