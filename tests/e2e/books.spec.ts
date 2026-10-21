import { test, expect, Page } from '@playwright/test';
import { open, newNovel, editor, waitSaved, heroWrite } from './helpers';

const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });

test('several books at different stages; switching keeps each one\'s place; a draft is kept and compared', async ({ page }) => {
  await newNovel(page, 'Book Plotting');
  await page.getByRole('group', { name: 'This book' }).getByRole('combobox').selectOption('Plotting and planning');
  await page.getByRole('button', { name: 'Library' }).click();
  await page.getByLabel('Working title').fill('Book Drafting');
  await page.getByRole('button', { name: 'Start writing' }).click();
  // Start writing opens the page itself.
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('Kevin said it was not his fault.');
  await waitSaved(page);

  await page.getByRole('button', { name: /Book Drafting/ }).click();
  await page.getByRole('menuitem', { name: /Book Plotting/ }).click();
  await expect(page.getByRole('button', { name: /Book Plotting/ })).toBeVisible();
  await page.getByRole('button', { name: /Book Plotting/ }).click();
  await page.getByRole('menuitem', { name: /Book Drafting/ }).click();
  await page.getByRole('button', { name: 'Return to Writing' }).or(heroWrite(page)).first().click();
  await expect(editor(page)).toContainText('not his fault');

  await nav(page).getByRole('button', { name: 'Where was I' }).click();
  await page.getByRole('button', { name: 'Drafts' }).click();
  await page.getByRole('button', { name: 'This draft is done' }).click();
  await page.getByRole('button', { name: /Keep first draft and start the next/ }).click();
  await expect(page.getByRole('status')).toContainText('You are now in the second draft.');
  await page.getByRole('button', { name: 'Compare with now' }).click();
  await expect(page.getByRole('region', { name: 'Comparison' })).toContainText('0 scenes changed');

  await page.getByRole('button', { name: 'Library' }).click();
  const shelf = page.getByRole('list', { name: 'Your novels' });
  await expect(shelf).toContainText('Book Plotting');
  await expect(shelf.getByLabel('Stage of Book Plotting')).toHaveValue('Plotting and planning');
  await expect(shelf.getByLabel('Stage of Book Drafting')).toHaveValue('Second draft');
});

test('a method of her own, from any teacher, with its own beats, becomes a novel\'s beat sheet', async ({ page }) => {
  await newNovel(page, 'Method Book');
  await nav(page).getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('tab', { name: /All my novels/ }).click();
  await page.getByRole('button', { name: 'Open my methods' }).click();
  await page.getByRole('button', { name: 'Make a method of my own' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Fichtean Curve');
  await page.getByLabel('Where it comes from (teacher, book, course)').fill('John Gardner');
  await page.getByRole('button', { name: 'Three-Act Structure' }).click();
  await expect(page.getByLabel('Beat name').first()).toHaveValue('Setup');
  await page.getByLabel('Beat name').first().fill('First crisis');
  await page.getByRole('button', { name: 'Save this method' }).click();
  await expect(page.getByRole('status')).toContainText('Fichtean Curve is saved.');
  await page.getByRole('button', { name: 'Novel setup' }).click();
  await page.getByRole('tab', { name: /My storytelling toolkit/ }).click();
  const kit = page.getByRole('region', { name: 'Storytelling toolkit' });
  await kit.getByLabel(/Fichtean Curve/).click();
  await expect(kit.getByLabel(/Fichtean Curve/)).toBeChecked();
  await nav(page).getByRole('button', { name: 'Narrative Zoom' }).click();
  await page.getByRole('tab', { name: 'Board' }).click();
  await expect(page.getByRole('main').getByRole('button', { name: /First crisis/ })).toBeVisible();
  // The strip above the page follows the new spine too.
  await expect(page.getByRole('group', { name: /The book's shape/ }).getByRole('button', { name: 'First crisis' })).toBeAttached();
});
