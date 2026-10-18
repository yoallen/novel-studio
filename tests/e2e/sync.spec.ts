import { test, expect } from '@playwright/test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../../src/core/store';
import { Manuscript } from '../../src/core/manuscript';
import { Sync } from '../../src/core/sync';
import { newNovel, heroWrite, TOKEN } from './helpers';

// The window is the laptop. The test plays the Surface, sharing through the same folder.
test('work done on the other computer comes in with one click, and the Surface shows up by name', async ({ page, request }) => {
  const shared = mkdtempSync(join(tmpdir(), 'onedrive-e2e-'));
  const surfaceDir = mkdtempSync(join(tmpdir(), 'surface-'));
  const views = page.getByRole('navigation', { name: 'Views' });
  try {
    await newNovel(page, 'Shared Book');
    await heroWrite(page).click();
    await views.getByRole('button', { name: 'Settings' }).click();
    const sync = page.getByRole('region', { name: 'Your other computers' });
    await sync.getByLabel('Call this computer').fill('Laptop');
    await sync.getByRole('textbox', { name: 'Shared folder' }).fill(shared);
    await sync.getByRole('button', { name: 'Share through this folder' }).click();
    await expect(sync).toContainText('This computer is Laptop');
    await expect(sync).toContainText('No other computer has joined yet');

    // The Surface brings the novel in, writes a scene at lunch, and shares it.
    const store = new Store(join(surfaceDir, 'lib.sqlite3'));
    const surface = new Sync(store, async () => {});
    surface.configure({ dir: shared, name: 'Surface' });
    const novel = surface.elsewhere().find((x) => x.title === 'Shared Book')!;
    await surface.bring(novel.projectId);
    const ch = new Manuscript(store).outline(novel.projectId)[0] as { id: string };
    await new Promise((r) => setTimeout(r, 20));
    new Manuscript(store).addScene(ch.id, { title: 'Lunch scene', text: 'Written at lunch.' });
    await surface.share(novel.projectId);
    await surface.presence(null);
    store.close();

    await page.reload();
    const notice = page.getByRole('region', { name: 'Newer work from your other computer' });
    await expect(notice).toContainText('Your Surface shared newer work on this novel');
    await Promise.all([page.waitForEvent('load'), notice.getByRole('button', { name: 'Bring it in' }).click()]);
    await expect(notice).toHaveCount(0);
    await views.getByRole('button', { name: 'The Writing Room' }).click();
    await expect(page.getByRole('complementary', { name: 'Chapters and scenes' })).toContainText('Lunch scene');
    // Looking around is not writing: visiting every room leaves nothing to share.
    for (const v of ['Where was I', 'Story Brain', 'Narrative Zoom', 'Conversations', 'Search', 'Story Trail', 'Import and export']) {
      await views.getByRole('button', { name: v }).click();
      await page.waitForTimeout(300);
    }
    await page.getByRole('button', { name: 'Open novel setup' }).count();
    await views.getByRole('button', { name: 'Settings' }).click();
    await page.getByRole('button', { name: 'Open novel setup' }).click();
    await page.waitForTimeout(500);
    await views.getByRole('button', { name: 'Settings' }).click();
    const box = page.getByRole('region', { name: 'Your other computers' });
    await expect(box).toContainText('Also sharing: Surface');
    await expect(box).not.toContainText('changes not shared yet');
  } finally {
    await request.delete('/api/sync', { headers: { 'x-studio-token': TOKEN } });
    rmSync(shared, { recursive: true, force: true }); rmSync(surfaceDir, { recursive: true, force: true });
  }
});
