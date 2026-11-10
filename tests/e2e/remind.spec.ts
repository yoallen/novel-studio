import { test, expect } from '@playwright/test';
import { newNovel, editor, heroWrite, waitSaved, TOKEN } from './helpers';

const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };

// Remind me: the story's memory and the craft, beside the page, without leaving the scene.
test('Remind me answers beside the page and never leaves the scene', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await newNovel(page, 'Gull Point');
  const pid = (await (await request.get('/api/projects', { headers: H })).json()).find((p: any) => p.title === 'Gull Point').id;
  const el = async (kind: string, title: string) => (await (await request.post(`/api/projects/${pid}/elements`, { headers: H, data: { kind, title } })).json()).id as string;
  const say = (id: string, field: string, value: string) => request.post(`/api/elements/${id}/statements`, { headers: H, data: { field, value, status: 'established' } });
  const marisol = await el('character', 'Marisol Vega');
  await say(marisol, 'importance', 'Main'); await say(marisol, 'role', 'Protagonist');
  await say(marisol, 'essence', 'Keeper of the Gull Point light, who finds an empty boat on her rocks.');
  await say(marisol, 'accent', 'Down East flat and slow; never wastes a word.');
  await say(marisol, 'speech', 'Weather is coming, whether you are ready or not.');

  await heroWrite(page).click(); await editor(page).click();
  await page.keyboard.insertText('The boat came in on the morning tide with nobody in it.');
  await waitSaved(page);
  const outline = await (await request.get(`/api/projects/${pid}/outline`, { headers: H })).json();
  await request.patch(`/api/chapters/${outline.chapters[0].id}/pov`, { headers: H, data: { povElementId: marisol, pov: { person: 'Third person', tense: 'Past' } } });

  const openDetours = async () => (await (await request.get(`/api/projects/${pid}/trail`, { headers: H })).json()).filter((x: any) => !x.returned_at).length;
  const before = await openDetours();
  // Opens beside the page; the scene stays put.
  await page.getByRole('button', { name: 'Remind me', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Remind me' });
  await expect(panel.getByRole('heading', { name: 'Remind me' })).toBeVisible();
  await expect(panel).toContainText('Marisol Vega, third person, past tense');
  if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/remind-list.png` });

  await panel.getByRole('button', { name: 'Remind me, who are my characters?' }).click();
  await expect(panel).toContainText('Keeper of the Gull Point light');
  await expect(panel).toContainText('Protagonist');
  await panel.getByRole('button', { name: '← All reminders' }).click();

  await panel.getByRole('button', { name: 'Whose voice is this?' }).click();
  await expect(panel).toContainText('Third person');
  await expect(panel).toContainText('Down East flat and slow');
  await expect(panel).toContainText('Weather is coming');
  if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/remind-voice.png` });
  await panel.getByRole('button', { name: '← All reminders' }).click();

  await panel.getByRole('button', { name: 'What did I decide about…' }).click();
  await panel.getByLabel('What did I decide about').fill('boat');
  await expect(panel).toContainText('Marisol Vega');
  await panel.getByRole('button', { name: '← All reminders' }).click();

  await panel.getByRole('button', { name: 'What makes a scene work?' }).click();
  await expect(panel).toContainText("The viewpoint character's objective");
  await expect(panel).toContainText('Not answered for this scene yet.');

  // Ctrl+Shift+M closes it and brings it back, and the page never moved.
  await editor(page).click();
  await page.keyboard.press('Control+Shift+M');
  await expect(panel).toHaveCount(0);
  await page.keyboard.press('Control+Shift+M');
  await expect(page.getByRole('complementary', { name: 'Remind me' })).toBeVisible();
  await expect(editor(page)).toContainText('The boat came in');
  // Nothing in Remind me is a detour: the Writing Trail stays empty.
  expect(await openDetours()).toBe(before);
});

test('Remind me teaches the beat the scene sits on, and any beat on request', async ({ page, request }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await newNovel(page, 'Beat Book');
  const pid = (await (await request.get('/api/projects', { headers: H })).json()).find((p: any) => p.title === 'Beat Book').id;
  await request.post(`/api/projects/${pid}/structure/save-the-cat`, { headers: H, data: {} });
  await heroWrite(page).click(); await editor(page).click();
  await page.keyboard.insertText('She sat on the gallery stairs and did not cry.');
  await waitSaved(page);
  await page.getByRole('button', { name: 'Remind me', exact: true }).click();
  const panel = page.getByRole('complementary', { name: 'Remind me' });
  await panel.getByRole('button', { name: 'Remind me about a beat…' }).click();
  await panel.getByRole('button', { name: 'Dark Night of the Soul' }).click();
  await expect(panel).toContainText('How the hero reacts to the All Is Lost');
  await expect(panel).toContainText('Questions to check it');
  await expect(panel).toContainText("Jessica Brody's Save the Cat! Writes a Novel");
  if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/remind-craft.png` });
  await panel.getByRole('button', { name: 'Open this beat in Narrative Zoom' }).click();
  await expect(page.locator('.running .where')).toHaveText('Narrative Zoom');
});

// The links above the page stay in reach, however far down the scene she is.
test('the links above the page stay put while the pages scroll', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await newNovel(page, 'Long Scene');
  await heroWrite(page).click(); await editor(page).click();
  for (let i = 0; i < 6; i++) { await page.keyboard.insertText('The boat came in on the morning tide with nobody in it, and she watched it from the gallery until the light went gray. '.repeat(6)); await page.keyboard.press('Enter'); }
  await waitSaved(page);
  await page.locator('.pagewrap').evaluate((e) => { e.scrollTop = e.scrollHeight; });
  const link = page.getByRole('button', { name: 'Remind me', exact: true });
  await expect(link).toBeInViewport();
  await link.click();
  await expect(page.getByRole('complementary', { name: 'Remind me' })).toBeVisible();
});
