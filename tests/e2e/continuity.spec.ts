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
  await expect(page.getByRole('cell', { name: 'Kevin (from chapter)' })).toBeVisible();
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
