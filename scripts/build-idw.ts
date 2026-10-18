// Builds the I Declare War starting archive from her real planning material.
//
// Primary source: docs/requirements/IDW-story-data.md, the consolidated story data register.
// Every row becomes records with the status the register gives it, and every statement keeps
// its provenance: the register row (word for word) and, where the row cites the planning
// conversation, the turn it came from. The Story Bible, both archives and the conversation
// itself come in as sources so every passage can be searched and read.
//
// Run: npx tsx scripts/build-idw.ts   (writes seed/I Declare War.storycanon.json)

import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildApp } from '../src/server/app.js';
import { exportArchive } from '../src/core/backup.js';
import type { Status } from '../src/core/brain.js';
import { exportHeaders } from '../src/core/conversations.js';

const ROOT = new URL('..', import.meta.url).pathname;
const SRC = join(ROOT, 'seed/idw/sources');
const REGISTER = join(ROOT, 'docs/requirements/IDW-story-data.md');
const OUT = join(ROOT, 'seed/I Declare War.storycanon.json');
const REGISTER_NAME = 'I Declare War story data register';

type Row = Record<string, string>;
interface Table { section: string; sub: string; head: string[]; rows: Row[] }

// ---------- reading the register ----------
export function readRegister(md: string): Table[] {
  const tables: Table[] = [];
  let section = '', sub = '', cur: Table | null = null;
  const cells = (l: string) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  for (const line of md.split('\n')) {
    const h = line.match(/^(#{2,4})\s+(.*)$/);
    if (h) { if (h[1] === '##') { section = h[2]!; sub = ''; } else sub = h[2]!; cur = null; continue; }
    if (!line.startsWith('|')) { cur = null; continue; }
    const c = cells(line);
    if (c[0] === 'ID') { cur = { section, sub, head: c, rows: [] }; tables.push(cur); continue; }
    if (!cur || /^-+$/.test(c[0]!.replace(/:/g, ''))) continue;
    const row: Row = {};
    cur.head.forEach((k, i) => { row[k] = c[i] ?? ''; });
    cur.rows.push(row);
  }
  return tables;
}

const STATUS_WORDS: [RegExp, Status][] = [
  [/^established/i, 'established'], [/^developing/i, 'developing'], [/^unanswered/i, 'unanswered'],
  [/^illustrative/i, 'illustrative'], [/^proposed/i, 'proposed'], [/^set aside/i, 'set_aside'],
];
/** A compound status ("Established (the pairing); Proposed (as a label)") takes its first word; the note keeps the rest. */
export function statusOf(cell: string): Status {
  const t = cell.replace(/^\*+/, '').trim();
  for (const [re, s] of STATUS_WORDS) if (re.test(t)) return s;
  return 'developing';
}
const clean = (s: string) => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const short = (s: string, n = 80) => { const t = clean(s).replace(/^"|"$/g, ''); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };

async function main() {
  const dir = mkdtempSync(join(tmpdir(), 'idw-'));
  const { services: S } = await buildApp({ dataPath: join(dir, 'idw.db'), backupDir: join(dir, 'b'), token: 'x'.repeat(32), port: 1, autoBackupMs: 0 });
  const { store, brain, convs, structure, setup, books, importer, continuity } = S;

  // ---------- the novel and its setup ----------
  const project = setup.createNovel('I Declare War', { useDefaults: false });
  const pid = project.id as string;
  brain.updateSettings(pid, { authorName: 'Yolanda Allen', wordsPerPage: [250, 300] });
  // Her four lenses and the Moral Premise, each in her own Bible's words. Genres and story types stay
  // unset: the register marks those classifications as proposals she never confirmed (PT-004, PT-005).
  setup.update(pid, {
    frameworks: ['save_the_cat', 'mckee', 'weiland', 'snowflake', 'swain', 'moral_premise'],
    spine: 'save_the_cat',
    characteristics: ['first_person', 'multiple_pov', 'dual_protagonist', 'hidden_truth', 'comic_tone', 'warm_tone'],
    frameworkNotes: {
      save_the_cat: "The spine. The fifteen beats in order, and the board that expands them into scenes. This is the skeleton the whole book hangs on. For a novel I use Jessica Brody's adaptation, which places the beats by percentage of the manuscript instead of by script page.",
      mckee: 'The depth. The controlling idea, the gap between expectation and result, the forces of antagonism, and the value scale. McKee tells me what is really at stake underneath the plot, and reminds me that a story is only as strong as its forces of antagonism, strength, not villainy.',
      weiland: 'The arc. The Lie the character believes, the Ghost that caused it, the Want (external, tied to the Lie) versus the Need (the Truth), and the three arc types: Positive Change, Flat, and Negative. Weiland tells me how the inside of a character changes in step with the outside, beat by beat.',
      snowflake: 'The build and the interior. The ten steps that grow a novel from one sentence outward, which give this bible its expanding shape. Plus his character work: Values (found by finishing "Nothing is more important than"), Ambition (the abstract want), and Goal (the concrete want).',
      swain: "Ingermanson's scene engine, drawn from Dwight Swain: the Proactive Scene (Goal, Conflict, Disaster) and the Reactive Scene, or Sequel (Reaction, Dilemma, Decision), which loops when the decision becomes the next scene's goal.",
      moral_premise: "Underneath all four. The story's thematic truth written as an equation, which is the same thing McKee calls the controlling idea and Weiland calls the Lie versus the Truth. It is the spine that ties every lens together.",
    },
  });
  books.setStage(pid, 'Plotting and planning');
  const world = continuity.storyWorld(pid, true)!.id as string;

  // ---------- sources: the conversation, the Bible, the archives ----------
  const transcriptRaw = readFileSync(join(SRC, 'Story_Map_Planning_FULL.md'), 'utf8');
  const conv = convs.importText(pid, { title: 'Story Map Planning (the full planning conversation)', text: transcriptRaw, authorName: 'Yolanda' });
  if (!conv.complete) throw new Error('The planning conversation did not come in whole: ' + JSON.stringify({ ...conv, conversation: undefined }));
  convs.importText(pid, { title: 'Story Map Planning: edited and regenerated versions', text: readFileSync(join(SRC, 'Story_Map_Planning_edited_versions.md'), 'utf8'), authorName: 'Yolanda' });
  // Transcript line numbers ("T L####") point at turns: a line belongs to the turn whose header is at or above it.
  // The same header pattern the conversation reader uses, so line numbers and turns line up exactly.
  const norm = transcriptRaw.replace(/\r\n?/g, '\n');
  const lineAt = (ix: number) => norm.slice(0, ix).split('\n').length;
  const headerLines = exportHeaders(norm).map((m) => lineAt(m.index!));
  if (headerLines.length !== conv.turnsStored) throw new Error(`Turn count mismatch: ${headerLines.length} headers, ${conv.turnsStored} turns.`);
  const turnRows = store.db.prepare('SELECT id, position, said_at FROM turns WHERE conversation_id=? ORDER BY position').all(conv.conversation.id) as { id: string; position: number; said_at: string }[];
  const turnAt = (line: number) => { let k = -1; for (let i = 0; i < headerLines.length && headerLines[i]! <= line; i++) k = i; return k >= 0 ? turnRows[k]! : null; };

  for (const [name, kind] of [['I_Declare_War_Story_Bible_v5_10-13-26.docx', 'story_bible'], ['I_Declare_War_Character_Breakthrough_Archive_2026-10-14.docx', 'archive'], ['I_Declare_War_Character_Breakthrough_Archive_2026-10-15.docx', 'archive']] as const) {
    // Every passage is kept and searchable. Nothing is applied: the register below already weighs them.
    const r = await importer.startDocument(pid, { name, data: readFileSync(join(SRC, name)), kind });
    importer.discard(r.id);
  }

  const register = brain.addSource(pid, { kind: 'document', name: REGISTER_NAME, madeAt: '2026-10-16T12:00:00.000Z', notes: 'Every fact from the Story Bible, both Character Breakthrough Archives and the planning conversation, weighed and given a status. Her own words carry the most weight; a later archive or proposal never overrides her decision.' });
  const regId = register.id as string;

  // ---------- statements with provenance ----------
  const dateOf = (sources: string) => {
    // Prefer the citation of her own words; otherwise the first place in the conversation the row cites.
    const t = sources.match(/T L(\d+)[^;)]*?her words/) ?? sources.match(/T L(\d+)/);
    const turn = t ? turnAt(Number(t[1])) : null;
    if (turn?.said_at) return { madeAt: turn.said_at, turnId: turn.id };
    if (/A15|S7-|S8-|S8E|HV-|SP-/.test(sources)) return { madeAt: '2026-10-15T12:00:00.000Z', turnId: null };
    if (/A14|S[1-6]-|PF-/.test(sources)) return { madeAt: '2026-10-14T12:00:00.000Z', turnId: null };
    return { madeAt: '2026-10-13T12:00:00.000Z', turnId: null };
  };
  const excerpts = new Map<string, string>();
  const excerptFor = (row: Row) => {
    const id = row.ID!;
    if (!excerpts.has(id)) excerpts.set(id, brain.addExcerpt(regId, id, Object.entries(row).filter(([k, v]) => k !== 'ID' && v && v !== '—').map(([k, v]) => `${k}: ${clean(v)}`).join('\n')).id as string);
    return excerpts.get(id)!;
  };
  let count = 0;
  function say(elementId: string, field: string, value: unknown, row: Row, opts: { status?: Status; statusCell?: string; extra?: string } = {}) {
    const cell = opts.statusCell ?? row.Status ?? '';
    const status = opts.status ?? statusOf(cell);
    if (typeof value === 'string' && /^(—|-|)$/.test(value.trim()) && status !== 'unanswered') return; // an empty cell says nothing
    const sources = row.Sources ?? '';
    const assistant = status === 'proposed' || (status === 'illustrative' && !/SB-/.test(sources));
    const { madeAt, turnId } = dateOf(sources);
    const later = clean(row.Evolution ?? row.History ?? row.Notes ?? '');
    const note = [`${row.ID}.`, cell && cell.toLowerCase() !== status.replace('_', ' ') ? `In the register: ${clean(cell)}.` : '', opts.extra ?? '', sources ? `Sources: ${clean(sources)}.` : '', later && later !== 'Unchanged.' ? later : ''].filter(Boolean).join(' ');
    brain.addStatement({
      elementId, field, value: status === 'unanswered' && (value == null || value === '') ? null : value, status,
      speaker: assistant ? { kind: 'assistant', name: 'ChatGPT' } : { kind: 'source', name: status === 'illustrative' ? 'Story Bible v5' : REGISTER_NAME },
      sourceId: regId, excerptId: excerptFor(row), madeAt, turnId, note: note.slice(0, 4000),
    });
    count++;
  }
  const field = (kind: string, label: string, multi = true, group = 'From my planning') => brain.defineField(pid, { kind, label, group, multi }).field as string;

  const F = {
    premise: field('storyworld', 'Premise, theme and tone'),
    setting: field('storyworld', 'Setting and timelines'),
    pov: field('storyworld', 'Viewpoint rules'),
    knowledge: field('storyworld', 'Who knows what, and when'),
    samples: field('storyworld', 'Sample lines (examples, never canon)'),
    other: field('storyworld', 'Other planning notes'),
    happens: field('scene_plan', 'What happens', false),
    cardNotes: field('scene_plan', 'Planning notes'),
    rel: field('relationship', 'What I know about them'),
    beatNotes: field('beat', 'Planning notes'),
  };

  // ---------- characters ----------
  const chars = new Map<string, string>();
  const character = (key: string, title: string, gender: string | null, attrs: Record<string, unknown> = {}, importance = 'supporting') => {
    const el = brain.createElement(pid, { kind: 'character', title, attrs });
    chars.set(key, el.id as string);
    brain.addStatement({ elementId: el.id as string, field: 'importance', value: importance, status: 'established', speaker: { kind: 'source', name: REGISTER_NAME }, sourceId: regId, madeAt: '2026-10-13T00:00:00.000Z' });
    if (gender) brain.addStatement({ elementId: el.id as string, field: 'gender', value: gender, status: 'established', speaker: { kind: 'source', name: REGISTER_NAME }, sourceId: regId, madeAt: '2026-10-13T00:00:00.000Z', note: 'As the register and her own words refer to them. Change it here if it should read differently.' });
    return el.id as string;
  };
  const kevin = character('kevin', 'Kevin Wickley', 'Man', { aliases: ['Kevin'] }, 'main');
  const anthony = character('anthony', 'Anthony Vernon', 'Man', { aliases: ['Anthony'] }, 'main');
  const francine = character('francine', 'Miss Francine Ellington', 'Woman', { aliases: ['Miss Francine', 'Francine'] }, 'main');
  const wife = character('wife', "Kevin's wife", 'Woman');
  const pieWife = character('pie_wife', 'The block-party wife', 'Woman', {}, 'minor');
  const fingle = character('fingle', 'Dr. Fingleburger', 'Man', { aliases: ['Fingleburger'] }, 'minor');
  const mother = character('mother', "Anthony's mother", 'Woman', {}, 'minor');
  const father = character('father', "Anthony's father", 'Man', {}, 'supporting');
  const family = character('family', "Francine's family", null, {}, 'minor');
  const dogs = character('dogs', 'The dogs', null, {}, 'supporting');
  const amazon = character('amazon', 'The Amazon delivery man', 'Man', {}, 'minor');

  const arcs = new Map<string, string>();
  const arcOf = (charId: string, name = 'arc', value?: string) => {
    const key = `${charId}:${name}`;
    if (!arcs.has(key)) {
      const first = (brain.element(charId).title as string).replace(/^Miss /, '').split(' ')[0];
      const title = `${first}'s ${name}`;
      const el = brain.createElement(pid, { kind: 'arc', title, parentId: charId });
      if (value) brain.addStatement({ elementId: el.id as string, field: 'arc_value', value, status: 'developing', speaker: { kind: 'source', name: REGISTER_NAME }, sourceId: regId, madeAt: '2026-10-13T12:00:00.000Z', note: 'CF-012, CF-013: she runs two arcs at once, on two different values.' });
      arcs.set(key, el.id as string);
    }
    return arcs.get(key)!;
  };

  const CHAR_FIELDS: [RegExp, string][] = [
    [/ethnicity/i, 'ethnicity'], [/^(story role|core role|existence and role|identity|function|ownership and role)$/i, 'role'],
    [/^core traits/i, 'temperament'], [/^comic engine/i, 'comic_engine'], [/^voice$/i, 'voice'], [/casting tuning fork/i, 'tuning_fork'],
    [/comparison lens|tonal analogies/i, 'comparisons'], [/^theme music/i, 'theme_music'], [/^home$/i, 'home'], [/^last-page/i, 'last_page'],
    [/^(narration|pov)$/i, 'narrates'], [/^concrete goal/i, 'goal'],
  ];
  const ARC_FIELDS: [RegExp, string][] = [[/^arc type/i, 'arc_type'], [/^want/i, 'want'], [/^lie(?! design)/i, 'lie'], [/^ghost/i, 'ghost'], [/^need/i, 'need'], [/^possible truth/i, 'truth']];

  const tables = readRegister(readFileSync(REGISTER, 'utf8'));
  const SUBS: Record<string, string> = { "Kevin's wife": wife, 'Dr. Fingleburger': fingle, "Francine's family": family, 'The dogs': dogs };
  const guard = (parentId: string, text: string) => brain.createElement(pid, { kind: 'guardrail', title: short(text), body: clean(text), parentId });

  for (const t of tables) {
    if (!t.section.startsWith('2.')) continue;
    for (const row of t.rows) {
      const label = clean(row.Field!), value = clean(row.Value!);
      let owner: string | string[] = kevin;
      if (row.ID!.startsWith('CA')) owner = anthony;
      else if (row.ID!.startsWith('CF')) owner = francine;
      else if (row.ID!.startsWith('CS')) {
        if (t.sub.startsWith('The block-party')) owner = pieWife;
        else if (t.sub === "Anthony's parents") owner = label === 'Mother' ? mother : label === 'Father' ? father : [mother, father];
        else if (t.sub.startsWith('The neighborhood')) owner = row.ID === 'CS-022' ? amazon : world;
        else owner = SUBS[t.sub] ?? world;
      }
      for (const o of Array.isArray(owner) ? owner : [owner]) {
        if (o === world) { say(world, F.other, `${label}: ${value}`, row); continue; }
        if (label === 'Name' && statusOf(row.Status!) === 'established') continue; // the record's own name
        if (row.ID === 'CF-012') { say(arcOf(francine, 'arc on respect', 'Respect'), 'arc_type', value, row); continue; }
        if (row.ID === 'CF-013') { say(arcOf(francine, 'arc on loneliness', 'Loneliness turning into aliveness'), 'arc_type', value, row); continue; }
        if (row.ID === 'CF-014') { say(arcOf(francine, 'arc on loneliness', 'Loneliness turning into aliveness'), 'lie', value, row); continue; }
        const arcField = ARC_FIELDS.find(([re]) => re.test(label))?.[1];
        if (arcField && ['CK', 'CA'].includes(row.ID!.slice(0, 2))) { say(arcOf(o), arcField, value, row); continue; }
        const f = CHAR_FIELDS.find(([re]) => re.test(label))?.[1];
        say(o, f ?? 'facts', f ? value : `${label}: ${value}`, row);
      }
    }
  }

  // ---------- premise, setting, viewpoint ----------
  const PT_MAP: Record<string, string> = { 'PT-007': 'logline', 'PT-008': 'logline', 'PT-013': 'paragraph', 'PT-015': 'controlling_idea', 'PT-017': 'moral_premise', 'PT-018': 'moral_premise' };
  const TS_MAP: Record<string, string> = { 'TS-006': 'era', 'TS-007': 'duration' };
  const PV_MAP: Record<string, string> = { 'PV-001': 'pov_person', 'PV-002': 'pov_approach', 'PV-004': 'pov_rule' };
  for (const t of tables) {
    for (const row of t.rows) {
      const id = row.ID!;
      if (id.startsWith('PT-')) say(world, PT_MAP[id] ?? F.premise, clean(row.Statement!), row);
      else if (id.startsWith('TS-')) say(world, TS_MAP[id] ?? F.setting, clean(row.Statement!), row);
      else if (id.startsWith('PV-')) say(world, PV_MAP[id] ?? F.pov, clean(row.Rule!), row);
      else if (id.startsWith('KN-')) {
        const v = `${clean(row['Point in the book']!)}. The reader: ${clean(row['What the reader suspects about Francine']!)}. Kevin: ${clean(row['What Kevin knows / believes']!)}. Anthony: ${clean(row['What Anthony knows / believes']!)}. Francine: ${clean(row['What Francine knows']!)}.`;
        say(world, F.knowledge, v, row);
      }
    }
  }
  // Guardrails: the rules she established that must never break.
  const rowById = new Map(tables.flatMap((t) => t.rows.map((r) => [r.ID!, r] as const)));
  const text = (id: string) => clean(rowById.get(id)!.Statement ?? rowById.get(id)!.Rule ?? rowById.get(id)!.Value!);
  for (const [id, parent] of [['PT-011', world], ['PT-023', world], ['PT-024', world], ['PT-025', francine], ['PV-004', world], ['PV-006', world], ['CK-033', kevin], ['CA-009', anthony], ['CA-018', anthony], ['CA-023', anthony], ['CS-022', amazon]] as const) guard(parent, text(id));

  // ---------- relationships ----------
  const rels = new Map<string, string>();
  const REL_OF: Record<string, [string, string[]]> = {
    'RL-015': ['Kevin, Anthony and Miss Francine', [kevin, anthony, francine]], 'RL-016': ['Kevin, Anthony and Miss Francine', [kevin, anthony, francine]],
    'RL-017': ['Anthony and Miss Francine', [anthony, francine]], 'RL-018': ['Kevin and his wife', [kevin, wife]],
    'RL-019': ['Anthony and his father', [anthony, father]], 'RL-020': ['Miss Francine and her family', [francine, family]],
  };
  for (const row of tables.find((t) => t.head.includes('Relationship'))!.rows) {
    const [title, who] = REL_OF[row.ID!] ?? ['Kevin and Anthony', [kevin, anthony]];
    if (!rels.has(title)) {
      const el = brain.createElement(pid, { kind: 'relationship', title });
      for (const c of who) brain.link(pid, { fromId: el.id as string, toId: c, relation: 'relates_to' });
      rels.set(title, el.id as string);
    }
    const label = clean(row.Relationship!).replace(/^Kevin and Anthony:\s*/i, '');
    say(rels.get(title)!, F.rel, `${label}: ${clean(row.Statement!)}`, row);
  }

  // ---------- beats ----------
  const beats = structure.beats(pid).map((b) => ({ id: b.element.id as string, title: (b.element.title as string).toLowerCase() }));
  const beatNamed = (s: string) => {
    const n = s.toLowerCase().replace(/\(.*?\)/g, '').replace(/^finale step:\s*/, '').trim();
    return beats.find((b) => b.title === n)?.id ?? null;
  };
  const catalyst = beatNamed('Catalyst')!;
  for (const row of tables.find((t) => t.head.includes('Beat'))!.rows) {
    const id = beatNamed(row.Beat!);
    const extra = `Placement in her plan: ${clean(row.Placement!)}.`;
    if (id) say(id, 'event', clean(row['What happens in IDW']!), row, { extra });
    else if (/key event/i.test(row.Beat!)) say(catalyst, F.beatNotes, `${clean(row.Beat!)}: ${clean(row['What happens in IDW']!)}`, row, { extra });
    else say(world, F.other, `${clean(row.Beat!)}: ${clean(row['What happens in IDW']!)}`, row);
  }

  // ---------- scene cards ----------
  const cards = new Map<string, string>();
  const LEADS: [string, RegExp][] = [[kevin, /\bKevin\b/], [anthony, /\bAnthony\b/], [francine, /\bFrancine\b/], [fingle, /Fingleburger/], [wife, /Kevin's wife|his wife\b/i]];
  for (const row of tables.find((t) => t.head.includes('Scene / set piece'))!.rows) {
    const id = row.ID!, name = clean(row['Scene / set piece']!), happens = clean(row['What happens']!);
    const parent = id.match(/^(SC-\d+)[a-z]$/)?.[1];
    if (parent && cards.has(parent)) {
      const label = name.replace(/^[^:]+:\s*/, '');
      say(cards.get(parent)!, F.cardNotes, `${label[0]!.toUpperCase()}${label.slice(1)}: ${happens}`, row);
      continue;
    }
    if (statusOf(row.Status!) === 'set_aside') { say(world, F.other, `${name}: ${happens}`, row); continue; }
    const card = structure.addCard(pid, { title: name.replace(/^"|"$/g, '') });
    cards.set(id, card.id as string);
    say(card.id as string, F.happens, happens, row);
    const placement = clean(row.Placement ?? '');
    for (const b of beats) {
      if (!new RegExp(`\\b${b.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(placement)) continue;
      brain.addStatement({ elementId: card.id as string, field: 'beat', value: b.id, status: 'developing', speaker: { kind: 'source', name: REGISTER_NAME }, sourceId: regId, excerptId: excerptFor(row), madeAt: dateOf(row.Sources ?? '').madeAt, note: `${id}. A candidate placement, not a decision. In the register: ${placement}` });
    }
    for (const [cid, re] of LEADS) if (re.test(`${name} ${happens}`)) brain.link(pid, { fromId: cid, toId: card.id as string, relation: 'appears_in', strength: 'inferred', note: 'Named in this scene\'s plan in the register.' });
  }

  // ---------- clues and Francine's ledger ----------
  for (const row of tables.find((t) => t.head.includes('Plant (shown on the page)'))!.rows) {
    const el = brain.createElement(pid, { kind: 'clue', title: short(row['Plant (shown on the page)']!) });
    say(el.id as string, 'planted', clean(row['Where it sits']!), row);
    if (row['What it secretly means'] && row['What it secretly means'] !== '—') say(el.id as string, 'truth', clean(row['What it secretly means']), row);
    if (row.Payoff && row.Payoff !== '—') say(el.id as string, 'paid_off', clean(row.Payoff), row);
  }
  for (const row of tables.find((t) => t.head.includes("Francine's hidden move"))!.rows) {
    if (row["Francine's hidden move"] === 'Two empty rows in the Bible') { say(world, F.other, "Francine's ledger: two more rows the Bible leaves empty, still to fill.", row); continue; }
    const el = brain.createElement(pid, { kind: 'hidden_move', title: short(row["Francine's hidden move"]!, 70), parentId: francine });
    say(el.id as string, 'when', clean(row.When!), row);
    say(el.id as string, 'move', clean(row["Francine's hidden move"]!), row);
    say(el.id as string, 'others_see', clean(row['What the men see and how they misread it']!), row);
    say(el.id as string, 'blame', clean(row['Who takes the blame']!), row);
  }

  // ---------- lines ----------
  for (const t of tables.filter((x) => x.section.startsWith('10.'))) {
    const hers = t.sub.startsWith('10.1'), kept = t.sub.startsWith('10.2');
    for (const row of t.rows) {
      if (hers || kept) {
        const line = clean(row['Line (verbatim)']!);
        const turn = dateOf(row.Sources ?? '').turnId;
        const el = brain.createElement(pid, { kind: 'line', title: short(line), body: line.replace(/^"(.*)"$/, '$1'), attrs: { written_by: hers ? 'author' : 'assistant', written_by_name: hers ? 'Yolanda' : 'ChatGPT', kept_by: 'author', placement: 'open', ...(turn ? { conversation_id: conv.conversation.id, turn_id: turn } : {}) } });
        say(el.id as string, 'speaker', clean(row.Speaker!), row);
        const pl = clean(row.Placement ?? '');
        if (pl && pl !== '—') say(el.id as string, 'placement', pl.replace(/;\s*Unanswered$/i, ''), row, { status: /^unanswered$/i.test(pl) ? 'unanswered' : 'developing' });
      } else {
        say(world, F.samples, clean(row.Line ?? row['Line(s)']!), row);
      }
    }
  }

  // ---------- open questions and conflicts between sources ----------
  for (const row of tables.find((t) => t.head.includes('Question'))!.rows) {
    const q = clean(row.Question!);
    const el = brain.createElement(pid, { kind: 'question', title: short(q), body: q, state: 'open' });
    say(el.id as string, 'answer', null, row, { status: 'unanswered', statusCell: 'Unanswered' });
  }
  for (const row of tables.find((t) => t.head.includes('Conflict'))!.rows) {
    excerptFor(row);
    brain.createElement(pid, { kind: 'note', title: `${row.ID}: ${short(row.Conflict!, 70)}`, body: `${clean(row.Conflict!)}\n\nWhat stands: ${clean(row['What stands, and why']!)}\n\nSources: ${clean(row.Sources!)}` });
  }

  // ---------- a clean start ----------
  // The build is not her history. Her undo and Story Trail begin with her first change.
  store.db.prepare('DELETE FROM journal WHERE batch_id IN (SELECT id FROM batches WHERE project_id=?)').run(pid);
  store.db.prepare('DELETE FROM batches WHERE project_id=?').run(pid);

  const archive = exportArchive(store, pid);
  writeFileSync(OUT, JSON.stringify(archive));
  const n = (sql: string) => (store.db.prepare(sql).get(pid) as { n: number }).n;
  console.log(JSON.stringify({
    statements: count, rows: tables.reduce((a, t) => a + t.rows.length, 0), excerptsFromRegister: excerpts.size,
    elements: n('SELECT COUNT(*) AS n FROM elements WHERE project_id=?'), withTurn: n('SELECT COUNT(*) AS n FROM statements WHERE project_id=? AND turn_id IS NOT NULL'),
    byStatus: store.db.prepare('SELECT status, COUNT(*) AS n FROM statements WHERE project_id=? GROUP BY status').all(pid), turns: conv.turnsStored, out: OUT,
  }, null, 1));
  store.db.close();
  rmSync(dir, { recursive: true, force: true });
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop()!)) void main().catch((e) => { console.error(e); process.exit(1); });
