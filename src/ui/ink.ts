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
