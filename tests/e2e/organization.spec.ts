import { test, expect } from '@playwright/test';
import { newNovel, TOKEN } from './helpers';

const nav = (p: import('@playwright/test').Page) => p.getByRole('navigation', { name: 'Views' });
const h = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };

// The Story Brain is organized for a writer: worldbuilding only when the book has it, questions answered where
// they are marked answered, connections that read the right way round, and a Story Trail in plain words.
test('Story Brain lists, answering a question, a readable connection, and the Story Trail', async ({ page, request }) => {
  await newNovel(page, 'Organized Book');
  const projects = await (await request.get('/api/projects', { headers: h })).json();
  const pid = projects.find((p: any) => p.title === 'Organized Book').id;
  await request.post(`/api/projects/${pid}/capture`, { headers: h, data: { text: 'Why does the garden matter?', kind: 'question' } });
  const scene = await (await request.post(`/api/projects/${pid}/elements`, { headers: h, data: { kind: 'scene_plan', title: 'Opening image' } })).json();
  void scene;

  await nav(page).getByRole('button', { name: 'Story Brain' }).click();
  const kinds = page.getByRole('complementary', { name: 'Story Brain sections' });
  await expect(kinds.getByRole('button', { name: /^Scene cards/ })).toBeVisible();
  await kinds.getByRole('button', { name: 'Show every kind' }).click();
  await expect(kinds.getByRole('button', { name: /^Acts/ })).toBeVisible();
  // A contemporary book never sees the worldbuilding kinds.
  await expect(kinds.getByRole('button', { name: /^Magic and powers/ })).toHaveCount(0);

  // "Answered" asks for the answer right there, and the answer is kept on the question.
  await kinds.getByRole('button', { name: /^Questions and ideas/ }).click();
  await expect(page.getByRole('tab', { name: /^\d+\s*Ideas \(0\)$/ })).toBeVisible();
  await page.getByRole('button', { name: 'Answered', exact: true }).first().click();
  await page.getByLabel('The answer').fill('It is all she still controls.');
  await page.getByRole('button', { name: 'Mark answered' }).click();
  await page.getByRole('tab', { name: /^Answered/ }).click();
  await page.getByRole('button', { name: 'Why does the garden matter?' }).click();
  await expect(page.getByRole('group', { name: 'Where this question stands' }).getByRole('button', { name: 'Answered' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.st[data-s="established"]', { hasText: 'It is all she still controls.' })).toBeVisible();

  // A place connects to a scene, read from the place: "is where ... happens".
  await kinds.getByRole('button', { name: /^Places/ }).click();
  await page.getByLabel('New Place').fill("Miss Francine's garden");
  await page.getByRole('button', { name: 'Add place' }).click();
  await page.getByRole('tab', { name: /Notes and connections/ }).click();
  await page.getByLabel('Relationship').selectOption('located_at|back');
  await page.getByLabel('Connect to').selectOption({ label: 'Opening image' });
  await expect(page.locator('.link-reads')).toContainText("Miss Francine's garden is where Opening image happens");
  await page.getByRole('button', { name: 'Connect', exact: true }).click();
  await expect(page.locator('.conn-verb')).toHaveText("Miss Francine's garden is where … happens");

  // The Story Trail says it in words, and an undone change is plainly not in effect.
  await nav(page).getByRole('button', { name: 'Story Trail' }).click();
  const row = page.locator('.trail-row').filter({ hasText: "Connected: Opening image happens at Miss Francine's garden" });
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /^Undo/ }).click();
  await expect(page.locator('.trail-row.undone').filter({ hasText: 'Connected: Opening image' })).toContainText('Not in effect');
  await expect(page.locator('.trail-row').first()).toContainText('Undid: Connected');
  await expect(page.locator('.trail-row').first().getByRole('button', { name: /Put back/ })).toBeVisible();
});

test('Settings: one Save, a confirmation beside it, and the name from About you', async ({ page, request }) => {
  await request.patch('/api/author-profile', { headers: h, data: { about: { name: 'Dana', asked: true } } });
  await newNovel(page, 'Settings Book');
  await nav(page).getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('tab', { name: /Writing/ }).click();
  await expect(page.getByLabel('The marker for what is yours to write or decide')).toHaveValue("Dana, it's on you now");
  await expect(page.getByText('{author}')).toHaveCount(0);
  await page.getByRole('tab', { name: /This novel/ }).click();
  await page.getByLabel('Target length in words (optional)').fill('90000');
  const bar = page.getByRole('region', { name: 'Save settings' });
  await expect(bar.getByRole('status')).toHaveText('You have changes not saved yet.');
  await bar.getByRole('button', { name: 'Save settings' }).click();
  await expect(bar.getByRole('status')).toContainText('Saved at');
  await page.reload();
  await nav(page).getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByLabel('Target length in words (optional)')).toHaveValue('90000');
});
