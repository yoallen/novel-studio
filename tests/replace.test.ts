import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { findInDoc, replaceInDoc } from '../src/core/replace.js';
import { describeChange, undoMeaning } from '../src/core/trailwords.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

function novel() {
  env = freshStore();
  const p = env.brain.createProject('The Keeper of Gull Point');
  const c1 = env.ms.addChapter(p.id, 'Fog Week');
  const c2 = env.ms.addChapter(p.id, 'The Light');
  const a = env.ms.addScene(c1.id, { title: 'The empty boat', text: 'Ana ran to the dock. Ana saw the boat.\n\nMarisol ate a banana.' });
  const b = env.ms.addScene(c1.id, { title: 'Logbook', text: 'Cyrus Hale kept the log.' });
  const c = env.ms.addScene(c2.id, { title: 'Port Ellery', text: 'ANA came home. Ana stayed.' });
  return { pid: p.id as string, a: a.id as string, b: b.id as string, c: c.id as string };
}
const pick = (preview: ReturnType<typeof env.ms.replacePreview>) => preview.scenes.map((s) => ({ sceneId: s.sceneId, version: s.version, matches: s.matches.map((m) => m.n) }));

describe('find and replace in her pages', () => {
  it('finds whole words only when asked, and matches case only when asked', () => {
    const { pid } = novel();
    const loose = env.ms.replacePreview(pid, { find: 'ana', replace: 'Ana Ruiz' });
    expect(loose.total).toBe(5); // Ana, Ana, banana, ANA, Ana
    const whole = env.ms.replacePreview(pid, { find: 'ana', replace: 'Ana Ruiz', wholeWords: true });
    expect(whole.total).toBe(4);
    const cased = env.ms.replacePreview(pid, { find: 'Ana', replace: 'Ana Ruiz', wholeWords: true, matchCase: true });
    expect(cased.total).toBe(3);
    expect(cased.scenes.map((s) => s.sceneTitle)).toEqual(['The empty boat', 'Port Ellery']);
    expect(cased.scenes[0]!.chapterTitle).toBe('Fog Week');
    expect(cased.scenes[1]!.chapterNumber).toBe(2);
    expect(cased.scenes[0]!.matches[0]).toMatchObject({ before: '', found: 'Ana', after: expect.stringContaining(' ran to the dock') });
  });

  it('changes only the ticked matches and the ticked scenes, and keeps an earlier version of each', () => {
    const { pid, a, c } = novel();
    const pre = env.ms.replacePreview(pid, { find: 'Ana', replace: 'Ana Ruiz', wholeWords: true, matchCase: true });
    const before = env.ms.revisions(a).length;
    // Only the second Ana in the first scene; the scene in chapter two is left alone.
    const r = env.ms.replaceInPages(pid, { find: 'Ana', replace: 'Ana Ruiz', wholeWords: true, matchCase: true }, [{ sceneId: a, version: pre.scenes[0]!.version, matches: [1] }]);
    expect(r).toMatchObject({ replaced: 1, scenes: 1 });
    expect(env.ms.scene(a).text).toBe('Ana ran to the dock. Ana Ruiz saw the boat.\n\nMarisol ate a banana.');
    expect(env.ms.scene(a).word_count).toBe(14);
    expect(env.ms.scene(c).text).toBe('ANA came home. Ana stayed.');
    const revs = env.ms.revisions(a);
    expect(revs.length).toBe(before + 1);
    expect(revs.some((x) => String(x.preview).startsWith('Ana ran to the dock. Ana saw'))).toBe(true);
  });

  it('is one step in the Story Trail, and one Undo puts every scene back', () => {
    const { pid, a, c } = novel();
    const o = { find: 'Ana', replace: 'Ana Ruiz', wholeWords: true };
    const textA = env.ms.scene(a).text, textC = env.ms.scene(c).text;
    const wordsBefore = env.ms.totalWords(pid);
    const r = env.ms.replaceInPages(pid, o, pick(env.ms.replacePreview(pid, o)));
    expect(r).toMatchObject({ replaced: 4, scenes: 2 });
    expect(env.ms.totalWords(pid)).toBe(wordsBefore + 4);
    const top = env.store.history(pid)[0]!;
    expect(top.id).toBe(r.batchId);
    expect(top.reason).toBe('Replace "Ana" with "Ana Ruiz" in 4 places in 2 scenes');
    expect(describeChange(top.reason as string, { fieldLabel: () => null })).toBe('Replaced "Ana" with "Ana Ruiz" in 4 places in 2 scenes');
    expect(undoMeaning(top.reason as string)).toMatch(/old words/);
    env.store.revert(r.batchId, 'author');
    expect(env.ms.scene(a).text).toBe(textA);
    expect(env.ms.scene(c).text).toBe(textC);
    expect(env.ms.totalWords(pid)).toBe(wordsBefore);
  });

  it('keeps bold, italics, line breaks and notes for later exactly as they were', () => {
    const doc = { type: 'doc', content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Ana' }] },
      { type: 'paragraph', content: [
        { type: 'text', text: 'Then ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Ana' }, { type: 'text', text: ' said' },
        { type: 'hardBreak' }, { type: 'text', marks: [{ type: 'italic' }], text: 'An' }, { type: 'text', text: 'a laughed. [[check Ana age]] [[Ana]]' },
      ] },
    ] };
    const o = { find: 'Ana', replace: 'Ana Ruiz', wholeWords: true, matchCase: true };
    expect(findInDoc(doc, o).length).toBe(5);
    const r = replaceInDoc(doc, o);
    expect(r.count).toBe(5);
    expect(r.doc).toEqual({ type: 'doc', content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Ana Ruiz' }] },
      { type: 'paragraph', content: [
        { type: 'text', text: 'Then ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'Ana Ruiz' }, { type: 'text', text: ' said' },
        { type: 'hardBreak' }, { type: 'text', marks: [{ type: 'italic' }], text: 'Ana Ruiz' }, { type: 'text', text: ' laughed. [[check Ana Ruiz age]] [[Ana Ruiz]]' },
      ] },
    ] });
    // The original is never touched.
    expect(doc.content[0]!.content![0]!.text).toBe('Ana');
  });

  it('never touches the brackets of a note for later', () => {
    const doc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'She left [[fix this]] and [ a bracket.' }] }] };
    expect(findInDoc(doc, { find: '[', replace: '(' }).length).toBe(1);
    const r = replaceInDoc(doc, { find: '[', replace: '(' });
    expect((r.doc as any).content[0].content[0].text).toBe('She left [[fix this]] and ( a bracket.');
  });

  it('can take a word out, leaving no empty text behind', () => {
    const doc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'very ' }, { type: 'text', marks: [{ type: 'bold' }], text: 'very' }, { type: 'text', text: ' cold' }] }] };
    const r = replaceInDoc(doc, { find: 'very', replace: '', wholeWords: true });
    expect((r.doc as any).content[0].content).toEqual([{ type: 'text', text: ' ' }, { type: 'text', text: ' cold' }]);
    expect(describeChange('Replace "very" with "" in 2 places in 1 scene', { fieldLabel: () => null })).toBe('Took out "very" in 2 places in 1 scene');
  });

  it('refuses when a scene changed after she looked, and changes nothing', () => {
    const { pid, a } = novel();
    const o = { find: 'Ana', replace: 'Ana Ruiz', wholeWords: true };
    const picks = pick(env.ms.replacePreview(pid, o));
    const s = env.ms.scene(a);
    env.ms.saveScene(a, { doc: env.doc('Ana wrote more.'), expectVersion: s.prose_version as number });
    expect(() => env.ms.replaceInPages(pid, o, picks)).toThrow(/changed after you looked/);
    expect(env.ms.scene(a).text).toBe('Ana wrote more.');
    expect(env.store.history(pid)[0]!.reason).not.toMatch(/^Replace/);
  });

  it('leaves out a scene with typing kept after a crash until she decides about it', () => {
    const { pid, a } = novel();
    const s = env.ms.scene(a);
    env.ms.autosave(a, env.doc('Ana typed this before the power went out.'), s.prose_version as number);
    const o = { find: 'Ana', replace: 'Ana Ruiz', wholeWords: true };
    const pre = env.ms.replacePreview(pid, o);
    expect(pre.scenes.find((x) => x.sceneId === a)!.kept).toBe(true);
    expect(() => env.ms.replaceInPages(pid, o, pick(pre))).toThrow(/typing kept/);
    expect(env.ms.recoveryDoc(a)).toBeTruthy();
  });

  it('asks for something to find, and for at least one tick', () => {
    const { pid } = novel();
    expect(env.ms.replacePreview(pid, { find: '', replace: 'x' }).total).toBe(0);
    expect(() => env.ms.replaceInPages(pid, { find: '', replace: 'x' }, [])).toThrow(/Type the words/);
    expect(() => env.ms.replaceInPages(pid, { find: 'Ana', replace: 'x' }, [])).toThrow(/Tick at least one/);
  });
});
