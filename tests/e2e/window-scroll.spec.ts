import { test, expect } from '@playwright/test';
import { newNovel, TOKEN } from './helpers';
const H = { 'x-studio-token': TOKEN, 'content-type': 'application/json' };
test('the window never scrolls past the page: no blank cream area under Where was I?', async ({ page, request }) => {
  await newNovel(page, 'Scroll One');
  const list = await (await request.get('/api/projects', { headers: H })).json();
  const pid = list.find((p: any) => p.title === 'Scroll One').id;
  const d = new Date(); const t = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  await request.patch(`/api/projects/${pid}/settings`, { headers: H, data: { push: { name: 'P', start: t, end: t, words: 30 } } });
  await page.setViewportSize({ width: 1400, height: 700 });
  await page.reload();
  await page.getByRole('navigation', { name: 'Views' }).getByRole('button', { name: /Where was I/ }).click();
  await page.getByRole('tab', { name: /Today/ }).click();
  await page.waitForTimeout(500);
  // The window itself never scrolls: only the page inside it does, so there is no blank cream below.
  for (const tab of [/Today/, /All pages/, /Still open/, /The shelf/]) {
    await page.getByRole('tab', { name: tab }).click();
    await page.waitForTimeout(200);
    expect(await page.evaluate(() => document.scrollingElement!.scrollHeight - innerHeight), String(tab)).toBeLessThanOrEqual(1);
  }
  if (process.env.SHOT_DIR) {
    await page.getByRole('tab', { name: /Today/ }).click();
    await page.evaluate(() => { for (const el of document.querySelectorAll('.scroll')) el.scrollTop = el.scrollHeight; window.scrollTo(0, 99999); });
    await page.screenshot({ path: `${process.env.SHOT_DIR}/today-bottom.png` });
  }
});
