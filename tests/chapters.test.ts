import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Progress } from '../src/core/progress.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

const titles = (pid: string) => env.ms.outline(pid).map((c) => c.title as string);
const sceneTitles = (pid: string) => env.ms.outline(pid).map((c) => c.scenes.map((s) => `${s.title as string}:${s.word_count}`));

describe('New chapter', () => {
  it('opens right after the chapter you are in, and the plain-numbered chapters after it move up by one', () => {
    env = freshStore();
    const p = env.brain.createProject('Gull Point');
    const c1 = env.ms.addChapter(p.id); env.ms.addChapter(p.id); env.ms.addChapter(p.id);
    const fresh = env.ms.addChapter(p.id, undefined, c1.id);
    expect(fresh.title).toBe('Chapter 2');
    expect(titles(p.id)).toEqual(['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4']);
    expect(env.ms.outline(p.id)[1]!.id).toBe(fresh.id);
  });

  it('never renames a chapter she named, and leaves her own numbering alone when it does not run in order', () => {
    env = freshStore();
    const p = env.brain.createProject('Named');
    const pro = env.ms.addChapter(p.id, 'Prologue');
    const a = env.ms.addChapter(p.id, 'Chapter 1'); env.ms.addChapter(p.id, 'Chapter 2');
    env.ms.addChapter(p.id, undefined, a.id);
    expect(titles(p.id)).toEqual(['Prologue', 'Chapter 1', 'Chapter 2', 'Chapter 3']);
    env.ms.addChapter(p.id, undefined, pro.id);
    expect(titles(p.id)).toEqual(['Prologue', 'Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4']);

    const q = env.brain.createProject('Jumps');
    const j = env.ms.addChapter(q.id, 'Chapter 1'); env.ms.addChapter(q.id, 'Chapter 7');
    env.ms.addChapter(q.id, undefined, j.id);
    expect(titles(q.id)).toEqual(['Chapter 1', 'Chapter 3', 'Chapter 7']);
  });
});

describe('Split the chapter here', () => {
  function book() {
    env = freshStore();
    const p = env.brain.createProject('Split Book');
    const c1 = env.ms.addChapter(p.id);
    const a = env.ms.addScene(c1.id, { title: 'Storm' });
    const v = env.ms.saveScene(a.id, { doc: env.doc('One two three.\n\nFour five six.'), expectVersion: a.prose_version as number });
    env.ms.addScene(c1.id, { title: 'After', text: 'Seven eight.' });
    const c2 = env.ms.addChapter(p.id);
    return { p, c1, c2, a: v };
  }

  it('cuts the scene at the cursor, moves the rest of the chapter, and numbers the chapters after it', () => {
    const { p, a } = book();
    const r = env.ms.splitChapter(a.id, { before: env.doc('One two three.'), after: env.doc('Four five six.'), expectVersion: a.prose_version as number });
    expect(titles(p.id)).toEqual(['Chapter 1', 'Chapter 2', 'Chapter 3']);
    expect(sceneTitles(p.id)).toEqual([['Storm:3'], ['Scene 1:3', 'After:2'], []]);
    expect(env.ms.scene(r.sceneId).text).toBe('Four five six.');
  });

  it('counts none of the divided words as written, and undoes as one step', () => {
    const { p, a } = book();
    const progress = new Progress(env.store, env.ms);
    const before = [...progress.dailyWords(p.id, 'UTC').values()].reduce((x, y) => x + y, 0);
    env.ms.splitChapter(a.id, { before: env.doc('One two three.'), after: env.doc('Four five six.'), expectVersion: a.prose_version as number });
    expect([...progress.dailyWords(p.id, 'UTC').values()].reduce((x, y) => x + y, 0)).toBe(before);
    const step = env.store.history(p.id)[0]!;
    expect(step.reason).toMatch(/^Split Chapter 1/);
    env.store.revert(step.id as string, 'author');
    expect(titles(p.id)).toEqual(['Chapter 1', 'Chapter 2']);
    expect(sceneTitles(p.id)).toEqual([['Storm:6', 'After:2'], []]);
    expect([...progress.dailyWords(p.id, 'UTC').values()].reduce((x, y) => x + y, 0)).toBe(before);
  });

  it('splits between scenes when the cursor is at the end or the start of a scene', () => {
    const { p, a } = book();
    env.ms.splitChapter(a.id, { before: env.ms.scene(a.id).doc, after: env.doc(''), expectVersion: a.prose_version as number });
    expect(sceneTitles(p.id)).toEqual([['Storm:6'], ['After:2'], []]);

    const b = book();
    env.ms.splitChapter(b.a.id, { before: env.doc(''), after: env.ms.scene(b.a.id).doc, expectVersion: b.a.prose_version as number });
    expect(sceneTitles(b.p.id)).toEqual([[], ['Storm:6', 'After:2'], []]);
  });

  it('refuses a cut that would lose or change a word, and changes nothing', () => {
    const { p, a } = book();
    expect(() => env.ms.splitChapter(a.id, { before: env.doc('One two three.'), after: env.doc('Four five.'), expectVersion: a.prose_version as number })).toThrow(/did not match/);
    expect(titles(p.id)).toEqual(['Chapter 1', 'Chapter 2']);
  });
});
