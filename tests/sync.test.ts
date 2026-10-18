import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { freshStore } from './helpers.js';
import { Sync } from '../src/core/sync.js';
import { importArchive, exportArchive } from '../src/core/backup.js';
import { sameDoc } from '../src/core/manuscript.js';

// Two computers, one shared folder (her OneDrive). Each has its own library.
let envs: ReturnType<typeof freshStore>[] = [];
let shared = '';
afterEach(() => { envs.forEach((e) => e.cleanup()); envs = []; if (shared) rmSync(shared, { recursive: true, force: true }); });

function computers() {
  shared = mkdtempSync(join(tmpdir(), 'onedrive-'));
  const make = (name: string) => {
    const env = freshStore(); envs.push(env);
    let backups = 0;
    let duringBackup: (() => void) | null = null;
    const sync = new Sync(env.store, async () => { backups++; await new Promise((r) => setTimeout(r, 2)); const f = duringBackup; duringBackup = null; f?.(); });
    sync.configure({ dir: shared, name });
    return { env, sync, backups: () => backups, onBackup: (f: () => void) => { duringBackup = f; } };
  };
  return { laptop: make('Laptop'), surface: make('Surface') };
}
type PC = ReturnType<typeof computers>['laptop'];
const texts = (pc: PC, pid: string) => (pc.env.store.db.prepare('SELECT text FROM scenes WHERE project_id=? AND deleted_at IS NULL ORDER BY position').all(pid) as { text: string }[]).map((r) => r.text);
const titles = (pc: PC) => (pc.env.store.db.prepare('SELECT title FROM projects WHERE deleted_at IS NULL ORDER BY title').all() as { title: string }[]).map((r) => r.title);
const write = (pc: PC, chapterId: string, text: string) => pc.env.ms.addScene(chapterId, { title: text, text });
const tick = () => new Promise((r) => setTimeout(r, 5));

async function start() {
  const pcs = computers();
  const pid = pcs.laptop.env.brain.createProject('I Declare War').id as string;
  const ch = pcs.laptop.env.ms.addChapter(pid, 'One').id as string;
  write(pcs.laptop, ch, 'L0');
  await pcs.laptop.sync.share(pid);
  await pcs.surface.sync.bring(pid);
  await tick();
  return { ...pcs, pid, ch };
}

describe('sharing a novel between her computers', () => {
  it('a novel written on the laptop is brought to the Surface whole', async () => {
    const { laptop, surface, pid } = await start();
    expect((await laptop.sync.share(pid)).shared).toBe(false); // nothing new, nothing sent
    expect(texts(surface, pid)).toEqual(['L0']);
    expect(surface.sync.elsewhere()).toEqual([]);
    expect(surface.sync.changedSinceShared(pid)).toBe(false);
  });

  it('lunch on the Surface, home to the laptop, and back: each takes the other\'s newer work, history included', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1 lunch');
    await surface.sync.share(pid);
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'took', from: 'Surface' });
    expect(texts(laptop, pid)).toEqual(['L0', 'S1 lunch']);
    expect(laptop.env.store.history(pid).some((h) => /S1 lunch/.test(String(h.reason)))).toBe(true);
    await tick();
    write(laptop, ch, 'L2 evening');
    await laptop.sync.share(pid);
    expect(await surface.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
    expect(texts(surface, pid)).toEqual(['L0', 'S1 lunch', 'L2 evening']);
  });

  it('a novel left open on the laptop never wins over the Surface\'s unseen work', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1 lunch'); await surface.sync.share(pid);
    // The laptop has the novel open, so the pass does not take S1, but it shares its own new work.
    write(laptop, ch, 'L2 evening');
    await laptop.sync.pass({ protect: pid, shareChanged: true });
    expect(laptop.sync.incoming(pid)).toMatchObject({ deviceName: 'Surface' }); // still offered to her
    // The Surface sees two separate lines: it keeps its own and brings the laptop's in beside it.
    expect(await surface.sync.takeIncoming(pid)).toMatchObject({ result: 'kept_both' });
    expect(texts(surface, pid)).toEqual(['L0', 'S1 lunch']);
    expect(titles(surface).some((t) => /^I Declare War \(from Laptop, /.test(t))).toBe(true);
    // Nothing anyone wrote is gone anywhere.
    const lap = await laptop.sync.takeIncoming(pid);
    expect(lap.result).toBe('kept_both');
    expect(texts(laptop, pid)).toEqual(['L0', 'L2 evening']);
    expect(texts(laptop, lap.copyId!)).toContain('S1 lunch');
  });

  it('clocks do not matter: a Surface whose clock is behind keeps its own work', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1 lunch');
    const { copy } = await surface.sync.share(pid);
    const metaFile = join(shared, 'Story Canon shared', pid, copy!.file.replace('.novel.gz', '.meta.json'));
    const m = JSON.parse(readFileSync(metaFile, 'utf8')); m.sharedAt = '2020-01-01T00:00:00.000Z'; writeFileSync(metaFile, JSON.stringify(m));
    expect((await surface.sync.pass({ shareChanged: true })).took).toEqual([]);
    expect(texts(surface, pid)).toEqual(['L0', 'S1 lunch']);
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
    expect(texts(laptop, pid)).toEqual(['L0', 'S1 lunch']);
  });

  it('both computers changed the novel before sharing: nothing is overwritten, and they settle on one main version', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1'); await surface.sync.share(pid);
    write(laptop, ch, 'L1 never shared');
    const r = await laptop.sync.takeIncoming(pid);
    expect(r.result).toBe('kept_both');
    expect(r.copyTitle).toMatch(/^I Declare War \(from Surface, /);
    expect(texts(laptop, pid)).toEqual(['L0', 'L1 never shared']);
    expect(texts(laptop, r.copyId!)).toEqual(['L0', 'S1']);
    await laptop.sync.pass({ shareChanged: true });
    expect(await surface.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
    expect(texts(surface, pid)).toEqual(['L0', 'L1 never shared']);
    await surface.sync.pass({ shareChanged: true }); await laptop.sync.pass({ shareChanged: true });
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'nothing' });
    expect(await surface.sync.takeIncoming(pid)).toMatchObject({ result: 'nothing' });
  });

  it('typing during the backup is never lost: the take waits for next time', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1'); await surface.sync.share(pid);
    laptop.onBackup(() => write(laptop, ch, 'typed during backup'));
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'retry' });
    expect(texts(laptop, pid)).toEqual(['L0', 'typed during backup']);
    expect((await laptop.sync.takeIncoming(pid)).result).toBe('kept_both');
    expect(texts(laptop, pid)).toEqual(['L0', 'typed during backup']);
  });

  it('two takes at once make one result, not two copies', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1'); await surface.sync.share(pid);
    write(laptop, ch, 'L1');
    const [a, b] = await Promise.all([laptop.sync.takeIncoming(pid), laptop.sync.pass({ shareChanged: false })]);
    expect(a.result).toBe('kept_both');
    expect(b.keptBoth).toEqual([]);
    expect(titles(laptop).filter((t) => t.includes('(from Surface'))).toHaveLength(1);
  });

  it('the same starting novel on both computers, untouched, does not make a copy', async () => {
    const { laptop, surface } = computers();
    const pid = laptop.env.brain.createProject('Seed').id as string;
    laptop.env.brain.createElement(pid, { kind: 'character', title: 'Kevin' });
    importArchive(surface.env.store, exportArchive(laptop.env.store, pid));
    await laptop.sync.share(pid);
    expect(await surface.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
    expect(titles(surface)).toEqual(['Seed']);
  });

  it('stray files in the shared folder (desktop.ini) are ignored', async () => {
    const { laptop, surface } = computers();
    const pid = laptop.env.brain.createProject('Book').id as string;
    await laptop.sync.share(pid);
    writeFileSync(join(shared, 'Story Canon shared', 'desktop.ini'), '[.ShellClassInfo]');
    expect(surface.sync.elsewhere().map((x) => x.title)).toEqual(['Book']);
  });

  it('a damaged or half-arrived copy is never used', async () => {
    const { laptop, surface } = computers();
    const pid = laptop.env.brain.createProject('Book').id as string;
    const { copy } = await laptop.sync.share(pid);
    const f = join(shared, 'Story Canon shared', pid, copy!.file);
    const b = readFileSync(f); writeFileSync(f, b.subarray(0, b.length - 10));
    await expect(surface.sync.bring(pid)).rejects.toThrow(/incomplete/);
    expect(surface.env.store.get('projects', pid)).toBeUndefined();
  });

  it('only ten copies per computer are kept in the shared folder', async () => {
    const { laptop } = computers();
    const pid = laptop.env.brain.createProject('Book').id as string;
    for (let i = 0; i < 13; i++) { laptop.env.brain.createElement(pid, { kind: 'idea', title: `Idea ${i}` }); await laptop.sync.share(pid); await tick(); }
    expect(readdirSync(join(shared, 'Story Canon shared', pid)).filter((f) => f.endsWith('.novel.gz'))).toHaveLength(10);
  });

  it('each computer says what it has not shared yet; looking around is not a change', async () => {
    const { laptop, surface, pid } = await start();
    laptop.env.brain.createElement(pid, { kind: 'idea', title: 'Unshared' });
    await laptop.sync.presence(pid);
    expect(surface.sync.status(pid)).toMatchObject({ on: true, busyElsewhere: [{ name: 'Laptop' }] });
    surface.env.store.db.prepare("INSERT INTO trail(id,project_id,from_json,to_json,reason,created_at) VALUES ('t1',?,'{}','{}','look',?)").run(pid, new Date().toISOString());
    expect(surface.sync.changedSinceShared(pid)).toBe(false);
  });

  it('a pass takes newer work for novels she has not opened, and only offers it for the one she has', async () => {
    const { laptop, surface } = computers();
    const a = laptop.env.brain.createProject('Open one').id as string;
    const b = laptop.env.brain.createProject('Closed one').id as string;
    await laptop.sync.pass({ shareChanged: true });
    await surface.sync.bring(a); await surface.sync.bring(b);
    surface.env.brain.createElement(a, { kind: 'idea', title: 'x' }); surface.env.brain.createElement(b, { kind: 'idea', title: 'y' });
    await surface.sync.pass({ shareChanged: true });
    const before = laptop.backups();
    const r = await laptop.sync.pass({ protect: new Set([a]), shareChanged: false });
    expect(r.took).toEqual([b]);
    expect(laptop.sync.status(a)).toMatchObject({ incoming: { deviceName: 'Surface' } });
    expect(laptop.backups() - before).toBe(1); // one backup for the whole pass
  });
});

describe('opening a page is not writing', () => {
  it('an empty scene tidied by the editor is the same page; real words and formatting still count', () => {
    expect(sameDoc({ type: 'doc', content: [] }, { type: 'doc', content: [{ type: 'paragraph' }] })).toBe(true);
    expect(sameDoc({ type: 'doc' }, { type: 'doc', content: [{ type: 'paragraph', attrs: { textAlign: null } }] })).toBe(true);
    const words = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] }] };
    expect(sameDoc({ type: 'doc', content: [] }, words)).toBe(false);
    expect(sameDoc(words, { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hi', marks: [{ type: 'bold' }] }] }] })).toBe(false);
  });
});
