import { describe, it, expect, afterEach } from 'vitest';
import { join } from 'node:path';
import { freshStore } from './helpers.js';
import { Store } from '../src/core/store.js';
import { Brain } from '../src/core/brain.js';
import { exportArchive, importArchive, planImport, snapshot, listSnapshots } from '../src/core/backup.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

function buildNovel() {
  const p = env.brain.createProject('I Declare War', { genres: [{ name: 'Comedy', role: 'primary' }] });
  const pid = p.id as string;
  const k = env.brain.createElement(pid, { kind: 'character', title: 'Kevin Wickley' });
  const a = env.brain.createElement(pid, { kind: 'character', title: 'Anthony Vernon' });
  env.brain.addStatement({ elementId: k.id, field: 'lie', value: 'If I let my guard down, I could lose everything again.', status: 'developing', speaker: { kind: 'author' } });
  env.brain.link(pid, { fromId: k.id, toId: a.id, relation: 'relates_to' });
  const ch = env.ms.addChapter(pid, 'Chapter 1');
  const s = env.ms.addScene(ch.id, { title: 'Fish guts', text: 'The smell hit Anthony before the sun did. “Yo.” — 😀' });
  env.ms.saveScene(s.id as string, { doc: env.doc('The smell hit Anthony before the sun did. Revised.'), expectVersion: s.prose_version as number });
  return { pid, k, a, s };
}

describe('project archive (AC15, D7, D10 to D13)', () => {
  it('round-trips into an empty library with the same IDs, history, links and prose', () => {
    env = freshStore();
    const { pid, s } = buildNovel();
    const archive = exportArchive(env.store, pid);
    const other = freshStore();
    try {
      const res = importArchive(other.store, JSON.parse(JSON.stringify(archive)));
      expect(res.plan.mode).toBe('restore');
      expect(res.projectId).toBe(pid);
      const again = exportArchive(other.store, pid);
      expect(again.checksums).toEqual(archive.checksums);
      expect(other.ms.scene(s.id as string).text).toContain('Revised.');
      expect(other.store.history(pid).length).toBe(env.store.history(pid).length);
      expect(new Brain(other.store).project(pid).profile.genres[0].name).toBe('Comedy');
    } finally { other.cleanup(); }
  });

  it('importing the same archive again does not duplicate the novel', () => {
    env = freshStore();
    const { pid } = buildNovel();
    const archive = exportArchive(env.store, pid);
    const res = importArchive(env.store, archive);
    expect(res.imported).toBe(false);
    expect(env.brain.listProjects()).toHaveLength(1);
  });

  it('can import deliberately as a separate copy with new IDs, leaving the original untouched', () => {
    env = freshStore();
    const { pid } = buildNovel();
    const archive = exportArchive(env.store, pid);
    const res = importArchive(env.store, archive, { asCopy: true });
    expect(res.projectId).not.toBe(pid);
    expect(env.brain.listProjects()).toHaveLength(2);
    const copy = exportArchive(env.store, res.projectId);
    expect(copy.counts).toEqual(archive.counts);
    expect(env.ms.outline(res.projectId)[0]!.scenes[0]!.title).toBe('Fish guts');
  });

  it('refuses damaged, edited or future-version archives with a clear reason', () => {
    env = freshStore();
    const { pid } = buildNovel();
    const archive = exportArchive(env.store, pid);
    const tampered = JSON.parse(JSON.stringify(archive));
    tampered.tables.scenes[0].text = 'silently changed';
    const other = freshStore();
    try {
      expect(planImport(other.store, tampered).problems.join(' ')).toMatch(/checksum/);
      expect(() => importArchive(other.store, tampered)).toThrow(/cannot be imported safely/);
      expect(() => importArchive(other.store, { ...archive, format_version: 99 })).toThrow(/newer version/);
      expect(() => importArchive(other.store, { format: 'something-else' })).toThrow(/not a Novel Studio archive/);
      expect(new Brain(other.store).listProjects()).toHaveLength(0);
    } finally { other.cleanup(); }
  });
});

describe('database snapshots', () => {
  it('writes a verified, openable snapshot and rotates old ones', async () => {
    env = freshStore();
    const { pid } = buildNovel();
    const dir = join(env.dir, 'backups');
    for (let i = 0; i < 4; i++) await snapshot(env.store, dir, 'auto', 3);
    const snaps = listSnapshots(dir);
    expect(snaps).toHaveLength(3);
    const reopened = new Store(snaps[0]!.file);
    expect(new Brain(reopened).project(pid).title).toBe('I Declare War');
    reopened.close();
  });
});
