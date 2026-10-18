// Export: choose what goes out (R-B-081), in which format (R-B-076), with presets (R-B-080).
// Before: say what the format cannot keep. After: read the file back and check every chapter and every word is there (R-B-078).
// Exporting never changes the novel. Private writing aids stay out unless she ticks them in.

import { StoryTime } from '../storytime.js';
import { Store, Row, ValidationError, newId } from '../store.js';
import { Brain } from '../brain.js';
import { Manuscript } from '../manuscript.js';
import { Structure } from '../structure.js';
import { Continuity } from '../continuity.js';
import { settingsOf } from '../settings.js';
import { statusLabel } from '../labels.js';
import { KIND_LABELS } from '../templates.js';
import { Block, docToBlocks, htmlToBlocks, markdownToBlocks, rtfToBlocks, textToBlocks, plain, blockText } from './blocks.js';
import { odtToBlocks } from './readers.js';
import { writeBeatSheet } from './spreadsheet.js';
import { WORLDS, beatDef } from '../structure.js';
import { Book, BookChapter, ExportFormat, FORMAT_INFO, WriteOptions, lossesFor, toDocx, toEpub, toHtml, toMarkdown, toOdt, toPdf, toRtf, toText } from './writers.js';

export type Section = 'characters' | 'beats' | 'places' | 'set_pieces' | 'open_decisions' | 'setups_payoffs' | 'timeline' | 'soundtrack' | 'all_records';

export interface ExportRequest {
  format: ExportFormat | 'json';
  manuscript: boolean;
  chapterIds?: string[] | null;          // null or missing: every chapter
  sections: Section[];
  includePrivate: boolean;               // private writing aids (casting tuning fork, playlist)
  includeExamples: boolean;              // "one way it could be done" examples, labeled
  chapterHeading: 'number_title' | 'number' | 'title';
  options: Partial<WriteOptions>;
  /** A kept draft instead of the manuscript as it is now. */
  draftId?: string | null;
}

export const PRESETS: { key: string; name: string; description: string; request: Partial<ExportRequest> }[] = [
  { key: 'working', name: 'Working manuscript', description: 'Word, every chapter, easy to read and edit.', request: { format: 'docx', manuscript: true, sections: [], chapterHeading: 'number_title', options: { manuscriptFormat: false, titlePage: false, sceneTitles: false, chapterOnNewPage: true } } },
  { key: 'editorial', name: 'Editorial manuscript', description: 'For an editor or agent: double-spaced 12 pt, title page, name and title in the header.', request: { format: 'docx', manuscript: true, sections: [], chapterHeading: 'number_title', options: { manuscriptFormat: true, titlePage: true, sceneTitles: false, chapterOnNewPage: true, sceneBreak: '#' } } },
  { key: 'beta', name: 'Beta reader copy', description: 'The story only. No planning notes, nothing private.', request: { format: 'docx', manuscript: true, sections: [], includePrivate: false, chapterHeading: 'number_title', options: { manuscriptFormat: false, titlePage: true, sceneTitles: false, chapterOnNewPage: true } } },
  { key: 'print', name: 'Print review', description: 'A Letter-size PDF to read and mark up on paper.', request: { format: 'pdf', manuscript: true, sections: [], chapterHeading: 'number_title', options: { manuscriptFormat: false, titlePage: true, sceneTitles: false, chapterOnNewPage: true } } },
  { key: 'ebook', name: 'E-book', description: 'EPUB for an e-reader.', request: { format: 'epub', manuscript: true, sections: [], chapterHeading: 'number_title', options: { titlePage: true, sceneTitles: false } } },
  { key: 'profiles', name: 'Character profiles', description: 'Every character, field by field, with your status words. Word document.', request: { format: 'docx', manuscript: false, sections: ['characters'], includeExamples: true, options: { titlePage: false } } },
  { key: 'planning', name: 'Planning binder', description: 'Characters, beats, places, set pieces, open decisions and setups and payoffs.', request: { format: 'docx', manuscript: false, sections: ['characters', 'beats', 'places', 'set_pieces', 'open_decisions', 'setups_payoffs'], includeExamples: true, options: { titlePage: true } } },
];

const DEFAULT_OPTIONS: WriteOptions = { sceneBreak: '* * *', sceneTitles: false, titlePage: true, manuscriptFormat: false, chapterOnNewPage: true };

const words = (s: string) => (s.match(/[\p{L}\p{N}]+/gu) ?? []).length;
const squash = (s: string) => s.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

export class Exporter {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private structure: Structure, private continuity: Continuity) {}

  /** Assemble what was asked for. Nothing here writes to the novel. */
  book(projectId: string, req: ExportRequest): Book {
    const p = this.brain.project(projectId);
    const st = settingsOf(p.profile);
    if (req.draftId && req.manuscript) return { title: p.title as string, author: st.byline || st.authorName, chapters: this.draftChapters(projectId, req), extras: this.sections(projectId, req) };
    const outline = this.ms.outline(projectId);
    const pick = req.chapterIds && req.chapterIds.length ? new Set(req.chapterIds) : null;
    if (pick) for (const id of pick) if (!outline.some((c) => c.id === id)) throw new ValidationError('One of the chosen chapters is not in this novel.');
    const chapters: BookChapter[] = !req.manuscript ? [] : outline.filter((c) => !pick || pick.has(c.id as string)).map((c) => {
      const n = c.number as number;
      const title = (c.title as string) || '';
      const generic = !title || /^chapter\s+\d+$/i.test(title.trim());
      const heading = req.chapterHeading === 'number' || generic ? `Chapter ${n}` : req.chapterHeading === 'title' ? title : `Chapter ${n}: ${title}`;
      return {
        number: n, title, heading,
        scenes: (c.scenes as Row[]).map((s) => {
          const full = this.ms.scene(s.id as string);
          return { id: full.id as string, title: full.title as string, blocks: docToBlocks(JSON.parse(full.doc_json as string)) };
        }),
      };
    });
    return { title: p.title as string, author: st.byline || st.authorName, chapters, extras: this.sections(projectId, req) };
  }

  private draftChapters(projectId: string, req: ExportRequest): BookChapter[] {
    const d = this.store.db.prepare('SELECT * FROM drafts WHERE id=? AND project_id=? AND completed_at IS NOT NULL').get(req.draftId, projectId) as Row | undefined;
    if (!d) throw new ValidationError('That draft is not a finished draft of this novel.');
    const rows = this.store.db.prepare('SELECT * FROM draft_scenes WHERE draft_id=? ORDER BY position').all(req.draftId) as Row[];
    const out: BookChapter[] = [];
    for (const r of rows) {
      if (req.chapterIds?.length && !req.chapterIds.includes(r.chapter_id as string)) continue;
      let c = out.find((x) => x.number === r.chapter_number);
      if (!c) {
        const n = r.chapter_number as number, title = (r.chapter_title as string) || '';
        const generic = !title || /^chapter\s+\d+$/i.test(title.trim());
        c = { number: n, title, heading: req.chapterHeading === 'number' || generic ? `Chapter ${n}` : req.chapterHeading === 'title' ? title : `Chapter ${n}: ${title}`, scenes: [] };
        out.push(c);
      }
      c.scenes.push({ id: r.scene_id as string, title: r.title as string, blocks: docToBlocks(JSON.parse(r.doc_json as string)) });
    }
    return out;
  }

  private sections(pid: string, req: ExportRequest): Book['extras'] {
    const st = settingsOf(this.brain.project(pid).profile);
    const label = (s: string) => statusLabel(s as never, st.statusLabels, st.authorName);
    const P = (text: string, extra: { i?: boolean; b?: boolean } = {}): Block => ({ type: 'p', runs: [{ text, ...extra }] });
    const H = (text: string, level = 1): Block => ({ type: 'h', level, runs: [{ text }] });
    const val = (v: unknown) => (v == null ? '' : typeof v === 'string' ? v : Array.isArray(v) ? v.join(', ') : JSON.stringify(v));
    const page = (id: string) => {
      const pg = this.brain.elementPage(id);
      const out: Block[] = [];
      let group = '';
      for (const f of pg.fields) {
        if (f.def.private && !req.includePrivate) continue;
        const v = f.view;
        const lines: Block[] = [];
        for (const s of v.currentAll ?? (v.current ? [v.current] : [])) lines.push({ type: 'p', runs: [{ text: `${label('established')}: `, b: true }, { text: val(s.value) }] });
        for (const s of v.possibilities) lines.push({ type: 'p', runs: [{ text: `${label(s.status as string)}: `, b: true }, { text: val(s.value) }] });
        for (const s of v.unanswered) lines.push({ type: 'p', runs: [{ text: `${label('unanswered')}`, b: true }, { text: s.note ? `: ${s.note as string}` : '' }] });
        if (req.includeExamples) for (const s of v.illustrative) lines.push({ type: 'p', runs: [{ text: `${label('illustrative')}: `, b: true, i: true }, { text: val(s.value), i: true }] });
        if (!lines.length) continue;
        if (f.def.group !== group) { group = f.def.group; out.push(H(group, 2)); }
        out.push({ type: 'p', runs: [{ text: f.def.label, b: true }] }, ...lines);
      }
      for (const c of pg.children) {
        const sub = page(c.element.id as string);
        if (sub.length) out.push(H(c.element.title as string, 2), ...sub);
      }
      return out;
    };
    const kindSection = (kind: string, heading: string) => {
      const els = this.brain.elements(pid, { kind }).filter((e) => !e.parent_id || kind === 'beat');
      if (!els.length) return null;
      const blocks: Block[] = [];
      for (const e of els) { blocks.push(H(e.title as string, 1)); const b = page(e.id as string); blocks.push(...(b.length ? b : [P('Nothing recorded yet.', { i: true })])); }
      return { heading, blocks };
    };
    const out: Book['extras'] = [];
    for (const s of req.sections) {
      if (s === 'characters') { const x = kindSection('character', 'Characters'); if (x) out.push(x); }
      if (s === 'places') { const x = kindSection('location', 'Places'); if (x) out.push(x); }
      if (s === 'set_pieces') { const x = kindSection('set_piece', 'Set pieces'); if (x) out.push(x); }
      if (s === 'beats') {
        const beats = this.structure.beats(pid);
        if (beats.length) {
          const blocks: Block[] = [];
          for (const b of beats) { blocks.push(H(`${b.element.title as string}${b.def?.window ? ` (${b.def.window})` : ''}`, 1)); blocks.push(...page(b.element.id as string)); }
          out.push({ heading: 'Beat sheet', blocks });
        }
      }
      if (s === 'open_decisions') {
        const d = this.brain.openDecisions(pid);
        const blocks: Block[] = [];
        if (d.stillOpen.length) { blocks.push(H('Still open', 1)); for (const x of d.stillOpen) blocks.push(P(`${x.element_title as string}, ${String(x.field).replace(/_/g, ' ')}${x.note ? `: ${x.note as string}` : ''}`)); }
        if (d.choosing.length) { blocks.push(H('Choosing between possibilities', 1)); for (const x of d.choosing) blocks.push(P(`${x.element_title as string}, ${String(x.field).replace(/_/g, ' ')}: ${x.options as number} possibilities`)); }
        if (d.questions.length) { blocks.push(H('Questions', 1)); for (const q of d.questions) blocks.push(P(q.body ? (q.body as string) : (q.title as string))); }
        if (d.reserved.length) { blocks.push(H('Kept for you to write', 1)); for (const r of d.reserved) blocks.push(P(`${r.title as string} (${r.reserved as string})`)); }
        out.push({ heading: 'Open decisions', blocks: blocks.length ? blocks : [P('Nothing open right now.', { i: true })] });
      }
      if (s === 'setups_payoffs') {
        const clues = this.continuity.clues(pid);
        const blocks: Block[] = [];
        for (const c of clues) {
          blocks.push(H(c.title as string, 1));
          const side = (name: string, xs: { title: string; at: number | null }[]) => blocks.push(P(`${name}: ${xs.length ? xs.map((x) => `${x.title}${x.at ? ` (place ${x.at})` : ''}`).join('; ') : 'none yet'}`));
          side('Planted', c.plants); side('Revealed', c.reveals); side('Paid off', c.payoffs);
        }
        out.push({ heading: 'Setups and payoffs', blocks: blocks.length ? blocks : [P('No setups or payoffs recorded yet.', { i: true })] });
      }
      if (s === 'timeline') {
        const t = this.continuity.timelines(pid);
        const blocks: Block[] = [H('In story order', 1), ...t.chronological.map((r) => P(`${[r.day != null ? `Day ${val(r.day)}` : '', r.date != null ? val(r.date) : '', r.time != null ? val(r.time) : ''].filter(Boolean).join(', ')}: ${r.title} (place ${r.narrative} in the book)`))];
        if (t.unplacedInTime) blocks.push(P(`${t.unplacedInTime} scene${t.unplacedInTime === 1 ? ' has' : 's have'} no story time yet.`, { i: true }));
        if (!t.chronological.length) blocks.splice(0, 1);
        out.push({ heading: 'Timeline', blocks: blocks.length ? blocks : [P('No events on the timeline yet.', { i: true })] });
      }
      if (s === 'soundtrack') {
        const songs = new StoryTime(this.store, this.brain, this.ms).soundtrack(pid);
        const blocks: Block[] = songs.map((x, i) => P(`${i + 1}. ${x.title}${x.artist ? `, ${x.artist}` : ''}${x.carries ? `. ${x.carries}` : ''}${x.plays.length ? ` (${x.plays.map((p) => p.title).join('; ')})` : ''}`));
        out.push({ heading: 'Soundtrack', blocks: blocks.length ? blocks : [P('No songs recorded yet.', { i: true })] });
      }
      if (s === 'all_records') {
        const kinds = [...new Set(this.brain.elements(pid).map((e) => e.kind as string))].filter((k) => !['thought', 'guardrail', 'scene_plan', 'arc', 'character', 'beat', 'location', 'set_piece'].includes(k));
        for (const k of kinds) { const x = kindSection(k, KIND_LABELS[k]?.plural ?? k); if (x) out.push(x); }
      }
    }
    return out;
  }

  /** Parts show in the Writing Room but are not printed yet; say so before and after exporting. */
  partsNote(projectId: string, req: ExportRequest): string[] {
    if (!req.manuscript) return [];
    const parts = (this.ms.outline(projectId) as unknown as { part_title?: string }[]).filter((c) => c.part_title).length;
    const out = parts ? [`Part titles (such as "Part One") are not printed yet. The chapters export without them.`] : [];
    // Notes left for later print exactly as written, so she sees them before the file goes anywhere.
    const chosen = req.chapterIds?.length ? new Set((this.ms.outline(projectId) as unknown as { id: string; number: number }[]).filter((c) => req.chapterIds!.includes(c.id)).map((c) => c.number)) : null;
    const notes = this.ms.laterNotes(projectId).filter((n) => !chosen || chosen.has(n.chapterNumber));
    if (notes.length) out.push(`${notes.length} note${notes.length === 1 ? '' : 's'} left for later, [[in double brackets]], ${notes.length === 1 ? 'is' : 'are'} still in the text and will print as written. They are listed on Where was I.`);
    return out;
  }

  /** Build the file, then read it back and check it. */
  async export(projectId: string, req: ExportRequest) {
    if (!req.manuscript && !req.sections.length) throw new ValidationError('Choose the manuscript, at least one planning section, or both.');
    const book = this.book(projectId, req);
    if (req.manuscript && !book.chapters.length && !book.extras.length) throw new ValidationError('There are no chapters to export yet.');
    const o: WriteOptions = { ...DEFAULT_OPTIONS, ...req.options };
    const safe = (book.title.replace(/[^\p{L}\p{N} _-]+/gu, '').trim() || 'novel').slice(0, 80);
    const part = req.manuscript && req.chapterIds?.length ? ` (chapters ${book.chapters.map((c) => c.number).join(', ')})` : !req.manuscript ? ' planning' : '';
    if (req.format === 'json') {
      const data = { format: 'story-canon-export', version: 1, exported_at: new Date().toISOString(), title: book.title, author: book.author, chapters: book.chapters.map((c) => ({ number: c.number, title: c.title, scenes: c.scenes.map((s) => ({ title: s.title, text: s.blocks.map(blockText).join('\n\n'), blocks: s.blocks })) })), sections: book.extras };
      const buf = Buffer.from(JSON.stringify(data, null, 1));
      const back = JSON.parse(buf.toString('utf8')) as typeof data;
      const ok = back.chapters.length === book.chapters.length && back.sections.length === book.extras.length;
      return { filename: `${safe}${part}.json`, mime: 'application/json', data: buf, losses: [], verification: { ok, chaptersExpected: book.chapters.length, chaptersFound: back.chapters.length, wordsExpected: 0, wordsFound: 0, missing: [] as string[], note: ok ? 'Every chapter and section is in the file.' : 'The file is incomplete.' } };
    }
    const fmt = req.format as ExportFormat;
    const losses = [...lossesFor(book, fmt), ...this.partsNote(projectId, req)];
    let data: Buffer;
    switch (fmt) {
      case 'docx': data = await toDocx(book, o); break;
      case 'rtf': data = Buffer.from(toRtf(book, o), 'latin1'); break;
      case 'odt': data = await toOdt(book, o); break;
      case 'epub': data = await toEpub(book, o, newId()); break;
      case 'pdf': data = await toPdf(book, o); break;
      case 'md': data = Buffer.from(toMarkdown(book, o), 'utf8'); break;
      case 'html': data = Buffer.from(toHtml(book, o), 'utf8'); break;
      default: data = Buffer.from(toText(book, o), 'utf8');
    }
    const verification = await verify(fmt, data, book);
    return { filename: `${safe}${part}.${FORMAT_INFO[fmt].ext}`, mime: FORMAT_INFO[fmt].mime, data, losses, verification };
  }

  /** Her plotting sheet, written back out with this novel's numbers (R-B-074). */
  async beatSheet(projectId: string, profileKey = 'brody') {
    const p = this.brain.project(projectId);
    const st = settingsOf(p.profile);
    const prof = this.structure.profiles(projectId).find((x) => x.key === profileKey);
    if (!prof) throw new ValidationError('That placement profile is not in this novel.');
    const beats = this.structure.beats(projectId);
    if (!beats.length) throw new ValidationError('Choose a beat sheet for this novel first.');
    const stc = this.structure.spine(projectId) === 'save_the_cat';
    const lm = this.structure.landmarks(projectId);
    const target = st.targetWords ?? (lm.length.drafted || 90000);
    const counts = new Map<string, number>();
    for (const e of this.brain.elements(projectId).filter((x) => ['scene_plan', 'event'].includes(x.kind as string))) { const b = this.structure.decidedBeat(e.id as string); if (b) counts.set(b, (counts.get(b) ?? 0) + 1); }
    const val = (id: string, f: string) => { const v = this.brain.field(id, f); const x = v.current ?? v.latest; return x ? `${String(x.value)}${v.current ? '' : ` (${statusLabel(x.status as never, st.statusLabels, st.authorName)})`}` : ''; };
    const rows = beats.map((b) => {
      const key = b.attrs.template_key as string;
      const def = beatDef((b.attrs.template as string) ?? 'save_the_cat', key, this.structure.registry());
      const guide = Object.values((b.attrs.sheet_guidance as Record<string, { description: string; where: string; scene_type: string }>) ?? {})[0];
      const custom = (b.attrs.placement as Record<string, [number, number]> | undefined)?.[prof.key];
      return {
        key, number: (b.attrs.number as number | null) ?? null, name: b.element.title as string, group: stc ? ((b.group as string) ?? 'thesis') : (b.act as string),
        description: guide?.description || def?.description || '', where: guide?.where || def?.window || prof.windows?.[key]?.text || '', sceneType: guide?.scene_type || def?.sceneType || '',
        at: custom ?? prof.at[key] ?? null, plan: val(b.element.id as string, 'event') || val(b.element.id as string, 'function'), scenes: counts.get(b.element.id as string) ?? 0,
      };
    });
    const groups = stc ? (['thesis', 'antithesis', 'synthesis'] as const).map((k) => ({ key: k, name: WORLDS[k]?.name ?? k, description: WORLDS[k]?.description ?? '' }))
      : [['I', 'Act One'], ['IIA', 'Act Two, first half'], ['IIB', 'Act Two, second half'], ['III', 'Act Three']].map(([k, n]) => ({ key: k!, name: n!, description: '' }));
    const data = await writeBeatSheet({ title: p.title as string, targetWords: target, densities: st.wordsPerPage, groups, beats: rows, profileName: prof.name });
    // Read it back: every beat row must be there.
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook(); await wb.xlsx.load(data as unknown as ArrayBuffer);
    let found = 0; wb.worksheets[0]!.eachRow((r) => { const v = String(r.getCell(1).value ?? ''); if (rows.some((b) => v.endsWith(b.name))) found++; });
    const safe = (p.title as string).replace(/[^\p{L}\p{N} _-]+/gu, '').trim() || 'novel';
    return { filename: `${safe} beat sheet.xlsx`, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', data, losses: [], verification: { ok: found === rows.length, chaptersExpected: 0, chaptersFound: 0, wordsExpected: 0, wordsFound: 0, missing: [], note: found === rows.length ? `Checked: all ${rows.length} beats are in the sheet.` : `Only ${found} of ${rows.length} beats were found in the sheet.` } };
  }

  presets(projectId: string) {
    const custom = ((this.brain.project(projectId).profile.export_presets as unknown[]) ?? []) as { key: string; name: string; description: string; request: Partial<ExportRequest> }[];
    return [...PRESETS.map((p) => ({ ...p, builtIn: true })), ...custom.map((p) => ({ ...p, builtIn: false }))];
  }

  savePreset(projectId: string, preset: { name: string; description?: string; request: Partial<ExportRequest> }) {
    const p = this.brain.project(projectId);
    const list = ((p.profile.export_presets as unknown[]) ?? []) as { key: string; name: string }[];
    const key = `custom-${newId().slice(0, 8)}`;
    const next = [...list.filter((x) => x.name !== preset.name), { key, name: preset.name.trim(), description: preset.description ?? '', request: preset.request }];
    this.brain.updateProject(projectId, { profile: { ...p.profile, export_presets: next } });
    return this.presets(projectId);
  }

  deletePreset(projectId: string, key: string) {
    const p = this.brain.project(projectId);
    const list = ((p.profile.export_presets as unknown[]) ?? []) as { key: string }[];
    this.brain.updateProject(projectId, { profile: { ...p.profile, export_presets: list.filter((x) => x.key !== key) } });
    return this.presets(projectId);
  }
}

/** Read the file back the way another program would, and compare it with what was meant to go in. */
export async function verify(format: ExportFormat, data: Buffer, book: Book) {
  let text = '';
  try {
    if (format === 'docx') {
      const mammoth = (await import('mammoth')).default;
      text = (await htmlToBlocksText((await mammoth.convertToHtml({ buffer: data })).value));
    } else if (format === 'odt') {
      const JSZip = (await import('jszip')).default;
      text = odtToBlocks(await (await JSZip.loadAsync(data)).file('content.xml')!.async('string')).map(blockText).join('\n');
    } else if (format === 'epub') {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(data);
      const opf = await zip.file('OEBPS/content.opf')!.async('string');
      const order = [...opf.matchAll(/<itemref idref="([^"]+)"/g)].map((m) => m[1]!);
      const hrefs = Object.fromEntries([...opf.matchAll(/<item id="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1]!, m[2]!]));
      for (const id of order) text += htmlToBlocks(await zip.file(`OEBPS/${hrefs[id]}`)!.async('string')).map(blockText).join('\n') + '\n';
    } else if (format === 'pdf') {
      text = await pdfText(data);
    } else if (format === 'rtf') text = rtfToBlocks(data.toString('latin1')).map(blockText).join('\n');
    else if (format === 'md') text = markdownToBlocks(data.toString('utf8')).map(blockText).join('\n');
    else if (format === 'html') text = htmlToBlocks(data.toString('utf8')).map(blockText).join('\n');
    else text = textToBlocks(data.toString('utf8')).map(blockText).join('\n');
  } catch {
    return { ok: false, chaptersExpected: book.chapters.length, chaptersFound: 0, wordsExpected: 0, wordsFound: 0, missing: [], note: 'The file could not be read back, so it was not confirmed. Try another format.' };
  }
  const got = squash(text);
  const missing: string[] = [];
  let found = 0, cursor = 0, wordsExpected = 0;
  for (const c of book.chapters) {
    const at = got.indexOf(squash(c.heading), cursor);
    if (at < 0) { missing.push(c.heading); continue; }
    cursor = at;
    const body = c.scenes.map((s) => s.blocks.map((b) => (b.type === 'break' ? '' : plain(b.runs))).join(' ')).join(' ');
    wordsExpected += words(body);
    if (got.includes(squash(body))) found++; else missing.push(`${c.heading} (text differs)`);
  }
  for (const e of book.extras) if (!got.includes(squash(e.heading))) missing.push(e.heading);
  const ok = missing.length === 0;
  return {
    ok, chaptersExpected: book.chapters.length, chaptersFound: found, wordsExpected, wordsFound: ok ? wordsExpected : words(text),
    missing,
    note: ok ? `Checked: all ${book.chapters.length} chapter${book.chapters.length === 1 ? '' : 's'}${book.extras.length ? ` and ${book.extras.length} section${book.extras.length === 1 ? '' : 's'}` : ''} are in the file, in order, word for word.` : `Not confirmed. Missing or different: ${missing.slice(0, 5).join('; ')}.`,
  };
}

async function htmlToBlocksText(html: string) { return htmlToBlocks(html).map(blockText).join('\n'); }

async function pdfText(data: Buffer) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(data), useSystemFonts: false, isEvalSupported: false, disableFontFace: true, verbosity: 0 }).promise;
  let out = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const h = page.view[3]!;
    const tc = await page.getTextContent();
    for (const it of tc.items as { str?: string; transform?: number[] }[]) {
      const y = it.transform?.[5] ?? 0;
      if (y < 60 || y > h - 50) continue;   // page numbers and running header
      out += (it.str ?? '') + ' ';
    }
    out += '\n';
  }
  await doc.destroy();
  return out;
}
