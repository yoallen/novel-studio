import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { newNovel, TOKEN } from './helpers';

const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });
const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}

test('viewpoint: a chapter viewpoint flows to its scenes; a second head is asked about; "intentional" quiets it with her reason (R-C-041, R-C-043, R-C-077)', async ({ page, request }) => {
  await newNovel(page, 'Cont One');
  const pid = await pidOf(request, 'Cont One');
  const post = (u: string, d: unknown) => request.post(u, { headers: H, data: d }).then((r) => r.json());
  const kevin = await post(`/api/projects/${pid}/elements`, { kind: 'character', title: 'Kevin' });
  await post(`/api/projects/${pid}/elements`, { kind: 'character', title: 'Anthony' });
  const world = await post(`/api/projects/${pid}/storyworld`, {});
  await post(`/api/elements/${world.id}/statements`, { field: 'pov_rule', value: 'One viewpoint per scene', status: 'established' });
  void kevin;

  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Viewpoint' }).click();
  await page.getByRole('combobox', { name: 'Viewpoint' }).first().selectOption({ label: 'Kevin' });
  await expect(page.getByLabel('Viewpoint character for Scene 1')).toContainText('Kevin (from chapter)');
  await page.getByLabel('Second viewpoint for Scene 1').selectOption({ label: 'Anthony' });
  await page.getByRole('tab', { name: 'Story review' }).click();
  await expect(page.getByText(/lists more than one viewpoint \(Kevin, Anthony\)/)).toBeVisible();
  await page.getByLabel('Your reason').first().fill('The fence argument is the one scene shared on purpose.');
  await page.getByRole('button', { name: "It's intentional" }).first().click();
  await expect(page.getByText(/lists more than one viewpoint/).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Your answers' })).toBeVisible();
  await expect(page.getByText('Intentional: The fence argument is the one scene shared on purpose.')).toBeVisible();
  await expect(page.getByText('No open questions.')).toBeVisible();
});

test('continuity counts planned scene cards and a clue\'s own words, marks planned apart, and explains each view on request', async ({ page, request }) => {
  await newNovel(page, 'Cont Two');
  const pid = await pidOf(request, 'Cont Two');
  const post = (u: string, d: unknown) => request.post(u, { headers: H, data: d }).then((r) => r.json());
  const kevin = await post(`/api/projects/${pid}/elements`, { kind: 'character', title: 'Kevin' });
  const card = await post(`/api/projects/${pid}/cards`, { title: 'The cruel exchange' });
  await post(`/api/projects/${pid}/links`, { fromId: kevin.id, toId: card.id, relation: 'appears_in' });
  const clue = await post(`/api/projects/${pid}/elements`, { kind: 'clue', title: 'No grave marker' });
  await post(`/api/elements/${clue.id}/statements`, { field: 'planted', value: 'The cruel exchange', status: 'established' });
  await post(`/api/elements/${clue.id}/statements`, { field: 'paid_off', value: 'Memory-care visit', status: 'established' });
  const move = await post(`/api/projects/${pid}/elements`, { kind: 'hidden_move', title: 'Dumps fish guts', parentId: kevin.id });
  void move;

  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Cast' }).click();
  // The note is one folded line until opened.
  const how = page.locator('details.how-it-works');
  await expect(how).not.toHaveAttribute('open', '');
  await how.getByText('How this view works').click();
  await expect(how).toContainText('Where it comes from');
  await expect(page.getByRole('table', { name: 'Who is where' })).toContainText('Not on a beat yet');
  await expect(page.getByRole('button', { name: 'Kevin, in the scene (your records), The cruel exchange' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('button', { name: 'The Bechdel test' })).toBeVisible();

  await page.getByRole('tab', { name: 'Setups and payoffs' }).click();
  const row = page.getByRole('row').filter({ hasText: 'No grave marker' });
  await expect(row).toContainText('Memory-care visit');
  await expect(row.getByRole('button', { name: 'The cruel exchange' })).toBeVisible();
  await expect(row).toContainText('planned, no beat yet');

  await nav(page).getByRole('button', { name: 'Story Brain' }).click();
  await page.getByRole('button', { name: /Secret operations/ }).first().click();
  await expect(page.getByRole('button', { name: 'Dumps fish guts' })).toBeVisible();
});
