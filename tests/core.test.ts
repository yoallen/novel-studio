import { MIGRATIONS } from '../src/core/schema.js';
import { describe, it, expect, afterEach } from 'vitest';
import { join } from 'node:path';
import { freshStore } from './helpers.js';
import { Store } from '../src/core/store.js';
import { countWords, docToText } from '../src/core/manuscript.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

describe('storage and migrations', () => {
  it('reopens an existing database without re-running migrations', () => {
    env = freshStore();
    const p = env.brain.createProject('I Declare War');
    env.store.close();
    const again = new Store(env.store.path);
    expect(again.schemaVersion()).toBe(MIGRATIONS[MIGRATIONS.length - 1]!.version);
    expect((again.get('projects', p.id as string) as { title: string }).title).toBe('I Declare War');
    again.close();
    env.store = new Store(env.store.path); // let cleanup close a live handle
  });

  it('refuses to open data from a newer app version instead of corrupting it', () => {
    env = freshStore();
    env.store.db.prepare("UPDATE meta SET value='999' WHERE key='schema_version'").run();
    env.store.close();
    expect(() => new Store(env.store.path)).toThrow(/newer version/);
    env.store = new Store(join(env.dir, 'other.sqlite3'));
  });
});

describe('projects (AC01, D6)', () => {
  it('keeps each novel’s own genre and profile', () => {
    env = freshStore();
    const p = env.brain.createProject('Cold Harbor', { genres: [{ name: 'Thriller', role: 'primary' }] });
    expect(p.profile.genres[0].name).toBe('Thriller');
    const updated = env.brain.updateProject(p.id as string, { profile: { genres: [{ name: 'Literary', role: 'primary' }] } });
    expect(updated.profile.genres[0].name).toBe('Literary');
  });
  it('can archive and still restore a novel through undo', () => {
    env = freshStore();
    const p = env.brain.createProject('Temp');
    env.brain.archiveProject(p.id as string);
    expect(env.brain.listProjects()).toHaveLength(0);
    const last = env.store.history(p.id as string)[0]!;
    env.store.revert(last.id as string, 'author');
    expect(env.brain.listProjects()).toHaveLength(1);
  });
});

describe('statements and author sovereignty', () => {
  function kevin() {
    const p = env.brain.createProject('IDW');
    const k = env.brain.createElement(p.id as string, { kind: 'character', title: 'Kevin Wickley' });
    return { p, k };
  }

  it('assistants can only propose or illustrate', () => {
    env = freshStore();
    const { k } = kevin();
    expect(() => env.brain.addStatement({ elementId: k.id, field: 'lie', value: 'X', status: 'established', speaker: { kind: 'assistant', name: 'ChatGPT' } })).toThrow(/You decide/);
    const s = env.brain.addStatement({ elementId: k.id, field: 'lie', value: 'X', status: 'proposed', speaker: { kind: 'assistant', name: 'ChatGPT' } });
    expect(s.status).toBe('proposed');
    expect(env.brain.field(k.id, 'lie').current).toBeNull();
  });

  it('an illustration can never be promoted directly to canon', () => {
    env = freshStore();
    const { k } = kevin();
    const s = env.brain.addStatement({ elementId: k.id, field: 'ghost', value: 'An earlier humiliation', status: 'illustrative', speaker: { kind: 'source', name: 'Story Bible v5' } });
    expect(() => env.brain.setStatementStatus(s.id as string, 'established')).toThrow(/cannot be promoted/);
  });

  it('newest author statement is current, older ones stay as history', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const a = env.brain.createElement(p.id as string, { kind: 'character', title: 'Anthony Vernon' });
    const bible = env.brain.addStatement({ elementId: a.id, field: 'comic_register', value: 'Dry, unbothered, needling', status: 'established', speaker: { kind: 'source', name: 'Story Bible v5' }, madeAt: '2026-10-13T12:00:00Z' });
    const oct15 = env.brain.addStatement({ elementId: a.id, field: 'comic_register', value: 'Not dry: high-energy, physical, code-switching', status: 'developing', speaker: { kind: 'author' }, madeAt: '2026-10-15T18:52:00Z', supersedes: bible.id as string });
    const v = env.brain.field(a.id, 'comic_register');
    expect(v.current).toBeNull(); // the old canon was retired; the new view is still developing
    expect(v.latest?.id).toBe(oct15.id);
    expect(v.history.map((h) => h.id)).toEqual([bible.id]);
    const prov = env.brain.statementProvenance(oct15.id as string);
    expect(prov.replaces[0]!.value).toBe('Dry, unbothered, needling');
  });

  it('competing possibilities coexist until the author chooses one', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const a = env.brain.createElement(p.id as string, { kind: 'character', title: 'Anthony' });
    const opts = ['If people stop listening to me, I stop mattering.', 'If I’m a capable man, I should be able to handle anything myself.']
      .map((v) => env.brain.addStatement({ elementId: a.id, field: 'lie', value: v, status: 'developing', speaker: { kind: 'author' } }));
    expect(env.brain.field(a.id, 'lie').possibilities).toHaveLength(2);
    env.brain.setStatementStatus(opts[0]!.id as string, 'established');
    const v = env.brain.field(a.id, 'lie');
    expect(v.current?.id).toBe(opts[0]!.id);
    expect(v.possibilities.map((x) => x.id)).toEqual([opts[1]!.id]); // the other option is kept, not deleted
  });

  it('rejects empty or malformed content cleanly (D5, D15)', () => {
    env = freshStore();
    const { k } = kevin();
    expect(() => env.brain.addStatement({ elementId: k.id, field: 'lie', value: '  ', status: 'developing', speaker: { kind: 'author' } })).toThrow(/needs content/);
    expect(() => env.brain.addStatement({ elementId: k.id, field: 'Bad Field!', value: 'x', status: 'developing', speaker: { kind: 'author' } })).toThrow(/Field names/);
    expect(() => env.brain.updateElement(k.id, { body: { x: 1 } as never })).toThrow(/text/);
  });

  it('cross-novel links are refused', () => {
    env = freshStore();
    const p1 = env.brain.createProject('A'), p2 = env.brain.createProject('B');
    const a = env.brain.createElement(p1.id as string, { kind: 'note', title: 'a' });
    const b = env.brain.createElement(p2.id as string, { kind: 'note', title: 'b' });
    expect(() => env.brain.link(p1.id as string, { fromId: a.id, toId: b.id, relation: 'relates_to' })).toThrow(/not found/);
  });

  it('deleting an element removes its links and restoring brings both back (D14)', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const ledger = env.brain.createElement(p.id as string, { kind: 'object', title: 'Francine’s ledger' });
    const ail = env.brain.createElement(p.id as string, { kind: 'beat', title: 'All Is Lost' });
    env.brain.link(p.id as string, { fromId: ledger.id, toId: ail.id, relation: 'reveals' });
    env.brain.deleteElement(ledger.id);
    expect(env.brain.links(p.id as string)).toHaveLength(0);
    const del = env.store.history(p.id as string)[0]!;
    env.store.revert(del.id as string, 'author');
    expect(env.brain.links(p.id as string)).toHaveLength(1);
    expect(env.brain.element(ledger.id).title).toBe('Francine’s ledger');
  });
});

describe('history and undo (AC16, D2)', () => {
  it('undoing a title change keeps newer prose', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const ch = env.ms.addChapter(p.id as string);
    const s = env.ms.addScene(ch.id, { title: 'Old title', text: 'first draft' });
    env.ms.updateSceneMeta(s.id as string, { title: 'New title' });
    const titleBatch = env.store.history(p.id as string)[0]!;
    const cur = env.ms.scene(s.id as string);
    env.ms.saveScene(s.id as string, { doc: env.doc('first draft plus 2,000 new words of prose'), expectVersion: cur.prose_version as number });
    env.store.revert(titleBatch.id as string, 'author');
    const after = env.ms.scene(s.id as string);
    expect(after.title).toBe('Old title');
    expect(after.text).toContain('new words');
  });

  it('refuses to undo over a newer change to the same field unless forced', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const e = env.brain.createElement(p.id as string, { kind: 'note', title: 'One' });
    env.brain.updateElement(e.id, { title: 'Two' });
    const first = env.store.history(p.id as string)[0]!;
    env.brain.updateElement(e.id, { title: 'Three' });
    expect(() => env.store.revert(first.id as string, 'author')).toThrow(/Newer changes/);
    env.store.revert(first.id as string, 'author', { force: true });
    expect(env.brain.element(e.id).title).toBe('One');
  });

  it('an undo can itself be undone', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const e = env.brain.createElement(p.id as string, { kind: 'note', title: 'One' });
    env.brain.updateElement(e.id, { title: 'Two' });
    const b = env.store.history(p.id as string)[0]!;
    const { undoBatchId } = env.store.revert(b.id as string, 'author');
    env.store.revert(undoBatchId, 'author');
    expect(env.brain.element(e.id).title).toBe('Two');
  });
});

describe('manuscript (AC12)', () => {
  it('stale second window cannot silently overwrite newer prose (D4)', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const s = env.ms.addScene(env.ms.addChapter(p.id as string).id, { text: 'base' });
    const v = s.prose_version as number;
    env.ms.saveScene(s.id as string, { doc: env.doc('Tab A: 500 words'), expectVersion: v });
    expect(() => env.ms.saveScene(s.id as string, { doc: env.doc('stale tab B'), expectVersion: v })).toThrow(/another window/);
    expect(env.ms.scene(s.id as string).text).toContain('Tab A');
  });

  it('every save is a revision and earlier ones can be restored without losing newer ones', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const s = env.ms.addScene(env.ms.addChapter(p.id as string).id, { text: 'one' });
    let cur = env.ms.saveScene(s.id as string, { doc: env.doc('two'), expectVersion: s.prose_version as number });
    cur = env.ms.saveScene(s.id as string, { doc: env.doc('three'), expectVersion: cur.prose_version as number });
    const revs = env.ms.revisions(s.id as string);
    expect(revs.map((r) => r.preview)).toEqual(['three', 'two', 'one']);
    env.ms.restoreRevision(s.id as string, revs[2]!.id as string);
    expect(env.ms.scene(s.id as string).text).toBe('one');
    expect(env.ms.revisions(s.id as string).map((r) => r.preview)).toEqual(['one', 'three', 'two', 'one']);
  });

  it('typed-but-unsaved prose survives a crash via the autosave journal', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const s = env.ms.addScene(env.ms.addChapter(p.id as string).id, { text: 'saved' });
    env.ms.autosave(s.id as string, env.doc('saved and then 300 more words typed before the power went out'), s.prose_version as number);
    env.store.close();
    env.store = new Store(env.store.path);
    const ms2 = new (env.ms.constructor as any)(env.store);
    const pending = ms2.pendingRecoveries(p.id);
    expect(pending).toHaveLength(1);
    expect(pending[0].text).toContain('power went out');
  });

  it('chapters keep their order and scenes nest inside them; word counts include scenes (D8, D9)', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const c1 = env.ms.addChapter(p.id as string, 'Chapter 1');
    const c2 = env.ms.addChapter(p.id as string, 'Chapter 2');
    const c10 = env.ms.addChapter(p.id as string, 'Chapter 10');
    env.ms.addScene(c1.id, { title: 'A scene inside chapter 1', text: 'one two three four five' });
    const outline = env.ms.outline(p.id as string);
    expect(outline.map((c) => c.title)).toEqual(['Chapter 1', 'Chapter 2', 'Chapter 10']);
    expect(outline[0]!.scenes[0]!.title).toBe('A scene inside chapter 1');
    expect(env.ms.totalWords(p.id as string)).toBe(5);
    env.ms.reorderChapters(p.id as string, [c10.id, c1.id, c2.id]);
    expect(env.ms.outline(p.id as string).map((c) => c.title)).toEqual(['Chapter 10', 'Chapter 1', 'Chapter 2']);
  });

  it('moving a scene never touches its prose', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const c1 = env.ms.addChapter(p.id as string), c2 = env.ms.addChapter(p.id as string);
    const s = env.ms.addScene(c1.id, { text: 'precious prose' });
    env.ms.addScene(c2.id, { text: 'other' });
    env.ms.moveScene(s.id as string, c2.id, 0);
    const o = env.ms.outline(p.id as string);
    expect(o[1]!.scenes.map((x) => x.id)[0]).toBe(s.id);
    expect(env.ms.scene(s.id as string).text).toBe('precious prose');
  });

  it('deleted chapters and scenes can be restored in the app (D14)', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const c = env.ms.addChapter(p.id as string);
    const s = env.ms.addScene(c.id, { text: '3,000 words' });
    env.ms.deleteChapter(c.id);
    expect(env.ms.outline(p.id as string)).toHaveLength(0);
    env.ms.restoreChapter(c.id);
    expect(env.ms.outline(p.id as string)[0]!.scenes[0]!.id).toBe(s.id);
  });

  it('rejects a non-document body instead of storing junk (D5)', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const s = env.ms.addScene(env.ms.addChapter(p.id as string).id);
    expect(() => env.ms.saveScene(s.id as string, { doc: null, expectVersion: s.prose_version as number })).toThrow(/document/);
  });

  it('counts words like a writer and extracts plain text from the editor document', () => {
    expect(countWords('Kevin’s line: “First of all…” — don’t; well-known UN-reasonable')).toBe(8);
    expect(docToText({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A' }] }, { type: 'paragraph', content: [{ type: 'text', text: 'B' }] }] })).toBe('A\n\nB');
  });
});

describe('capture and search (AC03, AC14, D16)', () => {
  it('captures a thought instantly with no category and finds it by exact text later', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    const t = env.brain.capture(p.id as string, 'Giving honor to God, and Miss Francine…');
    expect(t.kind).toBe('thought');
    expect(env.brain.search(p.id as string, 'Giving honor to God').some((h) => h.id === t.id)).toBe(true);
    env.brain.refile(t.id, 'idea');
    expect(env.brain.element(t.id).state).toBe('considering');
  });

  it('treats search wildcards literally', () => {
    env = freshStore();
    const p = env.brain.createProject('IDW');
    env.brain.capture(p.id as string, 'no underscore here');
    env.brain.capture(p.id as string, 'snake_case');
    expect(env.brain.search(p.id as string, '_').length).toBe(1);
  });
});
