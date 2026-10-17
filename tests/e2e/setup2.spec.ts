import { test, expect } from '@playwright/test';
import { newNovel } from './helpers';

// A blank novel starts from six optional answers, kept in pencil.
test('plant the seed: a blank novel\'s first answers become its lead and its possible ending', async ({ page }) => {
  await newNovel(page, 'Seed Test');
  const seed = page.getByRole('region', { name: 'Plant the seed' });
  await seed.getByLabel('Who is this story about?').fill('Lauryn');
  await seed.getByLabel('What do they want?').fill('To keep Ethan, ghost or not.');
  await seed.getByLabel('How might it end?').fill('She lets him go and lives.');
  await seed.getByRole('button', { name: 'Plant it' }).click();
  await expect(page.getByText('Lauryn', { exact: true }).first()).toBeVisible();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Where was I' }).click();
  await expect(page.getByRole('region', { name: 'Plant the seed' })).toHaveCount(0);
});

// Setup groups: one-choice groups keep one answer, and her own entries stay in the group she added them to.
test('setup groups: tense keeps one answer, and her own tone stays under Tone', async ({ page }) => {
  await newNovel(page, 'Groups Test');
  await page.getByRole('region', { name: 'Plant the seed' }).getByRole('button', { name: 'Not now' }).click();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Open novel setup' }).click();
  const told = page.getByRole('region', { name: 'Narrative characteristics' });
  const tense = told.getByRole('group', { name: 'Tense' });
  await tense.getByLabel('Past tense').click();
  await expect(tense.getByLabel('Past tense')).toBeChecked();
  await tense.getByLabel('Present tense').click();
  await expect(tense.getByLabel('Present tense')).toBeChecked();
  await expect(tense.getByLabel('Past tense')).not.toBeChecked();
  const tone = told.getByRole('group', { name: 'Tone' });
  await tone.getByRole('button', { name: 'Add your own' }).click();
  await tone.getByLabel('Your own tone').fill('Aching');
  await tone.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(tone.getByLabel(/Aching/)).toBeChecked();
});
