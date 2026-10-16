import { test, expect } from '@playwright/test';
import { newNovel, editor, heroWrite } from './helpers';

// Scenes and chapters can be removed right from the list in the Writing Room, and come back whole.
test('a scene and a whole chapter are deleted from the list, and a chapter comes back with its scenes', async ({ page }) => {
  await newNovel(page, 'Binder');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  const binder = page.getByRole('complementary', { name: 'Chapters and scenes' });
  await binder.getByRole('button', { name: 'Add chapter' }).click();
  await expect(binder.locator('.chapter')).toHaveCount(2);
  await binder.getByRole('button', { name: 'Add scene' }).last().click();
  await expect(binder.locator('.chapter').last().locator('.scene-row')).toHaveCount(2);

  // The open scene's own Delete, beside its arrows.
  page.once('dialog', (d) => { expect(d.message()).toContain('to Deleted'); void d.accept(); });
  await binder.getByRole('button', { name: 'Delete this scene' }).click();
  await expect(binder.locator('.chapter').last().locator('.scene-row')).toHaveCount(1);

  // A whole chapter, with what is left in it.
  page.once('dialog', (d) => { expect(d.message()).toContain('and its 1 scene'); void d.accept(); });
  await binder.getByRole('button', { name: 'Delete Chapter 2' }).click();
  await expect(binder.locator('.chapter')).toHaveCount(1);

  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Story Trail' }).click();
  await page.getByRole('button', { name: 'Deleted things' }).click();
  await page.getByRole('button', { name: 'Restore with its scenes' }).click();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'The Writing Room' }).click();
  await expect(binder.locator('.chapter')).toHaveCount(2);
  await expect(binder.locator('.chapter').last().locator('.scene-row')).toHaveCount(1);
});
