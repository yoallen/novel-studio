import { test, expect, Page } from '@playwright/test';
import { newNovel } from './helpers';

const nav = (p: Page) => p.getByRole('navigation', { name: 'Views' });

test('the collaborator stays off until she turns it on; its suggestions wait for her', async ({ page }) => {
  await newNovel(page, 'Collaborator Test');
  await nav(page).getByRole('button', { name: /Conversations/ }).click();
  await page.getByRole('button', { name: 'Start a new one' }).click();
  await expect(page.getByText(/collaborator is not set up/)).toBeVisible();

  await page.getByRole('button', { name: 'Turn it on in Settings' }).click();
  const section = page.getByRole('region', { name: 'The collaborator' });
  await section.getByLabel('Claude API key').fill('sk-test-key');
  await section.getByRole('button', { name: 'Use this key' }).click();
  await expect(section.getByText('Your key is set.')).toBeVisible();
  await expect(section.getByLabel(/Also share the prose/)).toBeDisabled();
  await section.getByLabel(/Use the collaborator for Collaborator Test/).click();
  await expect(section.getByLabel(/Use the collaborator for Collaborator Test/)).toBeChecked();
  await expect(section.getByLabel(/Also share the prose/)).toBeEnabled();

  await nav(page).getByRole('button', { name: /Conversations/ }).click();
  const form0 = page.getByRole('form', { name: 'Ask the collaborator' });
  const listed = page.getByRole('button', { name: /Conversation, / }).first();
  await expect(form0.or(listed)).toBeVisible();
  if (!(await form0.isVisible())) await listed.click();
  const form = page.getByRole('form', { name: 'Ask the collaborator' });
  // Each way to ask says what it gives, on screen.
  await expect(form.getByText('A creative partner who asks one question at a time.')).toBeVisible();
  await expect(form.getByRole('radio', { name: 'Teach it' })).toHaveAccessibleDescription(/A full explanation/);
  await form.getByLabel('Teach it').check();
  await form.getByLabel('Ask the collaborator').fill('How do I show grief without saying it?');
  await form.getByRole('button', { name: 'Ask' }).click();
  await expect(page.getByText(/You asked: How do I show grief without saying it\?/)).toBeVisible();
  await expect(page.getByText(/Teach it/).first()).toBeVisible();
  await expect(form.getByRole('status')).toContainText('One suggestion is waiting for you. Nothing was decided.');
  // The link opens Suggestions waiting, where the question waits for her yes. It is not one of her questions yet.
  await form.getByRole('button', { name: 'Look at it in Suggestions waiting' }).click();
  await expect(page.getByRole('heading', { name: 'Suggestions waiting', level: 1 })).toBeVisible();
  await expect(page.getByText('New question: What does the silence cost him?')).toBeVisible();
});

test('Ask about this scene opens a focused conversation', async ({ page }) => {
  await newNovel(page, 'Ask Scene Test');
  await page.locator('.hero').getByRole('button', { name: 'Write' }).click();
  await page.getByRole('button', { name: 'Ask about this scene' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('About the scene');
});
