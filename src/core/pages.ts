// Manuscript pages. A page is the standard manuscript page: about 250 words, which is what 12-point type,
// double-spaced, with one-inch margins comes to. Pages run across the whole book, every chapter starts on a
// fresh page, and scenes inside a chapter flow on from one another. Pages are only ever drawn around the
// text; nothing here changes a word of it. No imports beyond notes-for-later, so the screens can use it too.
import { withoutLater, LATER_RE } from './later.js';

export const WORDS_PER_PAGE = 250;

/** The pages a chapter takes: at least one, since every chapter opens a page of its own. */
export const pagesFor = (words: number) => Math.max(1, Math.ceil(words / WORDS_PER_PAGE));

/** Pages as she reads them: to the nearest half, never a false decimal. */
export function aboutPages(words: number): string {
  if (words <= 0) return 'no pages yet';
  const halves = Math.round((words / WORDS_PER_PAGE) * 2);
  if (halves === 0) return 'under half a page';
  const whole = Math.floor(halves / 2), half = halves % 2 === 1;
  const n = whole === 0 ? '½' : `${whole.toLocaleString()}${half ? '½' : ''}`;
  return `about ${n} ${(whole === 1 && !half) || whole === 0 ? 'page' : 'pages'}`;
}

export interface OutlineChapter { id: string; scenes: { id: string; word_count: number }[] }

export interface PagePlace {
  /** Words before this scene in its own chapter. */
  offset: number;
  /** The book page this chapter opens on. */
  chapterStart: number;
  /** The book page this scene's first word sits on. */
  firstPage: number;
  sceneWords: number; chapterWords: number; novelWords: number;
  /** The last book page of the novel as it stands. */
  novelLastPage: number;
}

/** Where a scene sits in the book's pages, with this scene's live word count in place of its saved one. */
export function pagePlace(chapters: OutlineChapter[], sceneId: string, liveWords?: number): PagePlace | null {
  let start = 1, place: PagePlace | null = null, novelWords = 0, lastPage = 0;
  for (const c of chapters) {
    let offset = 0, chWords = 0, mine: { offset: number; words: number } | null = null;
    for (const s of c.scenes) {
      const w = s.id === sceneId && liveWords != null ? liveWords : s.word_count;
      if (s.id === sceneId) mine = { offset: chWords, words: w };
      chWords += w;
    }
    if (mine) { offset = mine.offset; place = { offset, chapterStart: start, firstPage: start + Math.floor(offset / WORDS_PER_PAGE), sceneWords: mine.words, chapterWords: chWords, novelWords: 0, novelLastPage: 0 }; }
    novelWords += chWords;
    lastPage = start + pagesFor(chWords) - 1;
    start += pagesFor(chWords);
  }
  if (place) { place.novelWords = novelWords; place.novelLastPage = lastPage; }
  return place;
}

/** The three-level line under a scene. */
export function pageLine(p: PagePlace): string {
  const w = (n: number) => `${n.toLocaleString()} ${n === 1 ? 'word' : 'words'}`;
  return `Scene: ${w(p.sceneWords)}, ${aboutPages(p.sceneWords)}. Chapter: ${w(p.chapterWords)}, ${aboutPages(p.chapterWords)}. Novel: ${w(p.novelWords)}, ${aboutPages(p.novelWords)}.`;
}

const WORD_RE = /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu;

/**
 * Where the pages turn inside one block of text: the character offset of each word that begins a new page.
 * `before` is the count of story words ahead of this block in the chapter. Words inside notes for later
 * never count, exactly as the word count leaves them out.
 */
export function turnsIn(text: string, before: number): { at: number; page: number; count: number }[] {
  const notes: [number, number][] = [];
  for (const m of text.matchAll(LATER_RE)) notes.push([m.index!, m.index! + m[0].length]);
  const out: { at: number; page: number; count: number }[] = [];
  let n = before;
  for (const m of text.matchAll(WORD_RE)) {
    const at = m.index!;
    if (notes.some(([a, b]) => at >= a && at < b)) continue;
    if (n > 0 && n % WORDS_PER_PAGE === 0) out.push({ at, page: n / WORDS_PER_PAGE, count: n });
    n++;
  }
  return out;
}

/** Story words in a block, counted the same way as the word count. */
export const wordsIn = (text: string) => (withoutLater(text).match(WORD_RE) ?? []).length;
