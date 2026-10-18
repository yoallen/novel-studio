// Revision lenses that run on the page itself, with no AI and nothing sent anywhere.
// They point; they never change a word. Every finding is a place to look, not a rule.

export interface Token { word: string; key: string; start: number; end: number }

const STOP = new Set(('a an and are as at be been but by can could did do does for from had has have he her hers him his how i if in into is it its just me my no not of on or our out she so than that the their them then there these they this those to up us was we were what when where which who will with would you your said says say asked'.split(' ')));

/** Words as writers count them, with where each one sits in the text. */
export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  const re = /[\p{L}\p{N}]+(?:['’][\p{L}]+)*/gu;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push({ word: m[0], key: stem(m[0].toLowerCase().replace(/’/g, "'")), start: m.index, end: m.index + m[0].length });
  return out;
}

/** A light stem so "walked", "walking" and "walks" count as one echo. */
export function stem(w: string) {
  if (w.length <= 4) return w;
  return w.replace(/'s$/, '').replace(/(ies)$/, 'y').replace(/(ing|ed|ly|es|s)$/, '') || w;
}

export interface Echo { key: string; words: string[]; count: number; ranges: [number, number][] }

/** The same word (or its family) used again within a short stretch. Common small words are ignored. */
export function echoes(text: string, opts: { window?: number; minLength?: number; ignore?: string[] } = {}): Echo[] {
  const win = opts.window ?? 120, minLen = opts.minLength ?? 4;
  const ignore = new Set((opts.ignore ?? []).map((w) => stem(w.toLowerCase())));
  const toks = tokenize(text);
  const groups = new Map<string, Set<number>>();
  const last = new Map<string, number>();
  toks.forEach((t, i) => {
    if (t.word.length < minLen || STOP.has(t.word.toLowerCase()) || ignore.has(t.key) || /^\d+$/.test(t.word)) return;
    const prev = last.get(t.key);
    if (prev !== undefined && i - prev <= win) {
      const g = groups.get(t.key) ?? new Set<number>();
      g.add(prev); g.add(i); groups.set(t.key, g);
    }
    last.set(t.key, i);
  });
  return [...groups.entries()].map(([key, idx]) => {
    const ids = [...idx].sort((a, b) => a - b);
    return { key, words: [...new Set(ids.map((i) => toks[i]!.word.toLowerCase()))], count: ids.length, ranges: ids.map((i) => [toks[i]!.start, toks[i]!.end] as [number, number]) };
  }).sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

export const DEFAULT_WATCH_WORDS = ['just', 'really', 'very', 'actually', 'suddenly', 'started to', 'began to', 'seemed', 'somehow', 'literally', 'basically', 'a little', 'kind of', 'sort of', 'felt', 'realized', 'noticed', 'thought'];

/** Her own watch list: how often each word or phrase appears, and where. */
export function watch(text: string, list: string[]) {
  const out: { phrase: string; count: number; ranges: [number, number][] }[] = [];
  for (const phrase of list) {
    const p = phrase.trim();
    if (!p) continue;
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}(?![\\p{L}\\p{N}])`, 'giu');
    const ranges: [number, number][] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) ranges.push([m.index, m.index + m[0].length]);
    if (ranges.length) out.push({ phrase: p, count: ranges.length, ranges });
  }
  return out.sort((a, b) => b.count - a.count);
}

/** Sentences long enough that a reader may lose the thread. Dialogue and lists are often fine; she decides. */
export function longSentences(text: string, over = 40) {
  const out: { words: number; range: [number, number]; preview: string }[] = [];
  const re = /[^.!?…\n]+(?:[.!?…]+["”’)]*|\n|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (!m[0].trim()) { if (re.lastIndex === m.index) re.lastIndex++; continue; }
    const n = tokenize(m[0]).length;
    if (n > over) out.push({ words: n, range: [m.index, m.index + m[0].length], preview: m[0].trim().slice(0, 90) });
    if (re.lastIndex === m.index) re.lastIndex++;
  }
  return out;
}

/** Damerau-Levenshtein distance, for spotting a name spelled two ways. */
export function distance(a: string, b: string) {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0]![j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i]![j] = Math.min(d[i]![j]!, d[i - 2]![j - 2]! + 1);
  }
  return d[a.length]![b.length]!;
}

const COMMON_CAPS = new Set(('I The A An And But Or So Then When While If He She It They We You His Her Its Their Our My Your This That These Those There Here What Who Why How Where Yes No Not Oh Well Okay OK Mr Mrs Ms Miss Dr Saint St Monday Tuesday Wednesday Thursday Friday Saturday Sunday January February March April May June July August September October November December God Lord Chapter Part One Two Three Four Five Six Seven Eight Nine Ten Maybe Even Just Still After Before Now Later Once Every Each All Some Most Then Than Because Also Instead Meanwhile Again Anyway Hey Hi Hello Please Thank Thanks Sorry Look Wait Yeah Nope Sure Right Good Great'.split(' ')));

/** Capitalized words in mid-sentence, counted: the names a book actually uses. Sentence starts count once a word is known as a name. */
/** Capitalized names in the text. A word that only ever starts a sentence counts when it is one of the `known` names
 *  (from her records), since "Kevin said" at a sentence start is a name, while "Then" or "Maybe" is not. */
export function namesIn(text: string, known?: Set<string>) {
  const toks = tokenize(text);
  const mid = new Map<string, number>(), initial = new Map<string, number>();
  toks.forEach((t, i) => {
    if (!/^[A-Z][\p{Ll}]/u.test(t.word)) return;
    const w = t.word.replace(/['’]s$/, '');
    if (w.length < 3 || COMMON_CAPS.has(w)) return;
    const prev = toks[i - 1];
    const between = prev ? text.slice(prev.end, t.start) : '\n';
    const afterTitle = prev && /^(Mr|Mrs|Ms|Dr|St|Miss|Mx|Prof|Rev)$/.test(prev.word);
    const starts = !afterTitle && (!prev || /[.!?…]["”’)]*\s*$|\n|["“]\s*$|:\s*$/.test(between));
    const m = starts ? initial : mid;
    m.set(w, (m.get(w) ?? 0) + 1);
  });
  const counts = new Map<string, number>();
  for (const [w, n] of mid) counts.set(w, n + (initial.get(w) ?? 0));
  if (known) for (const [w, n] of initial) if (!mid.has(w) && known.has(w)) counts.set(w, n);
  return counts;
}

/** Names that look like another name spelled differently ("Fingleberger" beside "Fingleburger"). */
export function nameVariants(used: Map<string, number>, known: string[]) {
  const out: { name: string; count: number; likely: string; knownName: boolean }[] = [];
  const names = [...used.keys()].filter((n) => !n.includes(' '));
  const knownParts = new Set(known.flatMap((k) => k.split(/\s+/)).filter((w) => w.length >= 3 && /^[A-Z]/.test(w)));
  const pool = [...new Set([...knownParts, ...names.filter((n) => (used.get(n) ?? 0) >= 2)])];
  for (const n of names) {
    if (knownParts.has(n)) continue;
    const cands = pool.filter((p) => p !== n && Math.abs(p.length - n.length) <= 2 && p[0] === n[0]);
    let best: string | null = null, bestD = 99;
    for (const c of cands) { const dd = distance(n.toLowerCase(), c.toLowerCase()); if (dd < bestD) { bestD = dd; best = c; } }
    const limit = n.length >= 8 ? 2 : 1;
    if (best && bestD <= limit && (knownParts.has(best) || (used.get(best) ?? 0) > (used.get(n) ?? 0))) out.push({ name: n, count: used.get(n) ?? 0, likely: best, knownName: knownParts.has(best) });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}
