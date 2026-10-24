// The pen drawings' geometry, kept free of the page so it can be tested: a hand-steady stroke, the
// books on a shelf, and how many pages a manuscript is.

/** A small, steady tremor from a seed: the same drawing always comes out the same. */
export function rng(seedText: string) {
  let s = 7; for (const ch of seedText) s = (s * 31 + ch.charCodeAt(0)) % 233280;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

/** A pen stroke through the points, each nudged a hair, as a path. */
export function stroke(points: [number, number][], r: () => number, close = false) {
  const j = () => (r() - 0.5) * 0.7;
  return 'M' + points.map(([x, y]) => `${(x + j()).toFixed(1)} ${(y + j()).toFixed(1)}`).join(' L') + (close ? ' Z' : '');
}

export type ShelfDay = { day: string; words: number; met: boolean; rest: boolean; today: boolean; future: boolean };
export type ShelfItem =
  | { kind: 'book'; day: string; x: number; w: number; h: number; ink: boolean; lean: number; today: boolean }
  | { kind: 'chair'; day: string; x: number };

export const CHAIR_W = 34;

/**
 * Lay out a push's days on a shelf. A book is as thick as the day's words (a big day is a fat book); its
 * height just varies a little, the way real books do. A day with no words has no book. A rest day she set is
 * a chair. Books get slimmer, all together, until the push fits the shelf.
 */
export function layoutShelf(days: ShelfDay[], width: number, seed: string, leans = true) {
  const top = Math.max(3200, ...days.map((d) => d.words));
  for (let maxW = 26; ; maxW -= 2) {
    const r = rng(seed);
    const minW = Math.max(4, Math.min(6, maxW / 3));
    const items: ShelfItem[] = [];
    let x = 0;
    for (const d of days) {
      if (d.future) continue;
      if (d.rest && d.words <= 0) { items.push({ kind: 'chair', day: d.day, x }); x += CHAIR_W + 4; continue; }
      if (d.words <= 0) continue;
      const w = minW + Math.min(1, d.words / top) * (maxW - minW);
      const h = 72 + (r() - 0.5) * 16;
      const lean = leans && !d.today && r() < 0.08 ? 4 + r() * 3 : 0;
      items.push({ kind: 'book', day: d.day, x, w, h, ink: d.met, lean, today: d.today });
      x += w + 2.5 + (lean ? 9 : 0);
    }
    if (x <= width || maxW <= 8) return { items, end: x };
  }
}

/** Pages in a manuscript at a number of words to the page. */
export const pagesOf = (words: number, perPage = 250) => Math.max(0, Math.round(words / perPage));

const fmt = (x: number) => x.toLocaleString('en-US');

/** A push as the bookcase sees it. */
export type PushShelf = { name: string; start: string; end: string; goal: number | null; total: number; done: boolean; current: boolean; dayNo: number; daysTotal: number };

/** A push is over when its last day has passed, or when a new push took its place. */
export const pushEnded = (p: PushShelf) => p.done || !p.current;

/**
 * What a push came to, in plain words: how many it wrote and whether it reached its goal. A running push
 * adds the day it is on; a finished one says only what it came to. Never "57,309 of 30".
 */
export function pushSaid(p: PushShelf): string {
  const t = Math.max(0, p.total), g = p.goal;
  if (!pushEnded(p)) {
    const amount = g ? (t >= g ? `${fmt(t)} words, goal of ${fmt(g)} met` : `${fmt(t)} of ${fmt(g)} words`) : `${fmt(t)} words`;
    return `${amount}, day ${p.dayNo} of ${p.daysTotal}`;
  }
  if (!g) return `${fmt(t)} word${t === 1 ? '' : 's'}.`;
  if (t > g) return `${fmt(t)} words. Goal of ${fmt(g)} met, ${fmt(t - g)} extra.`;
  if (t === g) return `${fmt(t)} words. Goal met.`;
  return `${fmt(t)} of ${fmt(g)} words.`;
}

/** Did a push reach its goal (or, with no goal, write anything)? Ink if so, pencil if not. */
export const pushMet = (p: PushShelf) => (p.goal ? p.total >= p.goal : p.total > 0);

export type PushBook = { key: string; p: PushShelf; x: number; w: number; h: number; size: number; row: number; ink: boolean };

/**
 * Finished pushes as single books on shared shelves, in the order they were written, oldest first. A book is
 * as thick as the push's words (a small test push slim, a November fat), tall enough for its name down the
 * spine, and a new shelf starts when one is full.
 */
export function layoutPushBooks(pushes: PushShelf[], width: number): { books: PushBook[]; rows: number; ends: number[] } {
  const books: PushBook[] = [];
  const ends: number[] = [];
  let x = 0, row = 0;
  for (const p of pushes) {
    const w = Math.round(Math.max(28, Math.min(62, 24 + Math.sqrt(Math.max(0, p.total)) / 6)));
    const size = Math.min(22, Math.max(15, w * 0.6));
    // The name runs down the spine in the pen hand: roughly 0.27 of the size to a letter.
    const nameLen = [...p.name].reduce((a, ch) => a + (ch === ' ' ? 0.15 : /[A-Z]/.test(ch) ? 0.37 : /[mwMW]/.test(ch) ? 0.4 : 0.27), 0) * size;
    const r = rng(`${p.start}|${p.name}`);
    const h = Math.round(Math.min(178, Math.max(112, nameLen + 34 + r() * 14)));
    // A very long name gets a smaller hand rather than running off the spine.
    const fit = nameLen > h - 30 ? size * (h - 30) / nameLen : size;
    if (x > 0 && x + w > width) { ends.push(x); x = 0; row++; }
    books.push({ key: `${p.start}|${p.name}`, p, x, w, h, size: fit, row, ink: pushMet(p) });
    x += w + 4;
  }
  ends.push(x);
  return { books, rows: row + 1, ends };
}
