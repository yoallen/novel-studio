import { test, expect } from '@playwright/test';
import { newNovel, waitSaved, editor, heroWrite } from './helpers';

const views = (page: any) => page.getByRole('navigation', { name: 'Views' });
const day = (page: any, offset: number) => page.evaluate((o: number) => { const d = new Date(); d.setDate(d.getDate() + o); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }, offset);

// A note left in the page with Ctrl+Shift+L is pencil on the page, not counted, and waits on Where was I.
test('notes for later: typed in the page, left out of the count, gathered on Where was I', async ({ page }) => {
  await newNovel(page, 'Later Test');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await editor(page).click();
  await page.keyboard.type('Francine knelt in the dirt. ');
  await page.keyboard.press('Control+Shift+L');
  await page.keyboard.type('what does she grow in October');
  await page.keyboard.press('End');
  await page.keyboard.type(' Kevin brought the hose.');
  await waitSaved(page);
  await expect(editor(page)).toContainText('[[what does she grow in October]]');
  await expect(editor(page).locator('.later-note')).toHaveText('[[what does she grow in October]]');
  await expect(page.locator('.wordline')).toContainText('9 words in this scene');

  await views(page).getByRole('button', { name: 'Where was I' }).click();
  const later = page.getByRole('region', { name: 'Left for later' });
  await expect(later).toContainText('Left for later (1)');
  await later.getByRole('button', { name: 'what does she grow in October' }).click();
  await expect(editor(page)).toBeVisible();
  // The note is selected on the page, ready to answer.
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe('[[what does she grow in October]]');
});

// A lighter day she sets keeps her number; a sprint clears everything but the page and reports its words.
test('a lighter day, then a sprint with nothing but the page', async ({ page }) => {
  await newNovel(page, 'Sprint Test');
  await views(page).getByRole('button', { name: 'Settings' }).click();
  const push = page.getByRole('region', { name: 'A writing push' });
  await push.getByRole('button', { name: 'Plan a writing push' }).click();
  await push.getByLabel('Name it').fill('November');
  await push.getByLabel('First day').fill(await day(page, 0));
  await push.getByLabel('Last day').fill(await day(page, 9));
  await push.getByLabel('Words to write in it').fill('1000');
  await page.getByRole('button', { name: 'Save settings' }).click();

  await views(page).getByRole('button', { name: 'Where was I' }).click();
  const progress = page.getByRole('region', { name: 'November' });
  await expect(progress).toContainText('Today, 0 words of your 100.');
  await progress.getByRole('button', { name: 'Set a lighter day' }).click();
  await progress.getByLabel('Words', { exact: true }).fill('20');
  await progress.getByRole('button', { name: 'Set it' }).click();
  await expect(progress).toContainText('Today, 0 words of your 20.');
  // The other nine days share the rest: 980 over 9.
  await expect(progress).toContainText('about 109 a day');
  await expect(progress.getByRole('list', { name: 'Days you set' })).toContainText('20 words');

  // Close the door from here.
  await progress.getByRole('button', { name: /^Close the door through/ }).click();
  await expect(progress).toContainText('The door is closed through');

  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await expect(editor(page)).toHaveAttribute('spellcheck', 'false');
  await page.getByRole('button', { name: 'Sprint', exact: true }).click();
  const dlg = page.getByRole('dialog', { name: 'Sprint' });
  await dlg.getByLabel('Fill the whole screen').uncheck();
  await dlg.getByLabel('15 minutes').check();
  await dlg.getByRole('button', { name: 'Start the sprint' }).click();
  await expect(page.locator('.app')).toHaveAttribute('data-sprint', 'true');
  await expect(page.getByRole('navigation', { name: 'Views' })).toBeHidden();
  await expect(page.getByRole('group', { name: /^The book's shape/ })).toHaveCount(0);
  await expect(page.locator('.binder')).toHaveCount(0);
  await expect(page.locator('.wordline')).toHaveCount(0);
  await expect(page.getByRole('timer')).toContainText('15 min');
  // Nothing leads away from the page during a sprint.
  await page.keyboard.press('Control+k');
  await expect(page.locator('.leaf')).toHaveAttribute('data-view', 'write');

  await editor(page).click();
  await page.keyboard.type('One two three four five six seven eight nine ten eleven twelve.');
  await page.getByRole('timer').getByRole('button').click();
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('timer')).toContainText('Paused');
  await page.getByRole('timer').getByRole('button').first().click();
  await page.getByRole('button', { name: 'End the sprint' }).click();
  await expect(page.locator('.sprint-end')).toContainText('Sprint over. 12 words this sprint.');
  await page.locator('.sprint-end').getByRole('button', { name: 'Done' }).click();
  await expect(page.locator('.app')).not.toHaveAttribute('data-sprint', 'true');
  await expect(page.getByRole('navigation', { name: 'Views' })).toBeVisible();
  await waitSaved(page);

  await views(page).getByRole('button', { name: 'Where was I' }).click();
  await expect(progress).toContainText('Today, 12 words of your 20.');
});

// When the clock runs out, the page stays; she can keep going.
test('time runs out without taking the page away', async ({ page }) => {
  await newNovel(page, 'Clock Test');
  await heroWrite(page).click();
  await expect(editor(page)).toHaveAttribute('contenteditable', 'true');
  await page.clock.install();
  await page.getByRole('button', { name: 'Sprint', exact: true }).click();
  const dlg = page.getByRole('dialog', { name: 'Sprint' });
  await dlg.getByLabel('Fill the whole screen').uncheck();
  await dlg.getByLabel('Other length, in minutes').fill('1');
  await dlg.getByRole('button', { name: 'Start the sprint' }).click();
  await editor(page).click();
  await page.keyboard.type('Short and sweet.');
  await page.clock.runFor(61_000);
  await expect(page.locator('.sprint-end')).toContainText('Time.');
  await expect(page.locator('.sprint-end')).toContainText('in 1 minute.');
  await page.locator('.sprint-end').getByRole('button', { name: 'Keep going' }).click();
  await expect(page.getByRole('navigation', { name: 'Views' })).toBeHidden();
  await page.clock.runFor(300); // the page takes the cursor back on the next frame
  await expect(editor(page)).toBeFocused();
  await page.keyboard.press('Control+End');
  await page.keyboard.type(' More.');
  await expect(editor(page)).toContainText('Short and sweet. More.');
  await page.locator('.sprint-clock').getByRole('button', { name: 'Still writing' }).click();
  await page.locator('.sprint-clock').getByRole('button', { name: 'Done' }).click();
  await expect(page.locator('.sprint-end')).toContainText('Sprint over.');
});
