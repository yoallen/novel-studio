import { test, expect, Page } from '@playwright/test';
import { newNovel, editor, waitSaved, heroWrite } from './helpers';

const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });

test('Read it back shows echoes and watch words and selects them on the page; pacing and names read the whole book', async ({ page }) => {
  await newNovel(page, 'Lens Test');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('Kevin walked to the window. He walked back and just stood there. Later Marla laughed at Marla and Marlla. ');
  await waitSaved(page);
  await page.getByRole('button', { name: 'Read it back' }).click();
  const panel = page.getByRole('complementary', { name: 'Read it back' });
  await expect(panel.getByRole('button', { name: 'Read the scene' })).toBeVisible();
  const echo = panel.getByRole('region', { name: 'Echoes' }).getByRole('button', { name: /walked ×2/ });
  await expect(echo).toBeVisible();
  await echo.click();
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe('walked');
  await expect(panel.getByRole('region', { name: 'Your watch words' })).toContainText('just ×1');

  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Pacing' }).click();
  await expect(page.getByRole('img', { name: /Scene lengths for 1 scene/ })).toBeVisible();
  await page.getByRole('tab', { name: 'Names' }).click();
  await expect(page.getByRole('region', { name: 'Possible misspellings' })).toContainText('"Marlla" appears 1 time');
});

test('the cast view: who is where, who meets whom, and the Bechdel test with her answer', async ({ page, request }) => {
  await newNovel(page, 'Cast Test');
  const h = { 'x-studio-token': 'e2etoken0123456789', 'content-type': 'application/json' };
  const pid = (await (await request.get('/api/projects', { headers: h })).json()).find((p: any) => p.title === 'Cast Test').id;
  for (const [t, g] of [['Francine', 'woman'], ['Gloria', 'woman'], ['Kevin', null]] as const) {
    const e = await (await request.post(`/api/projects/${pid}/elements`, { headers: h, data: { kind: 'character', title: t } })).json();
    if (g) await request.post(`/api/elements/${e.id}/statements`, { headers: h, data: { field: 'gender', value: g, status: 'established' } });
  }
  const outline = await (await request.get(`/api/projects/${pid}/outline`, { headers: h })).json();
  const chId = outline.chapters[0].id;
  await request.post(`/api/chapters/${chId}/scenes`, { headers: h, data: { title: 'Garden', text: 'Francine handed Gloria the shears while Kevin watched.' } });
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Cast' }).click();
  await expect(page.getByRole('table', { name: 'Who is where' })).toContainText('Francine');
  await page.getByRole('tab', { name: /^\d+Two at a time$/ }).click();
  await expect(page.getByRole('region', { name: 'Who meets whom' })).toContainText('Francine and Gloria');
  await page.getByRole('tab', { name: /^\d+Who is together$/ }).click();
  const pickers = page.getByRole('group', { name: 'Choose characters' });
  for (const n of ['Francine', 'Gloria', 'Kevin']) await pickers.getByRole('button', { name: n }).click();
  await expect(page.getByRole('region', { name: 'Scenes together' })).toContainText('Francine, Gloria and Kevin: 1 scene together');
  await page.getByRole('tab', { name: /^\d+The Bechdel test$/ }).click();
  const b = page.getByRole('region', { name: 'Bechdel test' });
  await expect(b).toContainText('Waiting for your answers.');
  await b.getByRole('button', { name: 'They do' }).click();
  await expect(b).toContainText('Passes, in 1 scene.');
});
