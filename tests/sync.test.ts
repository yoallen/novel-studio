import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { freshStore } from './helpers.js';
import { Sync } from '../src/core/sync.js';

// Two computers, one shared folder (her OneDrive). Each has its own library.
let envs: ReturnType<typeof freshStore>[] = [];
let shared = '';
afterEach(() => { envs.forEach((e) => e.cleanup()); envs = []; if (shared) rmSync(shared, { recursive: true, force: true }); });

function computers() {
  shared = mkdtempSync(join(tmpdir(), 'onedrive-'));
  const make = (name: string) => {
    const env = freshStore(); envs.push(env);
    let backups = 0;
    const sync = new Sync(env.store, async () => { backups++; });
    sync.configure({ dir: shared, name });
    return { env, sync, backups: () => backups };
  };
  return { laptop: make('Laptop'), surface: make('Surface') };
}
const scenesText = (env: ReturnType<typeof freshStore>, pid: string) => (env.store.db.prepare('SELECT text FROM scenes WHERE project_id=? AND deleted_at IS NULL ORDER BY position').all(pid) as { text: string }[]).map((r) => r.text);
const wait = () => new Promise((r) => setTimeout(r, 5));

describe('sharing a novel between her computers', () => {
  it('a novel written on the laptop is brought to the Surface whole, and the seed offer does not duplicate it', async () => {
    const { laptop, surface } = computers();
    const pid = laptop.env.brain.createProject('I Declare War').id as string;
    const ch = laptop.env.ms.addChapter(pid, 'One'); laptop.env.ms.addScene(ch.id as string, { title: 'Fence', text: 'Kevin glared at the fence.' });
    expect(laptop.sync.share(pid).shared).toBe(true);
    expect(laptop.sync.share(pid).shared).toBe(false); // nothing new, nothing sent

    expect(surface.sync.elsewhere()).toMatchObject([{ projectId: pid, title: 'I Declare War', deviceName: 'Laptop' }]);
    expect(await surface.sync.bring(pid)).toMatchObject({ result: 'took', from: 'Laptop' });
    expect(scenesText(surface.env, pid)).toEqual(['Kevin glared at the fence.']);
    expect(surface.sync.elsewhere()).toEqual([]);
    expect(surface.sync.changedSinceShared(pid)).toBe(false);
  });

  it('lunch on the Surface, home to the laptop: the laptop takes the newer work after a backup, history included', async () => {
    const { laptop, surface } = computers();
    const pid = laptop.env.brain.createProject('I Declare War').id as string;
    const ch = laptop.env.ms.addChapter(pid, 'One'); const sc = laptop.env.ms.addScene(ch.id as string, { title: 'Fence', text: 'Kevin glared.' });
    laptop.sync.share(pid); await surface.sync.bring(pid);

    await wait();
    surface.env.ms.addScene(ch.id as string, { title: 'Lunch', text: 'Written at lunch on the Surface.' });
    expect(surface.sync.share(pid).shared).toBe(true);

    expect(laptop.sync.incoming(pid)).toMatchObject({ deviceName: 'Surface' });
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'took', from: 'Surface' });
    expect(laptop.backups()).toBe(1);
    expect(scenesText(laptop.env, pid)).toEqual(['Kevin glared.', 'Written at lunch on the Surface.']);
    expect(laptop.sync.incoming(pid)).toBeNull();
    // Story Trail came with it: the laptop can still undo the Surface's change.
    const hist = laptop.env.store.history(pid).map((h) => ({ reason: String(h.reason) }));
    expect(hist.some((h) => /Lunch/.test(h.reason))).toBe(true);
    void sc;

    // And back again, the other way.
    await wait();
    laptop.env.brain.createElement(pid, { kind: 'character', title: 'Miss Francine' });
    laptop.sync.share(pid);
    expect(await surface.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
    expect(surface.env.brain.elements(pid, { kind: 'character' }).map((e) => e.title)).toEqual(['Miss Francine']);
  });

  it('both computers changed the novel before sharing: nothing is overwritten, the other version comes in beside hers', async () => {
    const { laptop, surface } = computers();
    const pid = laptop.env.brain.createProject('I Declare War').id as string;
    const ch = laptop.env.ms.addChapter(pid, 'One'); laptop.env.ms.addScene(ch.id as string, { title: 'Fence', text: 'Start.' });
    laptop.sync.share(pid); await surface.sync.bring(pid);

    await wait();
    surface.env.ms.addScene(ch.id as string, { title: 'S', text: 'Surface words.' });
    surface.sync.share(pid);
    laptop.env.ms.addScene(ch.id as string, { title: 'L', text: 'Laptop words, never shared.' });

    const r = await laptop.sync.takeIncoming(pid);
    expect(r.result).toBe('kept_both');
    expect(r.copyTitle).toMatch(/^I Declare War \(from Surface, /);
    expect(scenesText(laptop.env, pid)).toEqual(['Start.', 'Laptop words, never shared.']);
    expect(scenesText(laptop.env, r.copyId!)).toEqual(['Start.', 'Surface words.']);

    // The laptop's version is shared next, and the Surface (unchanged since its share) takes it; its own words live on in the copy.
    expect(laptop.sync.share(pid).shared).toBe(true);
    await wait();
    expect(await surface.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
    expect(scenesText(surface.env, pid)).toEqual(['Start.', 'Laptop words, never shared.']);
  });

  it('a damaged or half-arrived copy is never used', async () => {
    const { laptop, surface } = computers();
    const pid = laptop.env.brain.createProject('Book').id as string;
    const { copy } = laptop.sync.share(pid);
    const f = join(shared, 'Story Canon shared', pid, copy!.file);
    const b = readFileSync(f); writeFileSync(f, b.subarray(0, b.length - 10));
    await expect(surface.sync.bring(pid)).rejects.toThrow(/incomplete/);
    expect(surface.env.store.get('projects', pid)).toBeUndefined();
  });

  it('only a few copies per computer are kept in the shared folder', async () => {
    const { laptop } = computers();
    const pid = laptop.env.brain.createProject('Book').id as string;
    for (let i = 0; i < 8; i++) { laptop.env.brain.createElement(pid, { kind: 'idea', title: `Idea ${i}` }); laptop.sync.share(pid); await wait(); }
    expect(readdirSync(join(shared, 'Story Canon shared', pid)).filter((f) => f.endsWith('.novel.gz'))).toHaveLength(5);
  });

  it('each computer says what it has open and what it has not shared yet', async () => {
    const { laptop, surface } = computers();
    const pid = laptop.env.brain.createProject('Book').id as string;
    laptop.sync.share(pid); await surface.sync.bring(pid);
    laptop.env.brain.createElement(pid, { kind: 'idea', title: 'Unshared' });
    laptop.sync.presence(pid);
    expect(surface.sync.status(pid)).toMatchObject({ on: true, busyElsewhere: [{ name: 'Laptop' }] });
    // Looking around (where she is in the book) is not a change worth sharing.
    expect(surface.sync.changedSinceShared(pid)).toBe(false);
  });

  it('one pass shares what changed and takes in newer work for novels not open in front of her', async () => {
    const { laptop, surface } = computers();
    const a = laptop.env.brain.createProject('Open one').id as string;
    const b = laptop.env.brain.createProject('Closed one').id as string;
    await laptop.sync.pass({ open: null, shareChanged: true });
    await surface.sync.bring(a); await surface.sync.bring(b);
    await wait();
    surface.env.brain.createElement(a, { kind: 'idea', title: 'x' }); surface.env.brain.createElement(b, { kind: 'idea', title: 'y' });
    await surface.sync.pass({ open: null, shareChanged: true });
    const r = await laptop.sync.pass({ open: a, shareChanged: false });
    expect(r.took).toEqual([b]);              // the open novel is never replaced under her
    expect(laptop.sync.status(a)).toMatchObject({ incoming: { deviceName: 'Surface' } });
  });
});

import { sameDoc } from '../src/core/manuscript.js';
describe('opening a page is not writing', () => {
  it('an empty scene tidied by the editor is the same page; real words and formatting still count', () => {
    expect(sameDoc({ type: 'doc', content: [] }, { type: 'doc', content: [{ type: 'paragraph' }] })).toBe(true);
    expect(sameDoc({ type: 'doc' }, { type: 'doc', content: [{ type: 'paragraph', attrs: { textAlign: null } }] })).toBe(true);
    const words = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }] };
    expect(sameDoc({ type: 'doc', content: [] }, words)).toBe(false);
    expect(sameDoc(words, { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi', marks: [{ type: 'bold' }] }] }] })).toBe(false);
  });
});
