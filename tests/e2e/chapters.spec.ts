import { test, expect, Page } from '@playwright/test';
import { newNovel, editor, heroWrite, waitSaved } from './helpers';

const words = (from: number, n: number) => Array.from({ length: n }, (_, i) => `w${from + i}`).join(' ') + '.';
const chapterNames = (page: Page) => page.getByRole('complementary', { name: 'Binder' }).locator('.chapter-head .name').allTextContents();

async function twoParagraphs(page: Page, title: string) {
  await newNovel(page, title);
  await heroWrite(page).click();
  await editor(page).click();
  await page.keyboard.insertText(words(0, 20));
  await page.keyboard.press('Enter');
  await page.keyboard.insertText(words(100, 20));
  await waitSaved(page);
  return page.getByRole('complementary', { name: 'Binder' });
}

async function splitAtSecondParagraph(page: Page) {
  await page.locator('.ProseMirror p').nth(1).click({ position: { x: 2, y: 8 } });
  await page.keyboard.press('Home');
  await page.getByRole('complementary', { name: 'Binder' }).getByRole('button', { name: 'Split the chapter here' }).click();
  return page.getByRole('dialog', { name: 'Split the chapter here?' });
}

// Split the chapter here cuts at the cursor, asks first, and is one step she can undo.
test('Split the chapter here, and undo it', async ({ page }) => {
  const binder = await twoParagraphs(page, 'Split Book');
  await expect(binder.getByRole('heading', { name: 'Binder' })).toBeVisible();

  // Not now changes nothing.
  let dlg = await splitAtSecondParagraph(page);
  await dlg.getByRole('button', { name: 'Not now' }).click();
  await expect.poll(() => chapterNames(page)).toEqual(['Chapter 1']);

  dlg = await splitAtSecondParagraph(page);
  await expect(dlg).toContainText('Chapter 2 will begin where your cursor is in Scene 1:');
  await expect(dlg.locator('blockquote')).toContainText('w100 w101');
  await expect(dlg).toContainText('none of them count as new writing');
  if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/split-dialog.png` });
  await dlg.getByRole('button', { name: 'Split the chapter here' }).click();
  await expect.poll(() => chapterNames(page)).toEqual(['Chapter 1', 'Chapter 2']);
  await expect(binder.locator('.chapter').nth(0).locator('.scene-row .wc')).toHaveText('20');
  await expect(binder.locator('.chapter').nth(1).locator('.scene-row .wc')).toHaveText('20');
  await expect(editor(page)).toContainText('w100');
  await expect(editor(page)).not.toContainText('w0 ');

  // One step in Story Trail puts it back whole.
  const nav = page.getByRole('navigation', { name: 'Views' });
  await nav.getByRole('button', { name: 'Story Trail' }).click();
  await page.getByRole('button', { name: /^Undo: Split Chapter 1/ }).click();
  await expect(page.getByText(/^Undone/).first()).toBeVisible();
  await nav.getByRole('button', { name: 'The Writing Room' }).click();
  await expect.poll(() => chapterNames(page)).toEqual(['Chapter 1']);
  await expect(binder.locator('.scene-row .wc')).toHaveText('40');
});

// New chapter opens a blank chapter right after the one she is in, and the plain numbers after it move up.
test('New chapter opens right after the chapter you are in', async ({ page }) => {
  const binder = await twoParagraphs(page, 'New Chapter Book');
  await (await splitAtSecondParagraph(page)).getByRole('button', { name: 'Split the chapter here' }).click();
  await expect.poll(() => chapterNames(page)).toEqual(['Chapter 1', 'Chapter 2']);

  await binder.locator('.chapter').nth(0).locator('.scene-row').click();
  await expect(editor(page)).toContainText('w0');
  await editor(page).click();
  await page.keyboard.press('Control+Shift+Enter');
  await expect.poll(() => chapterNames(page)).toEqual(['Chapter 1', 'Chapter 2', 'Chapter 3']);
  await expect(binder.locator('.chapter').nth(1).locator('.scene-row')).toHaveAttribute('aria-current', 'true');
  await expect(binder.locator('.chapter').nth(2).locator('.scene-row .wc')).toHaveText('20');

  // The same from the line under the page.
  await page.locator('.wordline').getByRole('button', { name: 'New chapter' }).click();
  await expect.poll(() => chapterNames(page)).toEqual(['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4']);
  await expect(binder.locator('.chapter').nth(2).locator('.scene-row')).toHaveAttribute('aria-current', 'true');
  if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/new-chapter.png` });
});
