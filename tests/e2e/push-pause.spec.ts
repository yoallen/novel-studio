import { test, expect, APIRequestContext } from '@playwright/test';
import { newNovel, TOKEN, editor, heroWrite, waitSaved } from './helpers';

const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
async function pidOf(request: APIRequestContext, title: string) {
  const list = await (await request.get('/api/projects', { headers: H })).json();
  return list.find((p: any) => p.title === title).id as string;
}
const day = (o: number) => { const d = new Date(); d.setDate(d.getDate() + o); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const shot = (name: string) => process.env.SHOT_DIR ? `${process.env.SHOT_DIR}/${name}.png` : null;

test('a running push is changed, paused or ended early in Settings, never replaced; a pause shows as books on their sides', async ({ page, request }) => {
  await newNovel(page, 'Pause One');
  const pid = await pidOf(request, 'Pause One');
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'Third Push', start: day(-3), end: day(10), words: 5000 } } });
  await page.reload();
  await heroWrite(page).click(); await editor(page).click();
  await page.keyboard.insertText(Array.from({ length: 120 }, (_, i) => `w${i}`).join(' ') + '.'); await waitSaved(page);
  await page.setViewportSize({ width: 1440, height: 1200 });

  // Settings: the push she is in, with no way to start another on top of it.
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('tab', { name: /Goals/ }).click();
  const sec = page.locator('#set-push');
  await sec.scrollIntoViewIfNeeded();
  await expect(sec).toContainText("The push you're in");
  await expect(sec.getByRole('button', { name: 'Start a new push' })).toHaveCount(0);
  await expect(sec.getByRole('button', { name: 'No push' })).toHaveCount(0);
  if (shot('settings-running')) await sec.screenshot({ path: shot('settings-running')! });

  // Pause: a day to come back, and what happens to the last day.
  await sec.getByRole('button', { name: 'Pause this push' }).click();
  const slip = sec.getByRole('group', { name: 'Pause Third Push' });
  await expect(slip).toContainText('Coming back is the promise');
  await slip.getByLabel('Back on').fill(day(4));
  if (shot('settings-pause')) await sec.screenshot({ path: shot('settings-pause')! });
  await slip.getByRole('button', { name: /^Pause until/ }).click();
  await expect(sec).toContainText('Third Push is paused until');

  // End early asks her to mean it, and offers a pause instead; here she keeps going.
  await sec.getByRole('button', { name: 'End this push early' }).click();
  await expect(sec.getByRole('group', { name: 'End Third Push early' })).toContainText('Only end it if you need to.');
  if (shot('settings-end')) await sec.screenshot({ path: shot('settings-end')! });
  await sec.getByRole('button', { name: 'Keep going' }).click();

  // The Today page: the push set down, nothing asked, a way back.
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await page.getByRole('tab', { name: /Today/ }).click();
  await expect(page.locator('.drafting')).toContainText('Third Push is paused until');
  await expect(page.locator('.push-line')).toContainText('paused here');
  if (shot('today-paused')) await page.locator('.drafting').screenshot({ path: shot('today-paused')! });

  // The shelf: today is the first paused day, a book lying on its side.
  await page.getByRole('tab', { name: /The shelf/ }).click();
  await expect(page.locator('.bookcase .shelf-drawing').first()).toContainText('paused 1 day');
  if (shot('shelf-paused')) await page.locator('.bookcase').screenshot({ path: shot('shelf-paused')! });

  // Back early: the pause comes off, and the push runs again.
  await page.getByRole('tab', { name: /Today/ }).click();
  await page.locator('.drafting').getByRole('button', { name: 'Come back now' }).click();
  await expect(page.locator('.drafting')).not.toContainText('paused until');

  // Ended early, it goes to the finished shelf marked so.
  await request.post(`/api/projects/${pid}/push/end`, { headers: H, data: {} });
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await page.getByRole('tab', { name: /The shelf/ }).click();
  await expect(page.locator('.finished-shelf')).toHaveAttribute('aria-label', /Third Push, Ended early, day 4 of 14: 120 of 5,000 words\./);
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('tab', { name: /Goals/ }).click();
  await expect(page.locator('#set-push')).toContainText('Third Push ended early');
  await expect(page.locator('#set-push')).toContainText('Plan your next push.');
  if (shot('settings-ended')) { await page.locator('#set-push').scrollIntoViewIfNeeded(); await page.locator('#set-push').screenshot({ path: shot('settings-ended')! }); }
});

test('a refused save says so beside the button, and a small target length is fine', async ({ page, request }) => {
  await newNovel(page, 'Save One');
  const pid = await pidOf(request, 'Save One');
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: '', start: day(0), end: day(0), words: 25 } } });
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Target length in words (optional)').fill('40');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.locator('.save-bar')).toContainText(/Saved at/);
  // A push whose last day comes before its first cannot be kept; the reason shows by the button.
  await page.getByRole('tab', { name: /Goals/ }).click();
  await page.locator('#set-push').getByLabel('Last day').fill(day(-3));
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.locator('.save-bar')).toContainText('Not saved. The last day of a writing push comes before the first.');
  if (process.env.SHOT_DIR) await page.locator('.save-bar').screenshot({ path: `${process.env.SHOT_DIR}/save-error.png` });
});
