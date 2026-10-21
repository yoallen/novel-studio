import { describe, expect, it } from 'vitest';
import { pagesFor, SPECIAL } from '../src/ui/recordPages';

describe('record pages', () => {
  const all = () => true;
  it('a character keeps every field, grouped into numbered pages', () => {
    const groups = ['Role in the story', 'Identity', 'Personality', 'Depth lenses', 'Writing aids (private)', 'My fields'];
    const pages = pagesFor('character', groups, (i) => i.startsWith('@') || groups.includes(i), 'Character');
    const placed = pages.flatMap((p) => p.items).filter((i) => !i.startsWith('@'));
    expect(new Set(placed)).toEqual(new Set(groups));
    expect(pages[0]!.title).toBe('Who they are');
    expect(pages.some((p) => p.items.includes(SPECIAL.arcs))).toBe(true);
  });
  it('a group no page names is never lost: it lands on the last page', () => {
    const pages = pagesFor('beat', ['In this book', 'From my planning'], (i) => i.startsWith('@') || i === 'In this book', 'Beat');
    expect(pages.at(-1)!.items).toContain('From my planning');
  });
  it('a short kind is one page plus notes and connections', () => {
    const pages = pagesFor('arc', ['Arc', 'Weiland Arc'], all, 'Arc');
    expect(pages.map((p) => p.title)).toEqual(['The arc', 'Notes and connections']);
  });
});
