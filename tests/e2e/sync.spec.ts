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
    await expect(sync.getByRole('checkbox', { name: /Ask me before bringing in work/ })).toBeChecked();

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

// Both computers changed the novel: she is asked, and both versions are kept.
test('when both computers changed a novel, she chooses the main version and the other is kept beside it', async ({ page, request }) => {
  const shared = mkdtempSync(join(tmpdir(), 'onedrive-e2e-'));
  const surfaceDir = mkdtempSync(join(tmpdir(), 'surface-'));
  const views = page.getByRole('navigation', { name: 'Views' });
  const h = { headers: { 'x-studio-token': TOKEN } };
  try {
    await newNovel(page, 'Fork Book');
    await views.getByRole('button', { name: 'Settings' }).click();
    const box = page.getByRole('region', { name: 'Your other computers' });
    await box.getByLabel('Call this computer').fill('Laptop');
    await box.getByRole('textbox', { name: 'Shared folder' }).fill(shared);
    await box.getByRole('button', { name: 'Share through this folder' }).click();
    await expect(box).toContainText('This computer is Laptop');

    const store = new Store(join(surfaceDir, 'lib.sqlite3'));
    const surface = new Sync(store, async () => {});
    surface.configure({ dir: shared, name: 'Surface' });
    const pid = surface.elsewhere().find((x) => x.title === 'Fork Book')!.projectId;
    await surface.bring(pid);
    const ch = new Manuscript(store).outline(pid)[0] as { id: string };
    new Manuscript(store).addScene(ch.id, { title: 'Surface scene', text: 'From the Surface.' });
    await surface.share(pid);
    store.close();

    // Meanwhile the laptop wrote something of its own, not shared yet.
    const chapters = await (await request.get(`/api/projects/${pid}/outline`, h)).json();
    await request.post(`/api/chapters/${chapters.chapters[0].id}/scenes`, { ...h, data: { title: 'Laptop scene' } });

    await page.reload();
    const fork = page.getByRole('region', { name: 'Both computers changed this novel' });
    await expect(fork).toContainText('This computer and your Surface both changed this novel');
    await Promise.all([page.waitForEvent('load'), fork.getByRole('button', { name: "Keep this computer's as the main version" }).click()]);
    await expect(page.getByRole('status').filter({ hasText: 'Both versions are kept' })).toContainText('Fork Book (from Surface');
    await page.getByRole('button', { name: 'Library', exact: true }).click();
    await expect(page.getByRole('list', { name: 'Your novels' })).toContainText('Fork Book (from Surface');
  } finally {
    await request.delete('/api/sync', h);
    rmSync(shared, { recursive: true, force: true }); rmSync(surfaceDir, { recursive: true, force: true });
  }
});
