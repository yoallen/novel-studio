import { test, expect } from '@playwright/test';
import { newNovel, TOKEN } from './helpers';

// A character can be interviewed in their own voice, and the book's reader response and soundtrack have their own views.
test('interview a character, then see the reader response map and soundtrack', async ({ page, request }) => {
  await newNovel(page, 'Interview Test');
  const seed = page.getByRole('region', { name: 'Plant the seed' });
  await seed.getByLabel('Who is this story about?').fill('Carlton');
  await seed.getByRole('button', { name: 'Plant it' }).click();
  await page.getByText('Carlton', { exact: true }).first().click();
  await page.getByRole('tab', { name: /Interview/ }).click();
  const iv = page.getByRole('region', { name: 'Interview' });
  await iv.getByRole('button', { name: /villain interview/ }).click();
  const q = iv.getByLabel('What makes you cry?');
  await q.fill('Nothing. I make other people cry.');
  await q.blur();
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Story Brain' }).click();
  await page.getByRole('button', { name: 'Characters' }).or(page.getByText('Characters', { exact: true })).first().click();
  await page.getByText('Carlton', { exact: true }).first().click();
  await expect(page.getByRole('region', { name: 'Interview' }).getByLabel('What makes you cry?')).toHaveValue('Nothing. I make other people cry.');

  const h = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
  const projects = await (await request.get('/api/projects', { headers: h })).json();
  const pid = projects.find((p: any) => p.title === 'Interview Test').id;
  await request.post(`/api/projects/${pid}/elements`, { headers: h, data: { kind: 'song', title: 'Good Morning Heartache' } });

  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Reader response' }).click();
  await expect(page.getByRole('heading', { name: 'Reader response' })).toBeVisible();
  await page.getByRole('tab', { name: 'Soundtrack' }).click();
  await expect(page.getByText('Good Morning Heartache')).toBeVisible();
  await expect(page.getByText('Not placed in a scene yet')).toBeVisible();
});

// Ages: a scene's year and a character's birth year give their age, shown beside the page.
test('a scene with a year shows who is in it and how old', async ({ page, request }) => {
  await newNovel(page, 'Ages Test');
  const seed = page.getByRole('region', { name: 'Plant the seed' });
  await seed.getByLabel('Who is this story about?').fill('Tabitha');
  await seed.getByRole('button', { name: 'Plant it' }).click();
  const h = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
  const pid = (await (await request.get('/api/projects', { headers: h })).json()).find((p: any) => p.title === 'Ages Test').id;
  const tabs = (await (await request.get(`/api/projects/${pid}/elements?kind=character`, { headers: h })).json())[0].id;
  await request.post(`/api/elements/${tabs}/statements`, { headers: h, data: { field: 'born', value: '1976', status: 'established' } });
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Where was I' }).click();
  await page.locator('.hero').getByRole('button', { name: 'Write' }).click();
  const plan = page.getByRole('complementary', { name: 'Scene plan' });
  await plan.getByRole('combobox', { name: 'Viewpoint character' }).selectOption({ label: 'Tabitha' });
  const year = plan.getByLabel(/^Year/);
  await year.fill('2026');
  await year.blur();
  await expect(plan.getByRole('region', { name: 'Who is here, and how old' })).toContainText('Tabitha, 50');
});
