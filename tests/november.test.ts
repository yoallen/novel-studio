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
  it('makes one notes file per novel, brings in each new paragraph once, and never changes her file', async () => {
    env = freshStore();
    const shared = join(env.dir, 'OneDrive');
    mkdirSync(shared);
    const p = env.brain.createProject('I Declare War');
    const notes = new RoadNotes(env.store, env.brain, () => shared);
    const at = (await notes.ensure(p.id))!;
    expect(at.path).toBe(join(shared, NOTES_DIR, 'I Declare War.docx'));
    expect(existsSync(at.path)).toBe(true);
    expect(await paragraphs(at.path)).toEqual([headerFor('I Declare War')]);
    // The header is not a note.
    expect((await notes.check(p.id)).added).toBe(0);

    // She uses a plain text file instead: it is found under the same name.
    const txt = at.path.replace(/\.docx$/, '.txt');
    const { unlinkSync } = await import('node:fs');
    unlinkSync(at.path);
    writeFileSync(txt, 'Kevin hums when he lies.\n\nFrancine keeps the seed packets in a coffee can.\n');
    const before = readFileSync(txt, 'utf8');
    expect((await notes.check(p.id)).added).toBe(2);
    const thoughts = env.brain.elements(p.id, { kind: 'thought' });
    expect(thoughts.map((t) => t.body).sort()).toEqual(['Francine keeps the seed packets in a coffee can.', 'Kevin hums when he lies.']);
    expect(JSON.parse(thoughts[0]!.attrs_json as string).from).toBe('Notes from the road');

    // Unchanged file: nothing new. A new line, with the old ones still there: only the new one.
    expect((await notes.check(p.id)).added).toBe(0);
    writeFileSync(txt, before + 'Anthony says it at the funeral, not the garden.\n');
    utimesSync(txt, new Date(), new Date(Date.now() + 5000));
    expect((await notes.check(p.id)).added).toBe(1);
    expect(readFileSync(txt, 'utf8')).toBe(before + 'Anthony says it at the funeral, not the garden.\n');

    // What came in is remembered with the novel, so another computer will not bring it in again.
    const again = new RoadNotes(env.store, env.brain, () => shared);
    expect((await again.check(p.id)).added).toBe(0);
    expect(statSync(txt).size).toBeGreaterThan(0);
  });

  it('does nothing when sharing is off', async () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const notes = new RoadNotes(env.store, env.brain, () => null);
    expect(await notes.ensure(p.id)).toBeNull();
    expect((await notes.check(p.id)).added).toBe(0);
  });
});
