import { describe, it, expect, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { freshStore } from './helpers.js';
import { Store } from '../src/core/store.js';
import { Brain } from '../src/core/brain.js';
import { Manuscript } from '../src/core/manuscript.js';
import { MIGRATIONS } from '../src/core/schema.js';
import { statusLabel, ownedLabel } from '../src/core/labels.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

describe('upgrading existing data', () => {
  it('upgrades a version 1 library to the current schema with every scene, revision and link intact', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ns-up-'));
    const file = join(dir, 'old.sqlite3');
    try {
      // Build a genuine version 1 database by hand.
      const db = new Database(file);
      db.pragma('foreign_keys = ON');
      db.exec('CREATE TABLE meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
      db.exec(MIGRATIONS[0]!.sql);
      db.prepare("INSERT INTO meta VALUES('schema_version','1')").run();
      const t = '2026-10-14T13:34:00.000Z';
      db.prepare("INSERT INTO projects(id,title,created_at,updated_at) VALUES('p1','Old Novel',?,?)").run(t, t);
      db.prepare("INSERT INTO chapters(id,project_id,title,position,created_at,updated_at) VALUES('c1','p1','One',1,?,?)").run(t, t);
      db.prepare("INSERT INTO elements(id,project_id,kind,title,created_at,updated_at) VALUES('e1','p1','character','Kevin',?,?)").run(t, t);
      db.prepare("INSERT INTO scenes(id,project_id,chapter_id,title,position,text,word_count,status,pov_element_id,created_at,updated_at) VALUES('s1','p1','c1','Driveway',1,'hello there',2,'drafting','e1',?,?)").run(t, t);
      db.prepare("INSERT INTO scene_revisions(id,scene_id,version,doc_json,text,word_count,reason,created_at) VALUES('r1','s1',1,'{}','hello there',2,'save',?)").run(t);
      db.close();

      const store = new Store(file);
      expect(store.schemaVersion()).toBe(MIGRATIONS[MIGRATIONS.length - 1]!.version);
      const ms = new Manuscript(store);
      const s = ms.scene('s1');
      expect(s.text).toBe('hello there');
      expect(s.pov_element_id).toBe('e1');
      expect(s.confirmed).toBe(0);
      expect(ms.revisions('s1')).toHaveLength(1);
      expect((store.db.pragma('foreign_key_check') as unknown[]).length).toBe(0);
      expect(store.db.pragma('foreign_keys', { simple: true })).toBe(1);
      store.close();
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
});

describe('scene status ladder is the author\'s (R-B-026)', () => {
  it('uses the default ladder, accepts renamed and added steps, and refuses removing a step in use', () => {
    env = freshStore();
    const p = env.brain.createProject('Any Novel');
    const pid = p.id as string;
    const ch = env.ms.addChapter(pid);
    const s = env.ms.addScene(ch.id, { title: 'Opening' });
    expect(s.status).toBe('idea');
    expect(env.brain.settings(pid).sceneLadder.map((x) => x.label)).toContain('First draft complete');

    const ladder = env.brain.settings(pid).sceneLadder.map((x) => (x.key === 'revised' ? { ...x, label: 'Polished' } : x));
    ladder.splice(ladder.length - 1, 0, { key: 'beta_read', label: 'Beta-read', drafted: true });
    env.brain.updateSettings(pid, { sceneLadder: ladder });
    env.ms.updateSceneMeta(s.id as string, { status: 'beta_read' });
    expect(env.ms.scene(s.id as string).status).toBe('beta_read');
    expect(() => env.ms.updateSceneMeta(s.id as string, { status: 'nonsense' })).toThrow(/not on this novel/);

    expect(() => env.brain.updateSettings(pid, { sceneLadder: ladder.filter((x) => x.key !== 'beta_read') })).toThrow(/1 scene marked "Beta-read"/);
    // Settings survive reopening the library.
    env.store.close();
    env.store = new Store(env.store.path);
    expect(new Brain(env.store).settings(pid).sceneLadder.find((x) => x.key === 'revised')!.label).toBe('Polished');
  });

  it('first words move a not-started scene to the first drafting step of that novel\'s ladder', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    env.brain.updateSettings(pid, { sceneLadder: [{ key: 'seed', label: 'Seed' }, { key: 'growing', label: 'Growing', drafted: true }, { key: 'done', label: 'Done', drafted: true }] });
    const ch = env.ms.addChapter(pid);
    const s = env.ms.addScene(ch.id);
    expect(s.status).toBe('seed');
    const saved = env.ms.saveScene(s.id as string, { doc: env.doc('First line.'), expectVersion: s.prose_version as number });
    expect(saved.status).toBe('growing');
  });
});

describe('author-reserved work and confirmed drafts (R-B-012, R-B-037)', () => {
  it('marks a scene as hers and as drafted-and-confirmed, journaled and undoable', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    const ch = env.ms.addChapter(pid);
    const s = env.ms.addScene(ch.id, { text: 'The Confession.' });
    env.ms.updateSceneMeta(s.id as string, { reserved: 'Mine to write', confirmed: true });
    const after = env.ms.scene(s.id as string);
    expect(after.reserved).toBe('Mine to write');
    expect(after.confirmed).toBe(1);
    const last = env.store.history(pid)[0]!;
    env.store.revert(last.id as string, 'author');
    expect(env.ms.scene(s.id as string).reserved).toBeNull();
  });
});

describe('labels', () => {
  it('shows the author\'s chosen words and personalizes the owned marker for any author', () => {
    expect(statusLabel('established')).toBe('Decided');
    expect(statusLabel('unanswered')).toBe('Still open');
    expect(statusLabel('illustrative')).toBe('Example');
    expect(statusLabel('proposed')).toBe('Suggestion');
    expect(ownedLabel(undefined, 'Yolanda')).toBe("Yolanda, it's on you now");
    expect(ownedLabel(undefined, 'Sam')).toBe("Sam, it's on you now");
    expect(ownedLabel(undefined, '')).toBe("It's on you now");
  });
});

import { WritingDesk } from '../src/core/writing.js';

describe('writing desk (R-B-013 to R-B-019, R-B-030)', () => {
  function desk() { return new WritingDesk(env.store, env.brain, env.ms); }

  it('readiness is information only and lists exactly what is open', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    const ch = env.ms.addChapter(pid);
    const s = env.ms.addScene(ch.id, { title: 'Driveway' });
    const d = desk();
    const ctx = d.sceneContext(s.id as string);
    expect(ctx.readiness.ready).toBe(false);
    expect(ctx.readiness.open).toEqual(['Viewpoint character', 'What this scene must do', "The viewpoint character's objective", 'Central conflict', 'Intended outcome or change', 'How we got here or what must follow']);
    // Reading context never creates records.
    expect(env.brain.elements(pid)).toHaveLength(0);
    // Writing works anyway, with every field empty (Scenario H).
    const saved = env.ms.saveScene(s.id as string, { doc: env.doc('She wrote anyway.'), expectVersion: s.prose_version as number });
    expect(saved.word_count).toBe(3);
  });

  it('plan fields keep history: the newest author statement is current, the earlier one remains', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    const s = env.ms.addScene(env.ms.addChapter(pid).id, { title: 'Fish guts' });
    const d = desk();
    d.setPlanField(s.id as string, 'purpose', 'Start the war');
    d.setPlanField(s.id as string, 'purpose', 'Start the war and hide who did it', 'established');
    const f = d.sceneContext(s.id as string).fields.find((x) => x.field === 'purpose')!;
    expect(f.current!.value).toBe('Start the war and hide who did it');
    const view = env.brain.field(f.current!.element_id as string, 'purpose');
    expect(view.history.map((h) => h.value)).toEqual(['Start the war']);
  });

  it('captures while writing keep exact dictated text, attach to the scene, and resurface only there', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    const ch = env.ms.addChapter(pid);
    const a = env.ms.addScene(ch.id, { title: 'A' });
    const b = env.ms.addScene(ch.id, { title: 'B' });
    const d = desk();
    const raw = 'what if he finds his mama grave  first and then the nieces call';
    const q = d.captureForScene(a.id as string, raw, { kind: 'question', urgency: 'later' });
    expect(env.brain.element(q.id).body).toBe(raw);
    expect(JSON.parse(env.brain.element(q.id).attrs_json as string).urgency).toBe('later');
    expect(d.sceneContext(a.id as string).openNotes.map((n) => n.id)).toEqual([q.id]);
    expect(d.sceneContext(b.id as string).openNotes).toHaveLength(0);
    env.brain.updateElement(q.id, { state: 'answered' });
    expect(d.sceneContext(a.id as string).openNotes).toHaveLength(0);
  });

  it('next writing action is concrete: her own words first, then where she was, then the first unstarted scene', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    const d = desk();
    expect(d.nextWritingAction(pid).text).toBe('Write the first line of your first scene');
    const ch = env.ms.addChapter(pid, 'Chapter 1');
    const s1 = env.ms.addScene(ch.id, { title: 'Opening', text: 'Done.' });
    const s2 = env.ms.addScene(ch.id, { title: 'Driveway' });
    expect(d.nextWritingAction(pid)).toMatchObject({ text: 'Draft "Driveway" in Chapter 1', sceneId: s2.id });
    env.ms.setWritingState(pid, { sceneId: s1.id as string, cursor: { from: 3, to: 3 } });
    expect(d.nextWritingAction(pid).text).toBe('Keep writing "Opening"');
    env.brain.updateSettings(pid, { nextWritingAction: "Draft Kevin's opening scene in the driveway" });
    expect(d.nextWritingAction(pid)).toMatchObject({ text: "Draft Kevin's opening scene in the driveway", source: 'author' });
  });

  it('where-was-I shows last place, decisions and open questions, and never counts days away', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    const s = env.ms.addScene(env.ms.addChapter(pid).id, { title: 'Opening', text: 'The smell hit Anthony before the sun did.' });
    env.ms.setWritingState(pid, { sceneId: s.id as string });
    const k = env.brain.createElement(pid, { kind: 'character', title: 'Kevin' });
    env.brain.addStatement({ elementId: k.id, field: 'lie', value: 'If I let my guard down, I could lose everything again.', status: 'established', speaker: { kind: 'author' } });
    env.brain.capture(pid, 'Whose notebook is it?', { kind: 'question' });
    const w = desk().whereWasI(pid);
    expect(w.lastScene!.tail).toContain('before the sun did');
    expect(w.decisions[0]!.value).toContain('guard down');
    expect(w.openQuestions[0]!.title).toBe('Whose notebook is it?');
    expect(JSON.stringify(w)).not.toMatch(/days? (away|ago)/i);
  });

  it('the Writing Trail remembers why she left and whether it was resolved', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    const t = env.ms.leave(pid, { sceneId: 's12' }, { sceneId: 's7' }, 'Fix the causal gap in Scene 7');
    env.ms.resolveTrail(t.id, false, 'Still unconvincing; come back after drafting');
    env.ms.returnFromTrail(pid);
    const entry = env.ms.trail(pid)[0]!;
    expect(entry.reason).toBe('Fix the causal gap in Scene 7');
    expect(entry.resolved).toBe(0);
    expect(entry.returned_at).toBeTruthy();
  });

  it('this week counts thinking work and words in neutral terms', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    env.brain.capture(pid, 'an idea', { kind: 'idea' });
    const w = desk().thisWeek(pid);
    expect(w.ideasCaptured).toBe(1);
    expect(w.netWords).toBe(0);
  });
});

describe('changing a scene\'s details never collides with typing (regression found in the browser walkthrough)', () => {
  it('a title, status, marker or capture change leaves the open page able to save', () => {
    env = freshStore();
    const pid = env.brain.createProject('Any Novel').id as string;
    const s = env.ms.addScene(env.ms.addChapter(pid).id, { title: 'Opening' });
    const opened = s.prose_version as number;
    const d = new WritingDesk(env.store, env.brain, env.ms);
    env.ms.updateSceneMeta(s.id as string, { title: 'The Opening', status: 'planned', reserved: 'Mine to write' });
    d.captureForScene(s.id as string, 'what does the key open', { kind: 'question' });
    d.setPlanField(s.id as string, 'purpose', 'Plant the key');
    const saved = env.ms.saveScene(s.id as string, { doc: env.doc('The house was quiet.'), expectVersion: opened });
    expect(saved.text).toBe('The house was quiet.');
    expect(saved.title).toBe('The Opening');
  });
});

describe('undo after delete and restore', () => {
  it('a later delete-then-restore does not block undoing an earlier edit; a currently deleted record does', () => {
    env = freshStore();
    const pid = env.brain.createProject('U').id as string;
    const s = env.ms.addScene(env.ms.addChapter(pid).id);
    env.ms.updateSceneMeta(s.id as string, { title: 'Renamed scene' });
    const rename = env.store.history(pid)[0]!;
    env.ms.saveScene(s.id as string, { doc: env.doc('Keep these words.'), expectVersion: 1 });
    env.ms.deleteScene(s.id as string);
    expect(() => env.store.revert(rename.id as string, 'author')).toThrow(/Newer changes/);
    env.ms.restoreScene(s.id as string);
    env.store.revert(rename.id as string, 'author');
    const after = env.ms.scene(s.id as string);
    expect(after.title).toBe('Scene 1');
    expect(after.text).toBe('Keep these words.');
  });
});

describe('the Writing Room explains itself (usability findings)', () => {
  it('readiness names the very blanks it points to', () => {
    env = freshStore();
    const pid = env.brain.createProject('Names').id as string;
    const s = env.ms.addScene(env.ms.addChapter(pid).id, { title: 'One' });
    const ctx = new WritingDesk(env.store, env.brain, env.ms).sceneContext(s.id as string);
    const labels = new Set(ctx.fields.map((f) => f.label as string));
    for (const item of ctx.readiness.open.slice(1, 5)) expect(labels.has(item)).toBe(true);
    expect(ctx.readiness.open).toContain('How we got here or what must follow');
    // Every blank carries its one-line hint, and "What you want the reader to feel" is part of the plan.
    expect(ctx.fields.every((f) => typeof f.hint === 'string' && f.hint.length > 0)).toBe(true);
    expect(ctx.fields.map((f) => f.label)).toContain('What you want the reader to feel');
  });

  it("a scene made from a card shows the card's beat and its own planning", () => {
    env = freshStore();
    const pid = env.brain.createProject('Cards').id as string;
    const beat = env.brain.createElement(pid, { kind: 'beat', title: 'Opening Image' });
    const card = env.brain.createElement(pid, { kind: 'scene_plan', title: 'Opening image scene' });
    env.brain.addStatement({ elementId: card.id as string, field: 'beat', value: beat.id, status: 'established', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: card.id as string, field: 'x_what_happens', value: 'Kevin wakes to the ledger on his porch.', status: 'developing', speaker: { kind: 'author' } });
    const s = env.ms.addScene(env.ms.addChapter(pid).id, { title: 'Opening image scene' });
    env.ms.updateSceneMeta(s.id as string, { planElementId: card.id as string });
    const ctx = new WritingDesk(env.store, env.brain, env.ms).sceneContext(s.id as string);
    expect(ctx.card?.beat).toEqual({ id: beat.id, name: 'Opening Image' });
    expect(ctx.card?.fields).toEqual([{ field: 'x_what_happens', label: 'what happens', value: 'Kevin wakes to the ledger on his porch.' }]);
  });

  it('a scene with no card says so: no card, nothing made by reading', () => {
    env = freshStore();
    const pid = env.brain.createProject('Plain').id as string;
    const s = env.ms.addScene(env.ms.addChapter(pid).id, { title: 'Loose' });
    expect(new WritingDesk(env.store, env.brain, env.ms).sceneContext(s.id as string).card).toBeNull();
    expect(env.brain.elements(pid)).toHaveLength(0);
  });

  it('the binder circle follows the status: empty, then half while drafting, then full', async () => {
    const { sceneCircle } = await import('../src/core/labels.js');
    const { DEFAULT_SCENE_LADDER } = await import('../src/core/settings.js');
    expect(['idea', 'planned', 'ready'].map((k) => sceneCircle(DEFAULT_SCENE_LADDER, k))).toEqual(['empty', 'empty', 'empty']);
    expect(sceneCircle(DEFAULT_SCENE_LADDER, 'drafting')).toBe('half');
    expect(['first_draft', 'revising', 'revised', 'final'].map((k) => sceneCircle(DEFAULT_SCENE_LADDER, k))).toEqual(['full', 'full', 'full', 'full']);
    // Her own ladder, her own steps.
    expect(sceneCircle([{ key: 'thinking' }, { key: 'writing', drafted: true }, { key: 'done', drafted: true }], 'thinking')).toBe('empty');
    expect(sceneCircle([{ key: 'thinking' }, { key: 'writing', drafted: true }, { key: 'done', drafted: true }], 'done')).toBe('full');
  });
});
