import { describe, it, expect } from 'vitest';
import { aboutPages, pagePlace, pageLine, turnsIn, wordsIn, pagesFor } from '../src/core/pages.js';
import { countWords } from '../src/core/manuscript.js';

const w = (n: number, from = 0) => Array.from({ length: n }, (_, i) => `w${from + i}`).join(' ');

describe('manuscript pages', () => {
  it('reads pages to the nearest half, in words', () => {
    expect(aboutPages(0)).toBe('no pages yet');
    expect(aboutPages(60)).toBe('under half a page');
    expect(aboutPages(125)).toBe('about ½ page');
    expect(aboutPages(250)).toBe('about 1 page');
    expect(aboutPages(607)).toBe('about 2½ pages');
    expect(aboutPages(1733)).toBe('about 7 pages');
    expect(aboutPages(3620)).toBe('about 14½ pages');
  });

  it('pages run across the book, every chapter opens a page, scenes flow inside a chapter', () => {
    const chapters = [
      { id: 'c1', scenes: [{ id: 's1', word_count: 600 }, { id: 's2', word_count: 100 }] },
      { id: 'c2', scenes: [{ id: 's3', word_count: 300 }] },
    ];
    expect(pagePlace(chapters, 's1')).toMatchObject({ offset: 0, chapterStart: 1, firstPage: 1, chapterWords: 700, novelWords: 1000 });
    // s2 begins 600 words into the chapter: on page 3, mid-page.
    expect(pagePlace(chapters, 's2')).toMatchObject({ offset: 600, chapterStart: 1, firstPage: 3 });
    // Chapter 1 takes 3 pages (700 words), so Chapter 2 opens on page 4.
    expect(pagePlace(chapters, 's3')).toMatchObject({ offset: 0, chapterStart: 4, firstPage: 4, novelLastPage: 5 });
    // The live count stands in for the saved one.
    expect(pagePlace(chapters, 's1', 900)!.chapterStart).toBe(1);
    expect(pagePlace(chapters, 's3', 900)).toBeTruthy();
    expect(pagePlace(chapters, 'nope')).toBeNull();
    expect(pagesFor(0)).toBe(1);
    expect(pageLine(pagePlace(chapters, 's3')!)).toBe('Scene: 300 words, about 1 page. Chapter: 300 words, about 1 page. Novel: 1,000 words, about 4 pages.');
  });

  it('the page turns before the 251st word, counted exactly as the word count counts, notes for later left out', () => {
    expect(turnsIn(w(600), 0).map((t) => t.page)).toEqual([1, 2]);
    const text = w(600);
    expect(text.slice(turnsIn(text, 0)[0]!.at).startsWith('w250 ')).toBe(true);
    // 100 words already in the chapter: the first turn comes 150 words into this block.
    expect(text.slice(turnsIn(text, 100)[0]!.at).startsWith('w150 ')).toBe(true);
    const noted = `${w(249)} [[check her mother's name and the town]] don't stop-here now`;
    const t = turnsIn(noted, 0);
    expect(noted.slice(t[0]!.at).startsWith('stop-here')).toBe(true);
    expect(wordsIn(noted)).toBe(countWords(noted));
  });
});
