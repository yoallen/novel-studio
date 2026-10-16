import { test, expect } from '@playwright/test';

// The program asks once who the author is; every answer is optional and editable later.
test('the author is asked once, in their own words, and can change it in Settings', async ({ page, request }) => {
  const h = { 'x-studio-token': 'e2etoken0123456789', 'content-type': 'application/json' };
  await request.patch('/api/author-profile', { headers: h, data: { about: { asked: false } } });
  await page.goto('/#t=e2etoken0123456789');
  const about = page.getByRole('region', { name: 'About you' });
  await expect(about).toContainText('Every answer is optional');
  await about.getByLabel('What should I call you?').fill('Sam');
  await about.getByRole('button', { name: 'they/them' }).click();
  await about.getByRole('button', { name: 'Somewhere in between' }).click();
  await about.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('region', { name: 'About you' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('region', { name: 'About you' })).toHaveCount(0);
  const p = await (await request.get('/api/author-profile', { headers: h })).json();
  expect(p.about).toMatchObject({ name: 'Sam', pronouns: 'they/them', approach: 'Somewhere in between', asked: true });
});
