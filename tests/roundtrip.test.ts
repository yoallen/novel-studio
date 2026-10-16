import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { WritingDesk } from '../src/core/writing.js';
import { Importer, RoundtripPlan } from '../src/core/io/importer.js';
import { Exporter } from '../src/core/io/exporter.js';
import { docToBlocks } from '../src/core/io/blocks.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

async function editInWord(docx: Buffer, edit: (xml: string) => string, comments?: string) {
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(docx);
  zip.file('word/document.xml', edit(await zip.file('word/document.xml')!.async('string')));
  if (comments) zip.file('word/comments.xml', comments);
  return zip.generateAsync({ type: 'nodebuffer' });
}

function setup() {
  env = freshStore();
  const pid = env.brain.createProject('Round Trip', { settings: { authorName: 'Yolanda Allen' } }).id as string;
  const st = new Structure(env.store, env.brain, env.ms); const rp = new Ripple(env.store, env.brain, env.ms, st); const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  const desk = new WritingDesk(env.store, env.brain, env.ms);
  const doc = (n: number) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Kevin said it was ' }, { type: 'text', text: 'not', marks: [{ type: 'italic' }] }, { type: 'text', text: ` his fault, in chapter ${n}.` }] }, { type: 'paragraph', content: [{ type: 'text', text: `Anthony laughed in chapter ${n}.` }] }] });
  const scenes = [1, 2].map((n) => { const c = env.ms.addChapter(pid); return env.ms.addScene(c.id as string, { title: `Scene ${n}`, doc: doc(n) }).id as string; });
  return { pid, scenes, im: new Importer(env.store, env.brain, env.ms, st, desk), ex: new Exporter(env.store, env.brain, env.ms, st, ct), desk };
}

const tracked = (xml: string) => xml
  .replace(/<w:r>(?:(?!<\/w:r>)[\s\S])*? his fault, in chapter 1\.<\/w:t><\/w:r>/, '<w:r><w:t xml:space="preserve"> his </w:t></w:r><w:del w:id="91" w:author="Ed" w:date="2026-10-20T10:00:00Z"><w:r><w:delText>fault</w:delText></w:r></w:del><w:ins w:id="92" w:author="Ed" w:date="2026-10-20T10:00:00Z"><w:r><w:t>doing</w:t></w:r></w:ins><w:r><w:commentReference w:id="5"/><w:t xml:space="preserve">, in chapter 1.</w:t></w:r>')
  .replace(/<w:r>(?:(?!<\/w:r>)[\s\S])*?Anthony laughed in chapter 2\.<\/w:t><\/w:r>/, '<w:r><w:t xml:space="preserve">Anthony laughed in chapter 2.</w:t></w:r><w:ins w:id="93" w:author="Ed"><w:r><w:t xml:space="preserve"> Loudly.</w:t></w:r></w:ins>');
const COMMENTS = '<?xml version="1.0"?><w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:comment w:id="5" w:author="Ed"><w:p><w:r><w:t>Is "doing" too soft?</w:t></w:r></w:p></w:comment></w:comments>';

describe("an editor's tracked changes come back for her decision (R-B-083)", () => {
  it('each change is shown with its author and context; accepted ones go in, rejected and undecided ones do not; formatting survives', async () => {
    const { pid, scenes, im, ex } = setup();
    const out = await ex.export(pid, { format: 'docx', manuscript: true, sections: [], includePrivate: false, includeExamples: true, chapterHeading: 'number_title', options: {} });
    const back = await editInWord(out.data, tracked, COMMENTS);
    const r = await im.startRoundtrip(pid, { name: 'Round Trip edited.docx', data: back });
    const plan = r.plan as RoundtripPlan;
    expect(plan.scenes.map((s) => s.status)).toEqual(['tracked', 'tracked']);
    const g1 = plan.scenes[0]!.groups;
    expect(g1).toHaveLength(1);
    expect(g1[0]).toMatchObject({ kind: 'replace', author: 'Ed', removed: 'fault', added: 'doing' });
    expect(g1[0]!.before).toContain('his ');
    expect(plan.scenes[0]!.comments[0]).toMatchObject({ author: 'Ed', text: 'Is "doing" too soft?' });
    expect(env.ms.scene(scenes[0]!).text).toContain('his fault');   // nothing changes before she decides

    im.edit(r.id, { roundtrip: { [scenes[0]!]: { decisions: { [g1[0]!.id]: 'accept' } }, [scenes[1]!]: { all: 'reject' } } });
    const res = im.applyRoundtrip(r.id);
    expect((res.import.report.applied as unknown[]).length).toBe(1);
    const s1 = env.ms.scene(scenes[0]!);
    expect(s1.text).toContain('Kevin said it was not his doing, in chapter 1.');
    expect(docToBlocks(JSON.parse(s1.doc_json as string))[0]).toMatchObject({ runs: [{ text: 'Kevin said it was ' }, { text: 'not', i: true }, { text: ' his doing, in chapter 1.' }] });
    expect(env.ms.scene(scenes[1]!).text).not.toContain('Loudly');
    expect(env.ms.revisions(scenes[0]!).length).toBeGreaterThanOrEqual(2);
    const notes = env.brain.elements(pid, { kind: 'thought' });
    expect(notes.some((n) => String(n.body).includes('Is "doing" too soft?'))).toBe(true);
  });

  it('a scene she changed after exporting is not overwritten without her choice; untracked edits are shown, not applied', async () => {
    const { pid, scenes, im, ex } = setup();
    const out = await ex.export(pid, { format: 'docx', manuscript: true, sections: [], includePrivate: false, includeExamples: true, chapterHeading: 'number_title', options: {} });
    const s2 = env.ms.scene(scenes[1]!);
    env.ms.saveScene(scenes[1]!, { doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'She rewrote this.' }] }] }, expectVersion: s2.prose_version as number });
    const back = await editInWord(out.data, (x) => tracked(x).replace(/Kevin said it was /, 'Kevin swore it was '));
    const r = await im.startRoundtrip(pid, { name: 'x.docx', data: back });
    const plan = r.plan as RoundtripPlan;
    expect(plan.scenes.map((s) => s.status)).toEqual(['diverged', 'diverged']);
    expect(plan.scenes[0]!.editorText).toContain('Kevin swore it was not his doing');
    im.edit(r.id, { roundtrip: { [scenes[1]!]: { all: 'accept' } } });
    const res = im.applyRoundtrip(r.id);
    expect((res.import.report.skipped as { title: string }[]).map((x) => x.title)).toEqual(['Scene 2']);
    expect(env.ms.scene(scenes[1]!).text).toBe('She rewrote this.');
  });

  it('a Word file that never came from the program is turned away kindly', async () => {
    const { pid, im } = setup();
    const { toDocx } = await import('../src/core/io/writers.js');
    const plain = await toDocx({ title: 'x', author: '', extras: [], chapters: [{ number: 1, title: '', heading: 'Chapter 1', scenes: [{ title: '', blocks: [{ type: 'p', runs: [{ text: 'Hi' }] }] }] }] }, { sceneBreak: '* * *', sceneTitles: false, titlePage: false, manuscriptFormat: false, chapterOnNewPage: true });
    await expect(im.startRoundtrip(pid, { name: 'other.docx', data: plain })).rejects.toThrow(/no scene markers/);
  });
});
