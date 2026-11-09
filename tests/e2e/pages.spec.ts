import { test, expect, Page } from '@playwright/test';
import { newNovel, editor, heroWrite, waitSaved, TOKEN } from './helpers';

const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
// 100 distinct words per paragraph, so every page turn can be checked by the word it falls on.
const para = (from: number) => Array.from({ length: 100 }, (_, i) => `w${from + i}`).join(' ') + '.';

/** The words on the page without the drawn page turns, the way the text itself holds them. */
const words = (page: Page) => page.evaluate(() => { const c = document.querySelector('.ProseMirror')!.cloneNode(true) as HTMLElement; c.querySelectorAll('.sheet-turn').forEach((e) => e.remove()); return c.textContent ?? ''; });

async function writeWords(page: Page, paragraphs: number, start = 0) {
  for (let i = 0; i < paragraphs; i++) { await page.keyboard.insertText(para(start + i * 100)); if (i < paragraphs - 1) await page.keyboard.press('Enter'); }
}

// Pages: a sheet every 250 words, across the whole book, chapters on a fresh page, drawn and never typed.
test('the Writing Room shows Word-style pages that never touch the text', async ({ page, request }) => {
  await newNovel(page, 'Pages Book');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await writeWords(page, 6);
  await waitSaved(page);

  // 600 words: two turns (after word 250 and word 500), feet 1 and 2 on the turns, 3 at the end.
  const turns = page.locator('.sheet-turn');
  await expect(turns).toHaveCount(2);
  await expect(turns.nth(0)).toHaveAttribute('aria-label', 'End of page 1. Page 2 begins.');
  await expect(page.locator('.sheet-end .sheet-foot')).toHaveText('3');
  await expect(page.locator('.wordline-counts')).toHaveText('Scene: 600 words, about 2½ pages. Chapter: 600 words, about 2½ pages. Novel: 600 words, about 2½ pages.');
  // The turn sits exactly before the 251st word, mid-paragraph.
  const before = await turns.nth(0).evaluate((el) => (el.previousSibling as Text | null)?.textContent?.trim().split(' ').pop());
  expect(before).toBe('w249');

  // Typing right at the turn: put the cursor just before w250 and type. The words go into the text,
  // and nothing of the page turn ever reaches it.
  await page.evaluate(() => {
    const el = document.querySelector('.sheet-turn')!;
    const next = el.nextSibling as Text;
    const r = document.createRange(); r.setStart(next, 0); r.collapse(true);
    const s = window.getSelection()!; s.removeAllRanges(); s.addRange(r);
  });
  await page.keyboard.type('Kevin ');
  await waitSaved(page);
  await expect.poll(() => words(page)).toContain('w249 Kevin w250');
  await expect(page.locator('.sheet-turn')).toHaveCount(2);
  // The turn moves with the words: Kevin is now the 251st word, so the page turns before him.
  const after = await page.locator('.sheet-turn').nth(0).evaluate((el) => (el.nextSibling as Text | null)?.textContent?.trim().split(' ')[0]);
  expect(after).toBe('Kevin');
  await page.keyboard.press('Backspace'); await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace'); await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace'); await page.keyboard.press('Backspace');
  await expect.poll(() => words(page)).toContain('w249 w250');

  // Saved text is exactly the words: no page numbers, no separators.
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Where was I' }).click();
  const list = await (await request.get('/api/projects', { headers: H })).json();
  const pid = list.find((p: any) => p.title === 'Pages Book').id;
  const outline = await (await request.get(`/api/projects/${pid}/outline`, { headers: H })).json();
  const sceneId = (outline.chapters ?? outline)[0].scenes[0].id;
  // Leaving the Writing Room commits the scene; wait for it to land.
  await expect.poll(async () => (await (await request.get(`/api/scenes/${sceneId}`, { headers: H })).json()).word_count).toBe(600);
  const scene = await (await request.get(`/api/scenes/${sceneId}`, { headers: H })).json();
  expect(scene.text).not.toMatch(/Page \d|End of page/);
  expect(scene.text).toContain('w249 w250');

  // A new chapter opens on a fresh page: Chapter 1 ends on page 3, so Chapter 2 starts on page 4.
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'The Writing Room' }).click();
  await page.getByRole('complementary', { name: 'Binder' }).getByRole('button', { name: 'New chapter' }).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await writeWords(page, 3, 1000);
  await waitSaved(page);
  await expect(page.locator('.sheet-turn').nth(0)).toHaveAttribute('aria-label', 'End of page 4. Page 5 begins.');
  await expect(page.locator('.sheet-end .sheet-foot')).toHaveText('5');
  await expect(page.locator('.wordline-counts')).toHaveText('Scene: 300 words, about 1 page. Chapter: 300 words, about 1 page. Novel: 900 words, about 3½ pages.');

  // Whole sheets are letter-shaped: the first sheet of a chapter is at least 1.29 times as tall as it is wide.
  const ratio = await page.evaluate(() => {
    const p = document.querySelector('.page')!.getBoundingClientRect();
    const gap = document.querySelector('.sheet-gap')!.getBoundingClientRect();
    return (gap.top - p.top) / p.width;
  });
  expect(ratio).toBeGreaterThan(1.27);
  if (process.env.SHOT_DIR) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('.sheet-turn').nth(0).evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${process.env.SHOT_DIR}/pages-turn.png` });
    await page.locator('.wordline').evaluate((e) => e.scrollIntoView({ block: 'end' }));
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${process.env.SHOT_DIR}/pages-end.png` });
  }
});
