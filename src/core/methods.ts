// Her own methods and her craft shelf, kept at the author level so every novel can use them (R-A-109, R-B-093).
// A method of her own can be as deep as a built-in one: its own beats with placement, the moments they share
// with other beat sheets, its own fields on any kind of record, and its own questions.

import { Store, Row, ValidationError, NotFoundError } from './store.js';
import { StructBeat, OTHER_STRUCTURES, STRUCTURE_NAMES } from './structures.js';

export interface MethodField { kind: string; label: string; prompt?: string }
export interface Method {
  key: string;
  name: string;
  job: string;                 // what this method does for her
  source: string;              // teacher or book it comes from
  beats: StructBeat[];         // empty: a lens or habit with no beat sheet
  questions: string[];         // questions it asks of a story
  fields: MethodField[];       // fields it adds, grouped under the method's name
}
export interface ShelfBook { key: string; title: string; author: string; useFor: string }

export const DEFAULT_SHELF: Omit<ShelfBook, 'key'>[] = [
  { title: 'Save the Cat! Writes a Novel', author: 'Jessica Brody', useFor: 'Beats placed by percentage for novels' },
  { title: 'Save the Cat!', author: 'Blake Snyder', useFor: 'The fifteen beats, the board, story types' },
  { title: 'Story', author: 'Robert McKee', useFor: 'Controlling idea, the gap, forces of antagonism, the value scale' },
  { title: 'Creating Character Arcs', author: 'K. M. Weiland', useFor: 'The Lie, the Ghost, Want and Need, arc types' },
  { title: 'How to Write a Novel Using the Snowflake Method', author: 'Randy Ingermanson', useFor: 'Growing the novel outward; values, ambition, goal' },
  { title: 'Techniques of the Selling Writer', author: 'Dwight V. Swain', useFor: 'Scene and sequel' },
  { title: 'The Anatomy of Story', author: 'John Truby', useFor: 'Moral argument, the web of characters' },
  { title: 'The Hidden Tools of Comedy', author: 'Steve Kaplan', useFor: 'Comic premise, the non-hero' },
  { title: 'The Moral Premise', author: 'Stanley D. Williams', useFor: 'Vice and virtue as the story\'s equation' },
  { title: 'The Emotion Thesaurus', author: 'Angela Ackerman and Becca Puglisi', useFor: 'Emotion shown through the body, the senses and the mind' },
  { title: 'The Emotional Wound Thesaurus', author: 'Angela Ackerman and Becca Puglisi', useFor: 'Wounds, the false beliefs they create, and the behavior that follows' },
  { title: 'The Positive Trait Thesaurus', author: 'Angela Ackerman and Becca Puglisi', useFor: 'Strengths, where they come from, and how they show' },
  { title: 'The Negative Trait Thesaurus', author: 'Angela Ackerman and Becca Puglisi', useFor: 'Flaws, what they protect, and what they cost' },
  { title: 'The Urban Setting Thesaurus', author: 'Angela Ackerman and Becca Puglisi', useFor: 'Places in town, through all five senses' },
  { title: 'The Rural Setting Thesaurus', author: 'Angela Ackerman and Becca Puglisi', useFor: 'Places in the country, through all five senses' },
  { title: 'The Occupation Thesaurus', author: 'Angela Ackerman and Becca Puglisi', useFor: 'Jobs as a window into character' },
  { title: 'The Conflict Thesaurus', author: 'Angela Ackerman and Becca Puglisi', useFor: 'Obstacles and complications, in two volumes' },
];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40) || 'item';
const ACTS = ['I', 'IIA', 'IIB', 'III'] as const;
export const MOMENTS: { key: string; label: string }[] = [
  { key: 'opening', label: 'The opening (Opening Image, Ordinary World)' },
  { key: 'inciting', label: 'The inciting event (Catalyst, Call to Adventure)' },
  { key: 'debate', label: 'The hesitation (Debate, Refusal)' },
  { key: 'threshold', label: 'Into Act Two (Break into Two, First Threshold, Plot Point 1)' },
  { key: 'fun', label: 'The new world (Fun and Games, Tests and Allies)' },
  { key: 'midpoint', label: 'The midpoint (Midpoint, Ordeal, Find)' },
  { key: 'lowest', label: 'The lowest point (All Is Lost, Pinch 2, Take)' },
  { key: 'third', label: 'Into Act Three (Break into Three, Road Back, Plot Turn 2)' },
  { key: 'climax', label: 'The climax (Finale, Resurrection)' },
  { key: 'ending', label: 'The ending (Final Image, Return with the Elixir)' },
];

function readProfile(store: Store): Record<string, unknown> {
  const r = store.db.prepare("SELECT value_json FROM settings WHERE key='author_profile'").get() as Row | undefined;
  return r ? JSON.parse(r.value_json as string) as Record<string, unknown> : {};
}
function writeProfile(store: Store, next: Record<string, unknown>) {
  store.db.prepare("INSERT INTO settings(key,value_json) VALUES ('author_profile',?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json").run(JSON.stringify(next));
}

export function methods(store: Store): Method[] { return (readProfile(store).methods as Method[] | undefined) ?? []; }

/** Beat sheets from her methods, merged with the built-in ones, for lookups. */
export function structureRegistry(store: Store): { beats: Record<string, StructBeat[]>; names: Record<string, string> } {
  const mine = methods(store).filter((m) => m.beats.length);
  return {
    beats: { ...OTHER_STRUCTURES, ...Object.fromEntries(mine.map((m) => [m.key, m.beats])) },
    names: { ...STRUCTURE_NAMES, ...Object.fromEntries(mine.map((m) => [m.key, m.name])) },
  };
}

/** Check and tidy a method before saving it. */
export function cleanMethod(input: Partial<Method> & { name: string }, existing?: Method): Method {
  const name = input.name.trim().slice(0, 80);
  if (!name) throw new ValidationError('Give the method a name.');
  const key = existing?.key ?? input.key ?? `method_${slug(name)}`;
  const beats = (input.beats ?? []).map((b, i) => {
    const bname = String(b.name ?? '').trim().slice(0, 80);
    if (!bname) throw new ValidationError(`Beat ${i + 1} needs a name.`);
    const at: [number, number] = [Number(b.at?.[0]), Number(b.at?.[1] ?? b.at?.[0])];
    if (!at.every((x) => Number.isFinite(x) && x >= 0 && x <= 1)) throw new ValidationError(`"${bname}" needs a place in the book between 0% and 100%.`);
    if (at[1] < at[0]) throw new ValidationError(`"${bname}" ends before it starts.`);
    const act = (ACTS as readonly string[]).includes(b.act as string) ? b.act : at[0] < 0.2 ? 'I' : at[0] < 0.5 ? 'IIA' : at[0] < 0.75 ? 'IIB' : 'III';
    return {
      key: b.key && /^[a-z0-9_]{1,40}$/.test(b.key) ? b.key : `${slug(bname)}`, number: i + 1, name: bname, act, kind: at[0] === at[1] ? 'point' : 'span',
      at, description: String(b.description ?? '').slice(0, 4000), ...(b.test ? { test: String(b.test).slice(0, 1000) } : {}), ...(b.moment && MOMENTS.some((m) => m.key === b.moment) ? { moment: b.moment } : {}),
    } as StructBeat;
  });
  const keys = new Set<string>();
  for (const b of beats) { while (keys.has(b.key)) b.key = `${b.key}_2`; keys.add(b.key); }
  return {
    key, name, job: String(input.job ?? '').slice(0, 2000), source: String(input.source ?? '').slice(0, 300), beats,
    questions: (input.questions ?? []).map((q) => String(q).trim().slice(0, 500)).filter(Boolean),
    fields: (input.fields ?? []).map((f) => ({ kind: String(f.kind), label: String(f.label ?? '').trim().slice(0, 80), prompt: f.prompt ? String(f.prompt).slice(0, 500) : undefined })).filter((f) => f.label && f.kind),
  };
}

export function saveMethod(store: Store, input: Partial<Method> & { name: string }) {
  const p = readProfile(store);
  const list = (p.methods as Method[] | undefined) ?? [];
  const existing = input.key ? list.find((m) => m.key === input.key) : undefined;
  if (input.key && !existing && !input.key.startsWith('method_')) throw new NotFoundError('method');
  const m = cleanMethod(input, existing);
  if (!existing && list.some((x) => x.key === m.key)) m.key = `${m.key}_${list.length + 1}`;
  writeProfile(store, { ...p, methods: existing ? list.map((x) => (x.key === m.key ? m : x)) : [...list, m] });
  return m;
}

export function removeMethod(store: Store, key: string) {
  const p = readProfile(store);
  writeProfile(store, { ...p, methods: ((p.methods as Method[] | undefined) ?? []).filter((m) => m.key !== key) });
}

/** Start a method of her own from a built-in beat sheet, to adapt it. */
export function startFrom(key: string): Partial<Method> {
  const src = OTHER_STRUCTURES[key];
  if (!src) return { beats: [] };
  return { beats: src.map((b) => ({ ...b })), source: STRUCTURE_NAMES[key] ?? '' };
}

// ---------- her craft shelf ----------

export function shelf(store: Store): ShelfBook[] {
  const v = readProfile(store).shelf as ShelfBook[] | undefined;
  return v ?? DEFAULT_SHELF.map((b) => ({ ...b, key: slug(`${b.author}_${b.title}`) }));
}

export function setShelf(store: Store, books: Omit<ShelfBook, 'key'>[] & { key?: string }[]) {
  const clean = (books as (Omit<ShelfBook, 'key'> & { key?: string })[]).map((b) => {
    const title = String(b.title ?? '').trim().slice(0, 200);
    if (!title) throw new ValidationError('Each book needs a title.');
    return { key: b.key || slug(`${b.author ?? ''}_${title}`), title, author: String(b.author ?? '').trim().slice(0, 120), useFor: String(b.useFor ?? '').trim().slice(0, 500) };
  });
  writeProfile(store, { ...readProfile(store), shelf: clean });
  return clean;
}
