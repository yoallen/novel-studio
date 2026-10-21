// Find and replace across her pages. Works on the scene's document itself, one text node at a time,
// so bold, italics, paragraphs and line breaks stay exactly where they were. Notes left for later,
// [[like this]], keep their brackets: a match never reaches into the brackets themselves.
// Pure functions only; the Manuscript service decides which scenes change and saves them.

import { LATER_RE } from './later.js';

export interface ReplaceOptions { find: string; replace: string; matchCase?: boolean; wholeWords?: boolean }

interface PMNode { type?: string; text?: string; content?: PMNode[]; marks?: unknown[]; attrs?: Record<string, unknown> }

/** One match in a scene: its number in the scene (in reading order) and a little of the words around it. */
export interface DocMatch { n: number; before: string; found: string; after: string }

const WORD = '[\\p{L}\\p{N}_]';

/** The search as a pattern, or null when there is nothing to look for. */
export function replacePattern(o: ReplaceOptions): RegExp | null {
  const find = cleanFind(o.find);
  if (!find) return null;
  const esc = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const body = o.wholeWords ? `(?<!${WORD})${esc}(?!${WORD})` : esc;
  return new RegExp(body, o.matchCase ? 'gu' : 'giu');
}

/** What she typed, on one line: a match never crosses a line break. */
export function cleanFind(s: string): string { return (s ?? '').replace(/[\r\n]+/g, ' '); }

interface Seg { node: PMNode | null; start: number; len: number }

/** Every run of inline content (a paragraph, a heading) with its text and where each text node sits. */
function blocks(doc: PMNode): { segs: Seg[]; text: string }[] {
  const out: { segs: Seg[]; text: string }[] = [];
  const walk = (n: PMNode) => {
    const kids = n.content ?? [];
    if (kids.some((k) => k.type === 'text' || k.type === 'hardBreak')) {
      let text = '';
      const segs: Seg[] = [];
      for (const k of kids) {
        if (k.type === 'text') { segs.push({ node: k, start: text.length, len: (k.text ?? '').length }); text += k.text ?? ''; }
        else { segs.push({ node: null, start: text.length, len: 1 }); text += k.type === 'hardBreak' ? '\n' : '￼'; }
      }
      out.push({ segs, text });
      return;
    }
    kids.forEach(walk);
  };
  walk(doc);
  return out;
}

/** Matches in one block, leaving out any that would touch the brackets of a note for later. */
function blockMatches(text: string, re: RegExp): { at: number; end: number; found: string }[] {
  const guarded: [number, number][] = [];
  for (const m of text.matchAll(LATER_RE)) {
    const a = m.index!, b = a + m[0].length;
    guarded.push([a, a + 2], [b - 2, b]);
  }
  const out: { at: number; end: number; found: string }[] = [];
  re.lastIndex = 0;
  for (const m of text.matchAll(re)) {
    if (!m[0]) continue;
    const at = m.index!, end = at + m[0].length;
    if (guarded.some(([a, b]) => at < b && end > a)) continue;
    out.push({ at, end, found: m[0] });
  }
  return out;
}

const CONTEXT = 60;
function around(text: string, at: number, end: number) {
  const flat = (s: string) => s.replace(/\n/g, ' ').replace(/￼/g, '');
  const from = Math.max(0, at - CONTEXT), to = Math.min(text.length, end + CONTEXT);
  let before = flat(text.slice(from, at)), after = flat(text.slice(end, to));
  // Start and end on whole words, so a snippet never opens on half a word.
  if (from > 0) before = '…' + before.replace(/^\S*\s/, '');
  if (to < text.length) after = after.replace(/\s\S*$/, '') + '…';
  return { before, after };
}

/** Every match in a scene's document, in reading order. */
export function findInDoc(doc: unknown, o: ReplaceOptions): DocMatch[] {
  const re = replacePattern(o);
  if (!re) return [];
  const out: DocMatch[] = [];
  for (const b of blocks(doc as PMNode)) {
    for (const m of blockMatches(b.text, re)) out.push({ n: out.length, found: m.found, ...around(b.text, m.at, m.end) });
  }
  return out;
}

/**
 * A copy of the document with the chosen matches replaced (all of them when `only` is not given).
 * Only the words inside text nodes change. A match that runs across a change of formatting takes
 * the formatting of the place where it starts.
 */
export function replaceInDoc(doc: unknown, o: ReplaceOptions, only?: Iterable<number>): { doc: unknown; count: number } {
  const copy = JSON.parse(JSON.stringify(doc)) as PMNode;
  const re = replacePattern(o);
  if (!re) return { doc: copy, count: 0 };
  const pick = only ? new Set(only) : null;
  let n = 0, count = 0;
  for (const b of blocks(copy)) {
    const chosen = blockMatches(b.text, re).filter(() => { const keep = !pick || pick.has(n); n++; return keep; });
    // Right to left, so the places of earlier matches in the block stay true.
    for (const m of chosen.reverse()) {
      let first = true;
      for (const s of b.segs) {
        if (!s.node || s.start + s.len <= m.at || s.start >= m.end) continue;
        const t = s.node.text ?? '';
        const a = Math.max(0, m.at - s.start), z = Math.min(s.len, m.end - s.start);
        s.node.text = t.slice(0, a) + (first ? o.replace : '') + t.slice(z);
        first = false;
      }
      count++;
    }
  }
  // A text node with no words left is not allowed in a document; take it out.
  const prune = (node: PMNode) => {
    if (!node.content) return;
    node.content = node.content.filter((k) => !(k.type === 'text' && !k.text));
    node.content.forEach(prune);
  };
  prune(copy);
  return { doc: copy, count };
}
