import { test, expect } from '@playwright/test';

// I Declare War ships already built from her planning. The Library offers it; bringing it in
// opens the novel with every fact at the status her planning gave it, and each fact shows where it came from.
test('I Declare War comes in from her planning, statuses and sources intact', async ({ page }) => {
  await page.goto('/#t=e2etoken0123456789');
  const offer = page.getByRole('region', { name: 'I Declare War, ready to bring in' });
  await expect(offer).toContainText('Built from your planning documents and conversations');
  await offer.getByRole('button', { name: 'Bring in I Declare War' }).click();
  await expect(page.getByRole('navigation', { name: 'Views' })).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('.switcher')).toContainText('I Declare War');
  await expect(page.getByRole('combobox', { name: 'Stage', exact: true })).toHaveValue('Plotting and planning');

  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: 'Story Brain' }).click();
  await page.getByRole('button', { name: 'Characters' }).or(page.getByText('Characters', { exact: true })).first().click();
  await page.getByText('Kevin Wickley', { exact: true }).first().click();
  // A record is a notebook of pages; All pages shows every one of them at once.
  await page.getByRole('tab', { name: 'All pages' }).click();
  // Her working Lie is still developing, not decided; the outdated 10-15 version is kept only as set aside.
  const lie = page.getByText('"If I let my guard down, I could lose everything again."').first();
  await expect(lie).toBeVisible();
  await expect(lie.locator('..')).toContainText('Developing');
  await expect(page.getByText('Kevin Hart, for voice and tempo, kept off the page.')).toBeVisible();

  // Where a fact came from: the register row, and the moment in the conversation.
  const fact = page.locator('.st').filter({ hasText: 'Exaggeration: Kevin exaggerates' }).first();
  await fact.getByRole('button', { name: 'Where did this come from?' }).click();
  const dlg = page.getByRole('dialog', { name: 'Where this came from' });
  await expect(dlg).toContainText('I Declare War story data register, CK-009');
  await expect(dlg).toContainText('In the conversation');
  await expect(dlg).toContainText('Story Map Planning');
  await dlg.getByRole('button', { name: 'Close' }).click();

  // Once it is in, the Library no longer offers it.
  await page.getByRole('button', { name: 'Library' }).click();
  await expect(page.getByRole('region', { name: 'I Declare War, ready to bring in' })).toHaveCount(0);
  await expect(page.getByRole('list', { name: 'Your novels' })).toContainText('I Declare War');
});
