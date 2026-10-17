import { describe, it, expect, afterEach } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { Importer, DocumentPlan } from '../src/core/io/importer.js';
import { Exporter } from '../src/core/io/exporter.js';
import { ManuscriptPlan } from '../src/core/io/manuscript-import.js';
import { toDocx, toRtf, toMarkdown, Book } from '../src/core/io/writers.js';
import { docToBlocks, rtfToBlocks, markdownToBlocks, Block } from '../src/core/io/blocks.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
function setup(title = 'Any Story') {
  env = freshStore();
  const pid = env.brain.createProject(title, { settings: { authorName: 'Yolanda Allen' } }).id as string;
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  return { pid, st, im: new Importer(env.store, env.brain, env.ms, st), ex: new Exporter(env.store, env.brain, env.ms, st, ct) };
}
const P = (text: string, extra: Partial<{ i: boolean; b: boolean }> = {}): Block => ({ type: 'p', runs: [{ text, ...extra }] });
const OPTS = { sceneBreak: '* * *', sceneTitles: false, titlePage: false, manuscriptFormat: false, chapterOnNewPage: true };
function sampleBook(): Book {
  return {
    title: 'Sample', author: 'Yolanda Allen', extras: [],
    chapters: [1, 2, 3].map((n) => ({
      number: n, title: n === 2 ? 'In Which the Dogs Escape' : '', heading: n === 2 ? `Chapter ${n}: In Which the Dogs Escape` : `Chapter ${n}`,
      scenes: [
        { title: 'One', blocks: [{ type: 'p', runs: [{ text: 'Kevin said it was ' }, { text: 'not', i: true }, { text: ` his fault. Chapter ${n}. “Curly” quotes, café.` }] }, P('Anthony did not answer.')] },
        { title: 'Two', blocks: [P(`The second scene of chapter ${n}.`), P('He was bold.', { b: true })] },
      ],
    })),
  };
}

describe('manuscript import (R-B-071, R-B-072)', () => {
  it('a Word file comes in as a proposed plan; nothing reaches the outline until she accepts; then every word and every italic is there', async () => {
    const { pid, im } = setup();
    const data = await toDocx(sampleBook(), OPTS);
    const r = await im.startManuscript(pid, { name: 'draft.docx', data });
    const plan = r.plan as ManuscriptPlan;
    expect(plan.chapters.map((c) => c.title)).toEqual(['Chapter 1', 'Chapter 2: In Which the Dogs Escape', 'Chapter 3']);
    expect(plan.chapters.every((c) => c.scenes.length === 2)).toBe(true);
    expect(env.ms.outline(pid)).toHaveLength(0);

    im.edit(r.id, { scenes: { [plan.chapters[2]!.scenes[1]!.key]: { joinPrevious: true } }, chapters: { [plan.chapters[0]!.key]: { title: 'The Driveway' } } });
    const out = im.applyManuscript(r.id);
    expect(out.verified).toBe(true);
    const o = env.ms.outline(pid);
    expect(o.map((c) => c.title)).toEqual(['The Driveway', 'Chapter 2: In Which the Dogs Escape', 'Chapter 3']);
    expect(o[2]!.scenes).toHaveLength(1);
    const first = env.ms.scene(o[0]!.scenes[0]!.id as string);
    expect(first.text).toContain('Kevin said it was not his fault. Chapter 1. “Curly” quotes, café.');
    const blocks = docToBlocks(JSON.parse(first.doc_json as string));
    expect(blocks[0]).toMatchObject({ type: 'p', runs: [{ text: 'Kevin said it was ' }, { text: 'not', i: true }, { text: expect.stringContaining('his fault') }] });
    const joined = env.ms.scene(o[2]!.scenes[0]!.id as string);
    expect(joined.text).toContain('The second scene of chapter 3.');
    expect(() => im.apply(r.id)).toThrow(/already finished/);
  });

  it('plain text with "Chapter One" lines and # breaks, RTF and Markdown all keep their words', async () => {
    const { pid, im } = setup();
    const txt = 'My Novel\n\nby Me\n\nChapter One\n\nIt began.\n\nIt went on.\n\n#\n\nLater.\n\nChapter Two\n\nThe end.';
    const t = await im.startManuscript(pid, { name: 'novel.txt', data: Buffer.from(txt) });
    const tp = t.plan as ManuscriptPlan;
    expect(tp.chapters.map((c) => [c.title, c.scenes.length])).toEqual([['Before the first chapter', 1], ['Chapter One', 2], ['Chapter Two', 1]]);
    expect(tp.findings.join(' ')).toMatch(/title page/);

    const rtf = toRtf(sampleBook(), OPTS);
    const back = rtfToBlocks(rtf);
    expect(back.some((b) => b.type === 'p' && b.runs.some((r) => r.i && r.text === 'not'))).toBe(true);
    expect(back.filter((b) => b.type === 'break')).toHaveLength(3);
    const md = toMarkdown(sampleBook(), OPTS);
    const mb = markdownToBlocks(md);
    expect(mb.some((b) => b.type === 'p' && b.runs.some((r) => r.i && r.text === 'not'))).toBe(true);
    expect(mb.some((b) => b.type === 'p' && b.runs.some((r) => r.b && r.text === 'He was bold.'))).toBe(true);
    const m = await im.startManuscript(pid, { name: 'n.md', data: Buffer.from(md) });
    expect((m.plan as ManuscriptPlan).chapters).toHaveLength(3);
    await expect(im.startManuscript(pid, { name: 'old.doc', data: Buffer.from('x') })).rejects.toThrow(/\.docx/);
  });
});

async function bibleDocx() {
  const d = await import('docx');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = d;
  const lab = (label: string, text: string, italic = false) => new Paragraph({ children: [new TextRun({ text: label, bold: true, italics: italic }), new TextRun({ text, italics: !italic && label.startsWith('Over') })] });
  const doc = new Document({ sections: [{ children: [
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('How to Use This Bible')] }),
    new Paragraph('Read this once to put the whole story in one place.'),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Part Two: The Characters')] }),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Marla Quinn')] }),
    lab('Decided. ', 'A retired lighthouse keeper who talks to the fog.'),
    new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('Weiland Arc: Lie, Ghost, Want, Need')] }),
    lab('What it is. ', 'The Lie is the false belief a character holds.'),
    lab('One way I could play it, not a decision yet: ', 'The Lie: “If I leave the light, ships will sink.” The Ghost: the night the lamp failed. The Want: to keep watch forever. The Need: to let others carry the light.', true),
    lab('Over to me. ', "Name Marla's Lie, Ghost, Want and Need."),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Part Three: The Structure')] }),
    new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun('Catalyst (around 10 percent)')] }),
    lab('What it is. ', 'A storm cuts the island off.'),
    lab('One way I could play it, not a decision yet: ', 'The ferry does not come.', true),
    lab('My move. ', ''),
    new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Supporting Characters')] }),
    lab('Still open: ', 'The mayor. Decided: he is kind. Open: his name.'),
  ] }] });
  return Packer.toBuffer(doc);
}

describe('story bible import keeps her labels (R-B-069, R-B-070, R-B-075)', () => {
  it('Decided stays decided, examples stay examples, hand-offs stay hers; each traces to its passage; a second import adds nothing', async () => {
    const { pid, im, st } = setup('Lighthouse');
    const data = await bibleDocx();
    const r = await im.startDocument(pid, { name: 'Lighthouse Bible 10-13-26.docx', data });
    const plan = r.plan as DocumentPlan;
    expect(plan.docDate).toBe('2026-10-13T12:00:00.000Z');
    expect(plan.newElements.map((e) => e.title)).toEqual(['Marla Quinn']);
    expect(plan.items.find((i) => i.text.startsWith('Read this once'))!.include).toBe(false);
    const split = plan.items.filter((i) => i.passage === plan.items.find((x) => x.text.startsWith('he is kind'))!.passage);
    expect(split.map((i) => [i.label, i.status])).toEqual([['Decided', 'established']]);
    expect(env.brain.elements(pid, { kind: 'character' })).toHaveLength(0);

    im.apply(r.id);
    const marla = env.brain.elements(pid, { kind: 'character' })[0]!;
    expect(env.brain.field(marla.id as string, 'essence').current?.value).toBe('A retired lighthouse keeper who talks to the fog.');
    const arc = env.brain.elements(pid, { kind: 'arc' })[0]!;
    const lie = env.brain.field(arc.id as string, 'lie');
    expect(lie.current).toBeNull();
    expect(lie.illustrative.map((s) => s.value)).toEqual(['“If I leave the light, ships will sink.”']);
    expect(lie.unanswered).toHaveLength(1);
    expect(lie.unanswered[0]!.note).toContain("Name Marla's Lie");
    const ill = lie.illustrative[0]!;
    const ex = env.store.get('excerpts', ill.excerpt_id as string)!;
    expect(ex.text).toContain('One way I could play it, not a decision yet');
    expect(ex.locator).toContain('Weiland Arc');
    const catalyst = st.beats(pid).find((b) => b.attrs.template_key === 'catalyst')!;
    expect(env.brain.field(catalyst.element.id as string, 'event').possibilities[0]?.value).toBe('A storm cuts the island off.');
    expect(env.brain.field(catalyst.element.id as string, 'example').illustrative[0]?.value).toBe('The ferry does not come.');

    const count = () => (env.store.db.prepare('SELECT COUNT(*) AS n FROM statements WHERE deleted_at IS NULL').get() as { n: number }).n;
    const before = count();
    const again = await im.startDocument(pid, { name: 'Lighthouse Bible 10-13-26.docx', data });
    expect((again.plan as DocumentPlan).items.filter((i) => i.include)).toHaveLength(0);
    im.apply(again.id);
    expect(count()).toBe(before);
    expect(env.brain.field(arc.id as string, 'lie').current).toBeNull();
  });

  it('her later decision stays current over an older document', async () => {
    const { pid, im } = setup('Lighthouse');
    const marla = env.brain.createElement(pid, { kind: 'character', title: 'Marla' });
    env.brain.addStatement({ elementId: marla.id, field: 'essence', value: 'A harbor pilot, not a lighthouse keeper.', status: 'established', speaker: { kind: 'author' }, madeAt: '2026-10-14T09:00:00.000Z' });
    const r = await im.startDocument(pid, { name: 'Lighthouse Bible 10-13-26.docx', data: await bibleDocx() });
    const item = (r.plan as DocumentPlan).items.find((i) => i.text.startsWith('A retired lighthouse keeper'))!;
    expect(item.elementId).toBe(marla.id);
    expect(item.field).toBe('facts');
    im.apply(r.id);
    expect(env.brain.field(marla.id as string, 'essence').current?.value).toBe('A harbor pilot, not a lighthouse keeper.');
  });

  const REAL = '/root/.claude/uploads/74daabb6-71d7-5b82-b6b8-3eee2147b1d0/ff80bc05-I_Declare_War_Story_Bible_v5_10-13-26.docx';
  it.skipIf(!existsSync(REAL))('the I Declare War bible: Kevin\'s Bible Lie arrives as an example, never decided', async () => {
    const { pid, im } = setup('I Declare War');
    const r = await im.startDocument(pid, { name: 'I_Declare_War_Story_Bible_v5_10-13-26.docx', data: readFileSync(REAL) });
    im.apply(r.id);
    const kevin = env.brain.elements(pid, { kind: 'character' }).find((e) => e.title === 'Kevin Wickley')!;
    const arc = env.brain.elements(pid, { kind: 'arc' }).find((e) => e.parent_id === kevin.id)!;
    const lie = env.brain.field(arc.id as string, 'lie');
    expect(lie.current).toBeNull();
    expect(String(lie.illustrative[0]?.value)).toContain('constantly vigilant');
  });
});

describe('plotting spreadsheets (R-B-074)', () => {
  it('reads her layout, flags a number that disagrees with its page, and becomes a placement profile', async () => {
    const { pid, im, st, ex } = setup();
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Sheet1');
    const head = [null, 'Beats', 'Description', 'Revised STC Writes A Novel Website Update', 'Approximate Page Number(s) Where Beat Is Located', 'Word Count For Entire Beat (250 words per page)', 'Approximate Page Number(s) Where Beat Is Located', 'Word Count For Entire Beat (300 words per page)', 'Scene Type'];
    ws.addRow([null, 'THESIS WORLD: The world before.']);
    ws.addRow(head);
    ws.addRow([null, ' ​1. Opening Image ', 'First impression.', 'Page 1', '1', '0 - 250', '1', '0 - 300', 'Single Scene']);
    ws.addRow([null, '4. Catalyst', 'Life changes.', '10% or earlier.', '39', '9,750', '33', '9,900', 'Single Scene']);
    ws.addRow([null, 'ANTITHESIS WORLD: Upside down.']);
    ws.addRow(head);
    ws.addRow([null, '8. Fun and Games', 'The promise of the premise.', 'Page 72 - 180', '98 - 180', '24,600 - 45,000', '82 - 150', '24,600 - 45,000', 'Multi Scene']);
    ws.addRow([null, '15. Final Image', 'The mirror.', 'Page 360', '360', '90,000', '300', '90,000', 'Single Scene']);
    const data = Buffer.from(await wb.xlsx.writeBuffer());
    const r = await im.startSheet(pid, { name: 'My sheet.xlsx', data });
    expect(r.report.flagged).toBe(1);
    im.edit(r.id, { density: 250 });
    im.apply(r.id);
    const prof = st.profiles(pid).find((p) => p.key.startsWith('sheet-'))!;
    expect(prof.at.fun_and_games![0]).toBeCloseTo(24500 / 90000, 4);
    expect(prof.windows?.catalyst?.max).toBe(0.1);
    const cat = st.beats(pid).find((b) => b.attrs.template_key === 'catalyst')!;
    expect((cat.attrs.sheet_guidance as Record<string, { description: string }>)['My sheet.xlsx']!.description).toBe('Life changes.');
    const out = await ex.beatSheet(pid, prof.key);
    expect(out.verification.ok).toBe(true);
  });
});

describe('export (R-B-076 to R-B-081)', () => {
  function novel() {
    const s = setup('I Declare War');
    const doc = (n: number) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Kevin said it was ' }, { type: 'text', text: 'not', marks: [{ type: 'italic' }] }, { type: 'text', text: ` his fault, in chapter ${n}.` }] }, { type: 'horizontalRule' }, { type: 'paragraph', content: [{ type: 'text', text: `Anthony did not answer in chapter ${n}.` }] }] });
    const chapters = [1, 2, 3, 4, 5, 6].map((n) => { const c = env.ms.addChapter(s.pid, n === 2 ? 'In Which the Dogs Escape' : undefined); env.ms.addScene(c.id as string, { title: 'S', doc: doc(n) }); return c.id as string; });
    const k = env.brain.createElement(s.pid, { kind: 'character', title: 'Kevin' });
    env.brain.addStatement({ elementId: k.id, field: 'essence', value: 'Paranoid and self-important.', status: 'established', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: k.id, field: 'tuning_fork', value: 'PRIVATE CASTING NOTE', status: 'established', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: k.id, field: 'last_page', value: 'He lets someone in.', status: 'illustrative', speaker: { kind: 'author' } });
    return { ...s, chapters };
  }
  const base = { manuscript: true, sections: [] as never[], includePrivate: false, includeExamples: true, chapterHeading: 'number_title' as const, options: {} };

  it('a book carries its own author name: the pen name when set, the author\'s name otherwise', () => {
    const { pid, ex } = novel();
    env.brain.updateSettings(pid, { authorName: 'Yolanda' });
    expect(ex.book(pid, { ...base, format: 'md' }).author).toBe('Yolanda');
    env.brain.updateSettings(pid, { byline: 'Nadia Simone Brooks' });
    expect(ex.book(pid, { ...base, format: 'md' }).author).toBe('Nadia Simone Brooks');
  });

  it.each(['docx', 'rtf', 'odt', 'epub', 'pdf', 'md', 'txt', 'html'] as const)('%s: read back and checked word for word, chapters in order', async (format) => {
    const { pid, ex } = novel();
    const r = await ex.export(pid, { ...base, format });
    expect(r.verification.ok).toBe(true);
    expect(r.verification.chaptersFound).toBe(6);
  }, 30_000);

  it('plain text says what it loses first; the novel is unchanged', async () => {
    const { pid, ex } = novel();
    const before = JSON.stringify(env.ms.outline(pid));
    const r = await ex.export(pid, { ...base, format: 'txt' });
    expect(r.losses.join(' ')).toMatch(/does not keep italics \(6 passages\)/);
    expect(JSON.stringify(env.ms.outline(pid))).toBe(before);
  });

  it('chapters 1 to 5 only, for a beta reader', async () => {
    const { pid, ex, chapters } = novel();
    const r = await ex.export(pid, { ...base, format: 'docx', chapterIds: chapters.slice(0, 5) });
    expect(r.verification.chaptersExpected).toBe(5);
    expect(r.filename).toContain('chapters 1, 2, 3, 4, 5');
    const mammoth = (await import('mammoth')).default;
    const text = (await mammoth.extractRawText({ buffer: r.data })).value;
    expect(text).toContain('Chapter 2: In Which the Dogs Escape');
    expect(text).not.toContain('chapter 6');
  });

  it('character profiles leave private writing aids out unless she ticks them in; examples are labeled', async () => {
    const { pid, ex } = novel();
    const r = await ex.export(pid, { ...base, manuscript: false, sections: ['characters'], format: 'md' });
    const md = r.data.toString('utf8');
    expect(md).toContain('Paranoid and self-important.');
    expect(md).not.toContain('PRIVATE CASTING NOTE');
    expect(md).toMatch(/One way it could be done:.*He lets someone in\./);
    const withPrivate = await ex.export(pid, { ...base, manuscript: false, sections: ['characters'], format: 'md', includePrivate: true });
    expect(withPrivate.data.toString('utf8')).toContain('PRIVATE CASTING NOTE');
    const json = await ex.export(pid, { ...base, manuscript: false, sections: ['characters'], format: 'json' });
    expect(JSON.parse(json.data.toString('utf8')).sections[0].heading).toBe('Characters');
  });

  it('a saved preset reproduces the same choices', async () => {
    const { pid, ex } = novel();
    const list = ex.savePreset(pid, { name: 'Numbers only', request: { format: 'txt', manuscript: true, sections: [], chapterHeading: 'number', options: { titlePage: false } } });
    const mine = list.find((p) => p.name === 'Numbers only')!;
    expect(mine.builtIn).toBe(false);
    const r = await ex.export(pid, { ...base, ...mine.request } as never);
    expect(r.data.toString('utf8')).toMatch(/^Chapter 2\n/m);
    expect(r.data.toString('utf8')).not.toContain('Dogs Escape');
  });
});

describe('dates from file names', () => {
  it('reads the document date, not a version number', async () => {
    const { dateFromName } = await import('../src/core/io/document-import.js');
    expect(dateFromName('I_Declare_War_Story_Bible_v5_10-13-26.docx')).toBe('2026-10-13T12:00:00.000Z');
    expect(dateFromName('Archive_2026-10-14.docx')).toBe('2026-10-14T12:00:00.000Z');
    expect(dateFromName('notes v2.docx')).toBeNull();
  });
});

describe('search finds what stayed in a document', () => {
  it('a passage that never became a record is still found, with where it sits', async () => {
    const { pid, im } = setup('Lighthouse');
    const r = await im.startDocument(pid, { name: 'Lighthouse Bible 10-13-26.docx', data: await bibleDocx() });
    im.apply(r.id);
    const hits = env.brain.search(pid, 'whole story in one place');
    const p = hits.find((h) => h.hit === 'passage')!;
    expect(p.source_name).toBe('Lighthouse Bible 10-13-26.docx');
    expect(p.locator).toContain('How to Use This Bible');
  });
});
