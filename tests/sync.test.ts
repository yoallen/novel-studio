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
    sync.configure({ dir: shared, name }); sync.setAsking(false);
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

  it('a novel left open on the laptop never wins over the Surface\'s unseen work: she is asked, and nothing is lost', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1 lunch'); await surface.sync.share(pid);
    write(laptop, ch, 'L2 evening');
    await laptop.sync.pass({ protect: pid, shareChanged: true });
    // Neither computer decides on its own.
    expect(await surface.sync.takeIncoming(pid)).toMatchObject({ result: 'diverged' });
    expect(texts(surface, pid)).toEqual(['L0', 'S1 lunch']);
    expect(laptop.sync.status(pid)).toMatchObject({ diverged: { deviceName: 'Surface' } });
    expect(titles(surface)).toEqual(['I Declare War']);
    // She chooses on the laptop: hers stays main, the Surface's is kept beside it.
    const r = await laptop.sync.resolve(pid, 'mine');
    expect(r).toMatchObject({ result: 'kept_both' });
    expect(texts(laptop, pid)).toEqual(['L0', 'L2 evening']);
    expect(texts(laptop, r.copyId!)).toEqual(['L0', 'S1 lunch']);
    // The Surface follows her choice and receives the version kept beside, so both computers hold both.
    const p = await surface.sync.pass({ shareChanged: true });
    expect(p.took).toContain(pid);
    expect(texts(surface, pid)).toEqual(['L0', 'L2 evening']);
    expect(texts(surface, r.copyId!)).toEqual(['L0', 'S1 lunch']);
    expect(surface.sync.status(pid)).toMatchObject({ diverged: null, incoming: null });
    expect(laptop.sync.status(pid)).toMatchObject({ diverged: null, incoming: null });
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

  it('both changed, and she makes the other computer\'s the main version: hers is kept beside it', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1'); await surface.sync.share(pid);
    write(laptop, ch, 'L1 never shared');
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'diverged' });
    const r = await laptop.sync.resolve(pid, 'theirs');
    expect(r.copyTitle).toMatch(/^I Declare War \(Laptop version, /);
    expect(texts(laptop, pid)).toEqual(['L0', 'S1']);
    expect(texts(laptop, r.copyId!)).toEqual(['L0', 'L1 never shared']);
    await laptop.sync.pass({ shareChanged: true });
    await surface.sync.pass({ shareChanged: true });
    expect(texts(surface, pid)).toEqual(['L0', 'S1']);
    expect(texts(surface, r.copyId!)).toEqual(['L0', 'L1 never shared']);
    // Settled: nothing more either way, and no extra copies.
    await laptop.sync.pass({ shareChanged: true }); await surface.sync.pass({ shareChanged: true });
    expect(laptop.sync.status(pid)).toMatchObject({ diverged: null, incoming: null });
    expect(titles(laptop)).toHaveLength(2); expect(titles(surface)).toHaveLength(2);
  });

  it('while both keep writing before she chooses, no copies pile up', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(laptop, ch, 'L1');
    for (const t of ['S1', 'S2', 'S3']) { write(surface, ch, t); await surface.sync.share(pid); await laptop.sync.pass({ shareChanged: false }); }
    expect(titles(laptop)).toEqual(['I Declare War']);
    expect(laptop.sync.status(pid)).toMatchObject({ diverged: { deviceName: 'Surface' } });
    const r = await laptop.sync.resolve(pid, 'mine');
    expect(texts(laptop, r.copyId!)).toEqual(['L0', 'S1', 'S2', 'S3']);
  });

  it('a laptop left unused through many shares simply catches up', async () => {
    const { laptop, surface, pid, ch } = await start();
    for (let i = 0; i < 30; i++) { surface.env.brain.createElement(pid, { kind: 'idea', title: `Idea ${i}` }); await surface.sync.share(pid); }
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
    expect(laptop.env.brain.elements(pid, { kind: 'idea' })).toHaveLength(30);
    void ch;
  });

  it('typing kept for crash recovery stays on its own computer and is never wiped by a take', async () => {
    const { laptop, surface, pid, ch } = await start();
    const sc = laptop.env.store.db.prepare('SELECT id, prose_version FROM scenes WHERE project_id=?').get(pid) as { id: string; prose_version: number };
    laptop.env.ms.autosave(sc.id, laptop.env.doc('Unsaved words before the power went out.'), sc.prose_version);
    expect(laptop.sync.changedSinceShared(pid)).toBe(false);
    write(surface, ch, 'S1'); await surface.sync.share(pid);
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
    expect(laptop.env.ms.pendingRecoveries(pid).length).toBe(1);
  });

  it('typing during the backup is never lost: the take waits for next time', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1'); await surface.sync.share(pid);
    laptop.onBackup(() => write(laptop, ch, 'typed during backup'));
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'retry' });
    expect(texts(laptop, pid)).toEqual(['L0', 'typed during backup']);
    expect((await laptop.sync.takeIncoming(pid)).result).toBe('diverged');
    expect(texts(laptop, pid)).toEqual(['L0', 'typed during backup']);
  });

  it('two operations at once never collide', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1'); await surface.sync.share(pid);
    write(laptop, ch, 'L1');
    const [a, b] = await Promise.all([laptop.sync.resolve(pid, 'mine'), laptop.sync.resolve(pid, 'mine')]);
    expect([a.result, b.result].sort()).toEqual(['kept_both', 'nothing']);
    expect(titles(laptop).filter((t) => t.includes('(from Surface'))).toHaveLength(1);
  });

  it('history inside a kept-beside copy points at the copy\'s own rows', async () => {
    const { laptop, surface, pid, ch } = await start();
    write(surface, ch, 'S1'); await surface.sync.share(pid);
    write(laptop, ch, 'L1');
    const r = await laptop.sync.resolve(pid, 'mine');
    const originals = new Set((laptop.env.store.db.prepare('SELECT id FROM scenes WHERE project_id=?').all(pid) as { id: string }[]).map((x) => x.id));
    const j = laptop.env.store.db.prepare('SELECT j.before_json, j.after_json FROM journal j JOIN batches b ON b.id=j.batch_id WHERE b.project_id=?').all(r.copyId) as { before_json: string; after_json: string }[];
    expect(j.length).toBeGreaterThan(0);
    for (const x of j) for (const id of originals) expect(`${x.before_json}${x.after_json}`).not.toContain(id);
  });

  it('the same starting novel on both computers, untouched, does not make a copy', async () => {
    const { laptop, surface } = computers();
    const pid = laptop.env.brain.createProject('Seed').id as string;
    laptop.env.brain.createElement(pid, { kind: 'character', title: 'Kevin' });
    importArchive(surface.env.store, exportArchive(laptop.env.store, pid));
    await laptop.sync.share(pid);
    expect(await surface.sync.takeIncoming(pid)).toMatchObject({ result: 'same' });
    expect(titles(surface)).toEqual(['Seed']);
    // And from then on they follow each other normally.
    surface.env.brain.createElement(pid, { kind: 'idea', title: 'From the Surface' });
    await surface.sync.share(pid);
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
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

describe('asking first', () => {
  it('by default nothing comes in on its own: it waits for her to bring it in', async () => {
    const { laptop, surface, pid, ch } = await start();
    laptop.sync.setAsking(true);
    write(surface, ch, 'S1'); await surface.sync.share(pid);
    expect((await laptop.sync.pass({ shareChanged: true })).took).toEqual([]);
    expect(texts(laptop, pid)).toEqual(['L0']);
    expect(laptop.sync.status(pid)).toMatchObject({ ask: true, incoming: { deviceName: 'Surface' } });
    expect(await laptop.sync.takeIncoming(pid)).toMatchObject({ result: 'took' });
    expect(texts(laptop, pid)).toEqual(['L0', 'S1']);
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
