import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { WritingDesk } from '../src/core/writing.js';
import { Setup } from '../src/core/setup.js';
import { Books } from '../src/core/books.js';
import { Exporter } from '../src/core/io/exporter.js';
import { Importer } from '../src/core/io/importer.js';
import { Conversations } from '../src/core/conversations.js';
import { Collaborator } from '../src/core/ai.js';
import { saveMethod, methods, shelf, setShelf } from '../src/core/methods.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
function setup() {
  env = freshStore();
  const st = new Structure(env.store, env.brain, env.ms); const rp = new Ripple(env.store, env.brain, env.ms, st); const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  const desk = new WritingDesk(env.store, env.brain, env.ms);
  return { st, ct, desk, su: new Setup(env.store, env.brain, st, ct), books: new Books(env.store, env.brain, env.ms, desk), ex: new Exporter(env.store, env.brain, env.ms, st, ct), im: new Importer(env.store, env.brain, env.ms, st, desk) };
}

describe('many books at once, each at its own stage', () => {
  it('the shelf shows every book with its own stage, draft and next step', () => {
    const { su, books } = setup();
    const a = su.createNovel('I Declare War').id as string;
    const b = su.createNovel('The Replacement').id as string;
    const c = su.createNovel('Midnight Blues').id as string;
    books.setStage(a, 'Plotting and planning');
    books.setStage(b, 'First draft');
    books.setStage(c, 'Third draft');
    const ch = env.ms.addChapter(b); env.ms.addScene(ch.id as string, { title: 'Open', text: 'She woke up as someone else.' });
    const shelf = books.shelf();
    expect(shelf.map((x) => [x.title, x.stage]).sort()).toEqual([['I Declare War', 'Plotting and planning'], ['Midnight Blues', 'Third draft'], ['The Replacement', 'First draft']]);
    expect(shelf.find((x) => x.title === 'The Replacement')!.words).toBe(6);
    expect(Object.fromEntries(shelf.map((x) => [x.title, x.draft.name]))).toEqual({ 'I Declare War': 'First draft', 'The Replacement': 'First draft', 'Midnight Blues': 'Third draft' });
  });

  it('finishing a draft keeps the book exactly as it stood; scenes compare across drafts; a kept draft exports as it was', async () => {
    const { su, books, ex } = setup();
    const pid = su.createNovel('Drafted').id as string;
    books.setStage(pid, 'First draft');
    const ch = env.ms.addChapter(pid);
    const s1 = env.ms.addScene(ch.id as string, { title: 'One', text: 'Kevin said it was not his fault.' });
    env.ms.addScene(ch.id as string, { title: 'Two', text: 'Anthony laughed.' });
    const r = books.complete(pid, { note: 'The shape is there.' });
    expect(r.completed.words).toBe(9);
    expect(r.now.name).toBe('Second draft');
    expect(env.brain.project(pid).profile.stage).toBe('Second draft');
    const cur = env.ms.scene(s1.id as string);
    env.ms.saveScene(s1.id as string, { doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Kevin swore it was not his fault.' }] }] }, expectVersion: cur.prose_version as number });
    env.ms.addScene(ch.id as string, { title: 'Three', text: 'New scene.' });
    const cmp = books.compare(pid, r.completed.id as string);
    expect(cmp.changed.map((c) => c.title)).toEqual(['One']);
    expect(cmp.added.map((c) => c.title)).toEqual(['Three']);
    expect(cmp.unchanged).toBe(1);
    const across = books.sceneAcross(s1.id as string);
    expect(across.drafts[0]!.text).toBe('Kevin said it was not his fault.');
    expect(across.scene.text).toBe('Kevin swore it was not his fault.');
    const out = await ex.export(pid, { format: 'txt', manuscript: true, sections: [], includePrivate: false, includeExamples: true, chapterHeading: 'number_title', options: {}, draftId: r.completed.id as string });
    expect(out.data.toString()).toContain('Kevin said it was not his fault.');
    expect(out.data.toString()).not.toContain('New scene.');
    expect(out.verification.ok).toBe(true);
    books.reopenLast(pid);
    expect(books.current(pid).name).toBe('First draft');
  });
});

describe('methods of her own, from any teacher or book', () => {
  it('a method with its own beats drives the board, lines up with other beat sheets, adds its fields and questions', async () => {
    const { su, st } = setup();
    const m = saveMethod(env.store, {
      name: 'Fichtean Curve', source: 'John Gardner, The Art of Fiction', job: 'Crisis after crisis rising to a climax.',
      beats: [
        { name: 'First crisis', at: [0.05, 0.05], moment: 'inciting', description: 'Start in trouble.' } as never,
        { name: 'Rising crises', at: [0.1, 0.7], description: 'Each worse than the last.' } as never,
        { name: 'Climax', at: [0.75, 0.9], moment: 'climax', description: 'Everything at once.' } as never,
        { name: 'Falling action', at: [0.9, 1], moment: 'ending', description: 'What it cost.' } as never,
      ],
      questions: ['Does every crisis raise the stakes?'],
      fields: [{ kind: 'scene_plan', label: 'Crisis level', prompt: 'One to ten.' }],
    });
    const pid = su.createNovel('Thriller').id as string;
    su.update(pid, { frameworks: ['save_the_cat', m.key], spine: m.key });
    expect(st.beats(pid).map((b) => b.element.title)).toEqual(['First crisis', 'Rising crises', 'Climax', 'Falling action']);
    expect(st.profiles(pid)[0]!.name).toBe('Your placement');
    const first = st.beats(pid)[0]!;
    expect(st.beatDetail(first.element.id as string).alsoCalled.map((a) => a!.name)).toContain('Catalyst');
    expect(env.brain.fieldsFor(pid, 'scene_plan').find((f) => f.label === 'Crisis level')?.group).toBe('Fichtean Curve');
    expect(su.get(pid).catalog.frameworks.find((f: { key: string }) => f.key === m.key)!.questions).toEqual(['Does every crisis raise the stakes?']);

    // She changes the method: a renamed beat keeps what was placed on it.
    const card = st.addCard(pid, { title: 'The bridge', beatId: first.element.id as string });
    saveMethod(env.store, { ...methods(env.store)[0]!, beats: methods(env.store)[0]!.beats.map((b, i) => (i === 0 ? { ...b, name: 'Opening crisis' } : b)) });
    st.applyTemplate(pid, m.key);
    expect(st.beats(pid)[0]!.element.title).toBe('Opening crisis');
    expect(st.placements(card.id as string).decided?.beatId).toBe(first.element.id);

    // Turned off for this novel, its fields step aside; another novel never sees them.
    su.update(pid, { frameworks: ['save_the_cat'] });
    expect(env.brain.fieldsFor(pid, 'scene_plan').some((f) => f.label === 'Crisis level')).toBe(false);
  });

  it('her craft shelf is hers to change, and the collaborator reads it and her methods', async () => {
    const { su, ct } = setup();
    expect(shelf(env.store).some((b) => b.author === 'Robert McKee')).toBe(true);
    setShelf(env.store, [...shelf(env.store), { title: 'Wired for Story', author: 'Lisa Cron', useFor: 'What the reader\'s brain wants' }] as never);
    const m = saveMethod(env.store, { name: 'Story Genius', source: 'Lisa Cron', job: 'Start from the character\'s misbelief.', questions: ['What is the third rail?'] });
    const pid = su.createNovel('Any').id as string;
    su.update(pid, { frameworks: [m.key] });
    const convs = new Conversations(env.store, env.brain);
    const calls: { system: string; messages: { content: unknown }[] }[] = [];
    const ai = new Collaborator(env.store, env.brain, env.ms, convs, ct, () => ({ async create(req) { calls.push(req as never); return { content: [{ type: 'text', text: 'ok' }], stop_reason: 'end_turn' }; } }));
    ai.setKey('k'); ai.configure(pid, { enabled: true });
    await ai.ask(convs.create(pid, { title: 'x' }).id as string, { text: 'Where can I learn about misbelief?', mode: 'resources' });
    expect(calls[0]!.system).toContain('Wired for Story, Lisa Cron');
    expect(String(calls[0]!.messages[0]!.content)).toContain('Her own method "Story Genius" (from Lisa Cron)');
    expect(String(calls[0]!.messages[0]!.content)).toContain('What is the third rail?');
  });

  it('a spreadsheet laid out for another method becomes a beat sheet of her own', async () => {
    const { im, st } = setup();
    const pid = env.brain.createProject('Sheet').id as string;
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Sheet1');
    ws.addRow(['Stage', 'Description', 'Percent']);
    ws.addRow(['1. The Hook', 'Grab them.', '0%']);
    ws.addRow(['2. The Turn', 'Everything changes.', '25%']);
    ws.addRow(['3. The Pinch', 'Pressure.', '37.5%']);
    ws.addRow(['4. The Resolution', 'It ends.', '95 - 100%']);
    const r = await im.startSheet(pid, { name: 'My Seven Steps.xlsx', data: Buffer.from(await wb.xlsx.writeBuffer()) });
    expect((r.plan as { asMethod: boolean }).asMethod).toBe(true);
    im.apply(r.id);
    const m = methods(env.store).find((x) => x.name === 'My Seven Steps')!;
    expect(m.beats.map((b) => [b.name, b.at])).toEqual([['The Hook', [0, 0]], ['The Turn', [0.25, 0.25]], ['The Pinch', [0.375, 0.375]], ['The Resolution', [0.95, 1]]]);
    expect(st.beats(pid).map((b) => b.element.title)).toEqual(['The Hook', 'The Turn', 'The Pinch', 'The Resolution']);
  });
});

describe('a book that arrives mid-way', () => {
  it('setting the stage to "Third draft" before any draft is kept makes the current draft the third', () => {
    const { su, books } = setup();
    const pid = su.createNovel('Midnight Blues').id as string;
    books.setStage(pid, 'Third draft');
    expect(books.current(pid).name).toBe('Third draft');
    const ch = env.ms.addChapter(pid); env.ms.addScene(ch.id as string, { text: 'It was late.' });
    expect(books.complete(pid).now.name).toBe('Fourth draft');
  });
});
