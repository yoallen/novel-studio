import { describe, it, expect, afterEach } from 'vitest';
import { mkdirSync, writeFileSync, readFileSync, statSync, utimesSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { freshStore } from './helpers.js';
import { countWords } from '../src/core/manuscript.js';
import { laterIn, withoutLater } from '../src/core/later.js';
import { Progress } from '../src/core/progress.js';
import { RoadNotes, NOTES_DIR, headerFor, paragraphs } from '../src/core/roadnotes.js';
import { doorClosed } from '../src/core/goals.js';
import { Exporter } from '../src/core/io/exporter.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

describe('notes left for later', () => {
  it('finds every [[note]], and never counts it as story words', () => {
    expect(laterIn('She opened the door. [[what colour?]] It was red. [[check her mother’s name]]').map((n) => n.note)).toEqual(['what colour?', 'check her mother’s name']);
    expect(countWords('She opened the door. [[what colour is it, really?]] It was red.')).toBe(7);
    expect(withoutLater('a [[b c]] d')).toBe('a   d');
    // An unfinished bracket is just text, and a note never runs across lines.
    expect(laterIn('[[not closed\nstill not]]')).toEqual([]);
    expect(countWords('[[not closed')).toBe(2);
  });

  it('lists them in manuscript order with where they sit, and the export says they are still in', async () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const c1 = env.ms.addChapter(p.id), c2 = env.ms.addChapter(p.id);
    const a = env.ms.addScene(c2.id, { title: 'Garden', text: 'Kevin pulled weeds. [[what does Francine grow?]] Anthony watched. [[what does Francine grow?]]' });
    const b = env.ms.addScene(c1.id, { title: 'Kitchen', text: 'No notes here.' });
    const c = env.ms.addScene(c1.id, { title: 'Porch', text: 'She sat. [[year her husband died]]' });
    expect(env.ms.scene(a.id).word_count).toBe(5);
    const list = env.ms.laterNotes(p.id);
    expect(list.map((x) => [x.sceneTitle, x.note, x.nth])).toEqual([
      ['Porch', 'year her husband died', 0],
      ['Garden', 'what does Francine grow?', 0],
      ['Garden', 'what does Francine grow?', 1],
    ]);
    expect(list[0]!.before).toBe('She sat. ');
    void b; void c;
    const ex = new Exporter(env.store, env.brain, env.ms, null as never, null as never);
    const notes = ex.partsNote(p.id, { format: 'docx', manuscript: true, sections: [] } as never);
    expect(notes.join(' ')).toMatch(/3 notes left for later/);
    expect(ex.partsNote(p.id, { format: 'docx', manuscript: true, sections: [], chapterIds: [c1.id] } as never).join(' ')).toMatch(/1 note left for later/);
  });
});

describe('sprints', () => {
  it('counts what was typed since the sprint began, across scenes and past midnight', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const ch = env.ms.addChapter(p.id);
    const s1 = env.ms.addScene(ch.id), s2 = env.ms.addScene(ch.id);
    const words = (n: number) => Array.from({ length: n }, (_, i) => `w${i}`).join(' ');
    const type = (id: string, n: number, at: string) => {
      const s = env.ms.scene(id);
      env.ms.saveScene(id, { doc: env.doc(words(n)), expectVersion: s.prose_version as number });
      const last = env.store.db.prepare('SELECT id FROM scene_revisions WHERE scene_id=? ORDER BY rowid DESC LIMIT 1').get(id) as { id: string };
      env.store.db.prepare('UPDATE scene_revisions SET created_at=? WHERE id=?').run(at, last.id);
    };
    type(s1.id, 300, '2026-11-01T03:00:00.000Z'); // before the sprint
    type(s1.id, 500, '2026-11-01T03:50:00.000Z');
    type(s2.id, 250, '2026-11-01T04:10:00.000Z'); // after midnight in New York
    const progress = new Progress(env.store, env.ms);
    expect(progress.wordsSince(p.id, '2026-11-01T03:45:00.000Z')).toBe(450);
  });
});

describe('door closed', () => {
  it('is closed through the day she chose and opens on its own after', () => {
    expect(doorClosed({ doorClosedUntil: '2026-11-30' }, '2026-11-30')).toBe(true);
    expect(doorClosed({ doorClosedUntil: '2026-11-30' }, '2026-12-01')).toBe(false);
    expect(doorClosed({ doorClosedUntil: null }, '2026-11-01')).toBe(false);
    env = freshStore();
    const p = env.brain.createProject('IDW');
    expect(env.brain.updateSettings(p.id, { doorClosedUntil: '2026-11-30' }).doorClosedUntil).toBe('2026-11-30');
    // Other settings saved later keep it.
    expect(env.brain.updateSettings(p.id, { byline: 'Nadia Simone Brooks' }).doorClosedUntil).toBe('2026-11-30');
    expect(env.brain.updateSettings(p.id, { doorClosedUntil: null }).doorClosedUntil).toBeNull();
  });
});

describe('notes from the road', () => {
  const setupNotes = () => {
    env = freshStore();
    const shared = join(env.dir, 'OneDrive');
    mkdirSync(shared);
    let clock = Date.now();
    const notes = new RoadNotes(env.store, env.brain, () => shared, () => clock);
    // Files are dated a minute ago unless a test says otherwise, so they count as finished.
    const write = (path: string, text: string, ageMs = 120_000) => { writeFileSync(path, text); const t = new Date(clock - ageMs); utimesSync(path, t, t); };
    return { shared, notes, write, tick: (ms: number) => { clock += ms; }, now: () => clock };
  };

  it('makes one notes file per novel, brings in each finished paragraph once, and never changes her file', async () => {
    const { shared, notes, write, tick } = setupNotes();
    const p = env.brain.createProject('I Declare War');
    const at = (await notes.ensure(p.id))!;
    expect(at.path).toBe(join(shared, NOTES_DIR, 'I Declare War.docx'));
    expect(await paragraphs(at.path)).toEqual([headerFor('I Declare War')]);
    // Making the file records nothing in the novel.
    expect(env.brain.project(p.id).profile.roadNotes).toBeUndefined();

    // Just opened or just woken: it waits a few minutes for the other computer's work first.
    const txt = at.path.replace(/\.docx$/, '.txt');
    const { unlinkSync } = await import('node:fs');
    unlinkSync(at.path);
    write(txt, 'Kevin hums when he lies.\n\nFrancine keeps the seed packets in a coffee can.\n');
    expect((await notes.check(p.id)).added).toBe(0);
    tick(60_000); expect((await notes.check(p.id)).added).toBe(0);
    tick(60_000); expect((await notes.check(p.id)).added).toBe(0);
    tick(61_000);
    const before = readFileSync(txt, 'utf8');
    expect((await notes.check(p.id)).added).toBe(2);
    const thoughts = env.brain.elements(p.id, { kind: 'thought' });
    expect(thoughts.map((t) => t.body).sort()).toEqual(['Francine keeps the seed packets in a coffee can.', 'Kevin hums when he lies.']);
    expect(JSON.parse(thoughts[0]!.attrs_json as string).from).toBe('Notes from the road');
    expect((await notes.check(p.id)).added).toBe(0);

    // A note still being dictated waits until the file has been still for a minute.
    tick(30_000);
    write(txt, before + 'Anthony says it at the funer', 0);
    expect((await notes.check(p.id)).added).toBe(0);
    tick(20_000);
    write(txt, before + 'Anthony says it at the funeral, not the garden.\n', 0);
    tick(30_000); expect((await notes.check(p.id)).added).toBe(0);
    tick(31_000); expect((await notes.check(p.id)).added).toBe(1);
    expect(env.brain.elements(p.id, { kind: 'thought' }).map((t) => t.body)).not.toContain('Anthony says it at the funer');
    expect(readFileSync(txt, 'utf8')).toBe(before + 'Anthony says it at the funeral, not the garden.\n');

    // What came in is remembered with the novel, so the other computer will not bring it in again.
    const other = new RoadNotes(env.store, env.brain, () => shared, () => Date.now() + 10 * 60_000, { quietMs: 0, wakeHoldMs: 0 });
    expect((await other.check(p.id)).added).toBe(0);
  });

  it('keeps the file she knows when the novel is renamed, and gives a same-named novel its own', async () => {
    const { shared, notes } = setupNotes();
    const a = env.brain.createProject('Francine');
    const b = env.brain.createProject('Francine');
    expect((await notes.ensure(a.id))!.file).toBe('Francine.docx');
    expect((await notes.ensure(b.id))!.file).toBe('Francine (2).docx');
    env.brain.updateProject(a.id, { title: 'Miss Francine' });
    expect((await notes.ensure(a.id))!.path).toBe(join(shared, NOTES_DIR, 'Francine.docx'));
  });

  it('does nothing when sharing is off', async () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const notes = new RoadNotes(env.store, env.brain, () => null);
    expect(await notes.ensure(p.id)).toBeNull();
    expect((await notes.check(p.id)).added).toBe(0);
    void statSync; void existsSync;
  });
});

describe('counts made before notes for later existed', () => {
  it('are recounted once, so no day shows words cut that never were', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const ch = env.ms.addChapter(p.id);
    const s = env.ms.addScene(ch.id, { text: 'one two [[three four five]] six' });
    env.store.db.prepare('UPDATE scenes SET word_count=6 WHERE id=?').run(s.id);
    env.store.db.prepare('UPDATE scene_revisions SET word_count=6 WHERE scene_id=?').run(s.id);
    expect(env.ms.recountLater()).toBeGreaterThan(0);
    expect(env.ms.scene(s.id).word_count).toBe(3);
    expect((env.store.db.prepare('SELECT word_count FROM scene_revisions WHERE scene_id=?').get(s.id) as { word_count: number }).word_count).toBe(3);
    expect(env.ms.recountLater()).toBe(0); // only once
  });
});

describe('only one computer brings in notes', () => {
  it('when both have the novel open, the one with the lower id takes the turn', async () => {
    const { Sync } = await import('../src/core/sync.js');
    env = freshStore();
    const shared = join(env.dir, 'OneDrive');
    mkdirSync(shared);
    const sync = new Sync(env.store, async () => {});
    sync.configure({ dir: shared, name: 'Surface' });
    const p = env.brain.createProject('IDW');
    const dir = join(shared, 'Story Canon shared', 'computers');
    mkdirSync(dir, { recursive: true });
    const seen = (id: string, open: string | null, ago = 0) => writeFileSync(join(dir, `${id}.json`), JSON.stringify({ name: 'Laptop', lastSeen: new Date(Date.now() - ago).toISOString(), open, unshared: [] }));
    expect(sync.notesTurn(p.id)).toBe(true);
    seen('00000000-lower', p.id);
    expect(sync.notesTurn(p.id)).toBe(false);
    seen('00000000-lower', p.id, 10 * 60_000); // asleep for a while: its turn passes
    expect(sync.notesTurn(p.id)).toBe(true);
    seen('00000000-lower', 'another-novel');
    expect(sync.notesTurn(p.id)).toBe(true);
    seen('zzzzzzzz-higher', p.id);
    expect(sync.notesTurn(p.id)).toBe(true);
  });
});
