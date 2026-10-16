// Bringing a manuscript in from Word, RTF, Markdown or text (R-B-072).
// The program proposes chapters and scenes; nothing reaches the outline until she accepts the plan (R-B-071).
// The words are never changed: the import is checked character for character after it is applied.

import { Block, blockText, blocksToDoc, plain } from './blocks.js';
import { countWords, docToText } from '../manuscript.js';

export interface PlannedScene { key: string; title: string; titleFrom: 'heading' | 'numbered'; blocks: Block[]; words: number; include: boolean; joinPrevious: boolean; startsWith: 'start' | 'break' | 'heading' }
export interface PlannedChapter { key: string; title: string; titleFrom: 'heading' | 'pattern' | 'none'; note: string; include: boolean; joinPrevious: boolean; scenes: PlannedScene[] }
export interface ManuscriptPlan { chapters: PlannedChapter[]; findings: string[]; totalWords: number; totalBlocks: number }

const NUM_WORDS = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty';
const CHAPTER_RE = new RegExp(`^\\s*(chapter|ch\\.)\\s+([0-9]+|[ivxlcdm]+|(?:${NUM_WORDS})(?:[- ](?:${NUM_WORDS}))?)\\b`, 'i');
const SPECIAL_RE = /^\s*(prologue|epilogue|interlude|afterword|foreword|preface|introduction)\b/i;
const PART_RE = /^\s*(part|book)\s+([0-9]+|[ivxlcdm]+|[a-z]+)\b/i;

export function planManuscript(blocks: Block[]): ManuscriptPlan {
  const findings: string[] = [];
  const isChapterLine = (b: Block) => {
    const t = blockText(b).trim();
    return t.length <= 90 && !t.includes('\n') && (CHAPTER_RE.test(t) || SPECIAL_RE.test(t) && t.split(/\s+/).length <= 8);
  };
  // The chapter level: the shallowest heading level used at least twice, unless chapter-numbered lines exist.
  const headings = blocks.filter((b) => b.type === 'h') as Extract<Block, { type: 'h' }>[];
  const counts = new Map<number, number>();
  for (const h of headings) if (!PART_RE.test(plain(h.runs))) counts.set(h.level, (counts.get(h.level) ?? 0) + 1);
  const numbered = blocks.filter(isChapterLine);
  // Mode A: chapter lines ("Chapter 3", "Prologue") mark chapters. Mode B: the shallowest heading level used twice. Otherwise one chapter.
  const levels = [...counts.entries()].filter(([, n]) => n >= 2).map(([l]) => l);
  const chapterLevel: number | null = numbered.length ? null : levels.length ? Math.min(...levels) : null;
  const startsChapter = (b: Block) => numbered.length ? isChapterLine(b) : b.type === 'h' && chapterLevel !== null && b.level <= chapterLevel;
  const minNumberedHeading = Math.min(...numbered.map((b) => (b.type === 'h' ? b.level : 99)));
  const chapters: PlannedChapter[] = [];
  let ch: PlannedChapter | null = null, sc: PlannedScene | null = null, pendingPart = '', k = 0;
  const newChapter = (title: string, titleFrom: PlannedChapter['titleFrom']) => {
    ch = { key: `c${++k}`, title, titleFrom, note: pendingPart ? `Begins ${pendingPart}` : '', include: true, joinPrevious: false, scenes: [] };
    pendingPart = ''; sc = null; chapters.push(ch);
  };
  const newScene = (title: string, titleFrom: PlannedScene['titleFrom'], startsWith: PlannedScene['startsWith']) => {
    if (!ch) newChapter(chapters.length ? 'Untitled chapter' : 'Before the first chapter', 'none');
    sc = { key: `s${++k}`, title, titleFrom, blocks: [], words: 0, include: true, joinPrevious: false, startsWith };
    ch!.scenes.push(sc);
  };
  for (const b of blocks) {
    const t = blockText(b).trim();
    if (b.type === 'h' && (PART_RE.test(t) || (numbered.length && b.level < minNumberedHeading && !isChapterLine(b)))) { pendingPart = t; continue; }
    if (b.type !== 'break' && startsChapter(b)) {
      newChapter(t, b.type === 'h' ? 'heading' : 'pattern');
      continue;
    }
    if (b.type === 'h') { newScene(t, 'heading', 'heading'); continue; }
    if (b.type === 'break') { if (sc && (sc as PlannedScene).blocks.length) sc = null; continue; }
    if (!sc) newScene('', 'numbered', ch && (ch as PlannedChapter).scenes.length ? 'break' : 'start');
    (sc as unknown as PlannedScene).blocks.push(b);
  }
  // Number untitled scenes within their chapter; drop empty scenes created by headings with nothing under them.
  let totalWords = 0;
  for (const c of chapters) {
    c.scenes = c.scenes.filter((s) => s.blocks.length || s.titleFrom === 'heading');
    c.scenes.forEach((s, i) => {
      s.words = countWords(s.blocks.map(blockText).join('\n\n'));
      totalWords += s.words;
      if (!s.title) s.title = `Scene ${i + 1}`;
    });
  }
  const real = chapters.filter((c) => c.scenes.length || c.titleFrom !== 'none');
  if (!real.length) findings.push('No text was found in the file.');
  else if (real.every((c) => c.titleFrom === 'none')) findings.push('No chapter headings were found, so everything is in one chapter. Join or split it after you accept, or mark chapter starts in the file and import again.');
  if (real[0] && real[0].titleFrom === 'none' && real.length > 1) findings.push('Text before the first chapter is kept as its own chapter. Leave it out if it is a title page.');
  const short = real.flatMap((c) => c.scenes).filter((s) => s.words > 0 && s.words < 40).length;
  if (short) findings.push(`${short} very short scene${short === 1 ? '' : 's'} (under 40 words). These may be epigraphs or stray breaks; join them to the scene before if so.`);
  return { chapters: real, findings, totalWords, totalBlocks: blocks.length };
}

/** What she accepted, folded: joined scenes and chapters merged, left-out pieces dropped. */
export function finalShape(plan: ManuscriptPlan) {
  const out: { title: string; note: string; scenes: { title: string; blocks: Block[] }[] }[] = [];
  for (const c of plan.chapters) {
    if (!c.include) continue;
    const scenes: { title: string; blocks: Block[] }[] = [];
    for (const s of c.scenes) {
      if (!s.include) continue;
      const prev = scenes[scenes.length - 1];
      if (s.joinPrevious && prev) prev.blocks.push(...(s.startsWith === 'break' ? [{ type: 'break' } as Block] : []), ...s.blocks);
      else scenes.push({ title: s.title, blocks: [...s.blocks] });
    }
    const prevC = out[out.length - 1];
    if (c.joinPrevious && prevC) prevC.scenes.push(...scenes);
    else out.push({ title: c.title, note: c.note, scenes });
  }
  return out;
}

/** The text she should end up with, used to verify the import afterwards. */
export function expectedText(shape: ReturnType<typeof finalShape>) {
  return shape.flatMap((c) => c.scenes.map((s) => docToText(blocksToDoc(s.blocks) as never))).join('\n\n');
}
