import { describe, it, expect } from 'vitest';
import { GENRES, CHARACTERISTICS } from '../src/core/catalog.js';

// Every choice on the setup page explains itself to a writer who has never seen the term.
describe('every setup choice has a plain description', () => {
  it('each genre and each narrative characteristic has one, with no em dashes', () => {
    for (const g of GENRES) expect(g.about, g.key).toBeTruthy();
    for (const c of CHARACTERISTICS) expect(c.about, c.key).toBeTruthy();
    for (const x of [...GENRES, ...CHARACTERISTICS]) expect(x.about).not.toMatch(/—/);
  });
  it('no choice is named in one writer\'s private shorthand', () => {
    expect(CHARACTERISTICS.find((c) => c.key === 'chapter_titles')!.name).toBe('Titled chapters');
  });
});
