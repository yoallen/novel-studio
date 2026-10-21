import { test, expect, Page } from '@playwright/test';
import { newNovel, TOKEN } from './helpers';

const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });

test('she brings two characters from an older novel into a clean one, chosen one by one, and one undo takes them back', async ({ page, request }) => {
  // The older, cluttered novel.
  const post = (u: string, d: unknown) => request.post(u, { headers: H, data: d }).then((r) => r.json());
  const old = await post('/api/projects', { title: 'I Declare War', useDefaults: true });
  const marisol = await post(`/api/projects/${old.id}/elements`, { kind: 'character', title: 'Marisol Vega' });
  const ana = await post(`/api/projects/${old.id}/elements`, { kind: 'character', title: 'Ana Ruiz' });
  await post(`/api/projects/${old.id}/elements`, { kind: 'character', title: 'Cyrus Hale' });
  const port = await post(`/api/projects/${old.id}/elements`, { kind: 'location', title: 'Port Ellery' });
  await post(`/api/elements/${marisol.id}/statements`, { field: 'role', value: 'Protagonist', status: 'established', speaker: { kind: 'author' } });
  await post(`/api/elements/${marisol.id}/statements`, { field: 'want', value: 'To leave Port Ellery', status: 'developing', speaker: { kind: 'author' } });
  await post(`/api/projects/${old.id}/links`, { fromId: marisol.id, toId: port.id, relation: 'located_at' });

  // The clean new novel already has its own Marisol.
  await newNovel(page, 'The Keeper of Gull Point');
  await nav(page).getByRole('button', { name: 'Story Brain' }).click();
  await page.getByRole('button', { name: /^Characters/ }).click();
  await page.getByLabel('New Character').fill('Marisol Vega');
  await page.getByRole('button', { name: 'Add character' }).click();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Marisol Vega');
  await page.getByRole('button', { name: /^Characters/ }).click();

  await page.getByRole('button', { name: 'Bring from another novel' }).click();
  const dlg = page.getByRole('dialog', { name: 'Bring characters from another novel' });
  await dlg.getByLabel('From which novel?').selectOption({ label: 'I Declare War' });
  await expect(dlg.getByText('Cyrus Hale')).toBeVisible();
  await expect(dlg.getByText(/^Already here: Marisol Vega\./)).toBeVisible();
  await expect(dlg.getByText('Connections stay behind, because the records they point to are in the other novel.')).toBeVisible();
  await expect(dlg.getByText('Port Ellery', { exact: true })).toHaveCount(0); // only records of the same kind
  await dlg.getByRole('checkbox', { name: /Marisol Vega/ }).check();
  await dlg.getByRole('checkbox', { name: /Ana Ruiz/ }).check();
  await dlg.getByRole('button', { name: 'Bring 2 characters' }).click();
  await expect(dlg).toHaveCount(0);

  const done = page.locator('.bring-done');
  await expect(done).toContainText('Brought 2 characters from I Declare War.');
  // Nothing opened by itself; each new name opens its record.
  await expect(page.getByRole('heading', { name: 'Characters', level: 1 })).toBeVisible();
  await done.getByRole('button', { name: 'Marisol Vega' }).click();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Marisol Vega');
  await expect(page.getByText(/^Brought from I Declare War on /)).toBeVisible();
  await expect(page.getByText('Protagonist')).toBeVisible();
  await expect(page.getByText('From I Declare War').first()).toBeVisible();

  // One step in the Story Trail; one undo removes both, and the older novel is untouched.
  const me = (await (await request.get('/api/projects', { headers: H })).json()).find((p: any) => p.title === 'The Keeper of Gull Point');
  await nav(page).getByRole('button', { name: 'Story Trail' }).click();
  await page.getByRole('button', { name: 'Undo: Brought 2 characters from I Declare War' }).click();
  await expect(page.getByText('Undid: Brought 2 characters from I Declare War').first()).toBeVisible();
  const left = await (await request.get(`/api/projects/${me.id}/elements`, { headers: H })).json();
  expect(left.filter((e: any) => e.kind === 'character').map((e: any) => e.title)).toEqual(['Marisol Vega']);
  const theirs = await (await request.get(`/api/projects/${old.id}/elements`, { headers: H })).json();
  expect(theirs.filter((e: any) => e.kind === 'character')).toHaveLength(3);
  expect(theirs.find((e: any) => e.id === ana.id)?.title).toBe('Ana Ruiz');
});
