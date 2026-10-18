import { test, expect } from '@playwright/test';
import { open, newNovel, waitSaved, editor, heroWrite, TOKEN } from './helpers';

test('without the app key the window cannot reach any work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('opened without the app\'s security key')).toBeVisible();
});

test('a blank novel goes straight to the page; writing survives a reload (Scenario H, R-B-005)', async ({ page }) => {
  await newNovel(page, 'Blank Start');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('The first line, with no planning at all.');
  await waitSaved(page);
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'The Writing Room' }).click();
  await expect(editor(page)).toContainText('with no planning at all');
});

test('typing that never became a saved version is offered back after a crash, and nothing is lost either way', async ({ page }) => {
  await newNovel(page, 'Crash Test');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('Saved part. ');
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Search' }).click();
  await page.getByRole('button', { name: 'Return to Writing' }).click();
  await expect(editor(page)).toContainText('Saved part.');
  // From here the service refuses to commit versions, as if the program died before it could.
  const block = (r: import('@playwright/test').Route) => r.abort();
  await page.context().route('**/api/scenes/*/prose', block);
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.press('End');
  await page.keyboard.type('Typed just before the power went out.');
  await waitSaved(page);
  await page.close({ runBeforeUnload: false });
  await page.context().unroute('**/api/scenes/*/prose', block);

  const page2 = await page.context().newPage();
  await open(page2);
  await page2.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'The Writing Room' }).click();
  await expect(page2.getByRole('dialog')).toContainText('was kept');
  await expect(page2.getByRole('dialog')).toContainText('before the power went out');
  await page2.getByRole('button', { name: 'Use the kept typing' }).click();
  await expect(editor(page2)).toContainText('Typed just before the power went out.');
  await page2.reload();
  await page2.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'The Writing Room' }).click();
  await expect(editor(page2)).toContainText('Typed just before the power went out.');
  await expect(page2.getByRole('dialog')).toHaveCount(0);
});

test('two windows on one scene: the stale save is refused and both versions are kept (D4)', async ({ browser }) => {
  const ctx = await browser.newContext();
  const a = await ctx.newPage();
  await newNovel(a, 'Two Windows');
  await heroWrite(a).click();
  await editor(a).click();
  await a.keyboard.type('Base text. ');
  await a.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Search' }).click();
  await a.getByRole('button', { name: 'Return to Writing' }).click();

  const b = await ctx.newPage();
  await open(b);
  await b.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'The Writing Room' }).click();
  await expect(editor(b)).toContainText('Base text.');

  await editor(a).click(); await a.keyboard.press('End'); await a.keyboard.type('Window A words.');
  await a.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Search' }).click(); // commits A
  await expect(a.getByRole('button', { name: 'Return to Writing' })).toBeVisible();

  await editor(b).click(); await b.keyboard.press('End'); await b.keyboard.type('Window B words.');
  await b.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Search' }).click();
  await b.getByRole('button', { name: 'Return to Writing' }).click();
  // B's commit was refused; it reopens with A's text and B's typing waiting as kept typing.
  await expect(b.getByRole('dialog')).toContainText('Window B words.');
  await b.getByRole('button', { name: 'Keep the saved version' }).click();
  await expect(editor(b)).toContainText('Window A words.');
  await b.getByRole('button', { name: 'Earlier versions' }).click();
  await expect(b.getByRole('dialog')).toContainText('Earlier versions');
  // Base, A's words, B's words (kept, not chosen) and the version she kept are all there.
  await expect.poll(() => b.getByRole('dialog').locator('li').count()).toBeGreaterThanOrEqual(3);
  await ctx.close();
});

test('Return to Writing puts the cursor back exactly where it was, through several detours (AC13)', async ({ page }) => {
  await newNovel(page, 'Detours');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('Before the cursor. After the cursor.');
  for (let i = 0; i < 'After the cursor.'.length; i++) await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(1200);
  const nav = page.getByRole('navigation', { name: 'Views' });
  await nav.getByRole('button', { name: 'Search' }).click();
  await nav.getByRole('button', { name: 'Story Brain' }).click();
  await nav.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Return to Writing' }).click();
  await expect(editor(page)).toBeFocused();
  await page.keyboard.type('[HERE] ');
  await expect(editor(page)).toContainText('Before the cursor. [HERE] After the cursor.');
  await page.getByRole('button', { name: 'Writing Trail' }).click();
  await expect(page.getByText('Went to Search')).toBeVisible();
});

test('a thought captured while writing keeps its exact words and waits beside that scene only (R-B-019, R-B-020)', async ({ page }) => {
  await newNovel(page, 'Capture');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('Scene one text.');
  await page.keyboard.press('Control+Shift+N');
  const dictated = 'what if the nieces  call before the funeral';
  await page.getByLabel("What's on your mind").fill(dictated);
  await page.getByText('A question I have').click();
  await page.getByText('I need this to keep writing').click();
  await page.getByRole('button', { name: 'Save it' }).click();
  const panel = page.getByRole('complementary', { name: 'Scene plan' });
  await expect(panel).toContainText('needed to keep writing');
  await expect(panel.locator('div[style*="pre-wrap"]').filter({ hasText: 'funeral' })).toHaveText(dictated);
  await page.getByRole('link', { name: 'Add scene' }).or(page.getByRole('button', { name: 'Add scene' })).first().click();
  await expect(page.getByRole('complementary', { name: 'Scene plan' })).toContainText('Nothing open');
  await page.getByRole('complementary', { name: 'Chapters and scenes' }).getByRole('button', { name: /Scene 1/ }).click();
  await page.getByRole('button', { name: 'Answered' }).click();
  await expect(page.getByRole('complementary', { name: 'Scene plan' })).toContainText('Nothing open');
});

test('the scene status steps are the author\'s own (R-B-026)', async ({ page }) => {
  await newNovel(page, 'Ladder');
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Step 7 name').fill('Polished');
  await page.getByRole('button', { name: 'Save settings' }).click();
  await expect(page.getByText('Settings saved.')).toBeVisible();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'The Writing Room' }).click();
  const status = page.getByRole('complementary', { name: 'Scene plan' }).getByLabel('Status');
  await status.selectOption({ label: 'Polished' });
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'The Writing Room' }).click();
  await expect(page.getByRole('complementary', { name: 'Scene plan' }).getByLabel('Status')).toHaveValue('revised');
});

test('deleting is never final, and any change can be undone (R-B-063)', async ({ page }) => {
  await newNovel(page, 'Undo');
  await heroWrite(page).click();
  const title = page.getByLabel('Scene title');
  await title.fill('Renamed scene');
  await title.press('Enter');
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('Keep these words.');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('complementary', { name: 'Chapters and scenes' }).getByRole('button', { name: 'Delete this scene' }).click();
  await expect(page.getByText('Choose a scene on the left')).toBeVisible();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Story Trail' }).click();
  await page.getByRole('button', { name: 'Deleted things' }).click();
  await page.getByRole('button', { name: 'Restore', exact: true }).click();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Story Trail' }).click();
  const row = page.locator('li').filter({ hasText: 'Edit scene' }).first();
  await row.getByRole('button', { name: 'Undo' }).click();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'The Writing Room' }).click();
  await expect(page.getByLabel('Scene title')).toHaveValue('Scene 1');
  await expect(editor(page)).toContainText('Keep these words.');
});

test('nothing leaks: requests from another site are refused even from the same machine', async ({ page, request }) => {
  const r = await request.post('/api/projects', { headers: { origin: 'https://evil.example', 'x-studio-token': TOKEN, 'content-type': 'application/json' }, data: { title: 'x' } });
  expect(r.status()).toBe(403);
});
