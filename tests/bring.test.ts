import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { exportArchive, importArchive } from '../src/core/backup.js';
import { undoMeaning } from '../src/core/trailwords.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

/** An older, cluttered novel with two characters, a place and a connection, and a clean new one. */
function shelf() {
  env = freshStore();
  const { brain } = env;
  const old = brain.createProject('I Declare War').id;
  const fresh = brain.createProject('The Keeper of Gull Point').id;
  const marisol = brain.createElement(old, { kind: 'character', title: 'Marisol Vega', body: 'Keeps the light. Never sleeps before two.' });
  const ana = brain.createElement(old, { kind: 'character', title: 'Ana Ruiz' });
  const port = brain.createElement(old, { kind: 'location', title: 'Port Ellery' });
  const author = { kind: 'author' as const };
  // A decision that was changed once: only the newest stays current.
  const first = brain.addStatement({ elementId: marisol.id, field: 'role', value: 'Sidekick', status: 'established', speaker: author });
  brain.addStatement({ elementId: marisol.id, field: 'role', value: 'Protagonist', status: 'established', speaker: author, supersedes: first.id });
  brain.addStatement({ elementId: marisol.id, field: 'want', value: 'To leave Port Ellery', status: 'developing', speaker: author, note: 'From the first outline.' });
  brain.addStatement({ elementId: marisol.id, field: 'wound', value: '', status: 'unanswered', speaker: author });
  const aside = brain.addStatement({ elementId: marisol.id, field: 'need', value: 'To be forgiven', status: 'developing', speaker: author });
  brain.setStatementStatus(aside.id, 'set_aside');
  brain.addStatement({ elementId: marisol.id, field: 'ghost', value: 'Maybe a drowned brother', status: 'proposed', speaker: { kind: 'assistant', name: 'Collaborator' } });
  // A field of her own on this one record, and one for every character in the old novel.
  const own = brain.defineOwnField(marisol.id, { label: 'Favorite knot' });
  brain.addStatement({ elementId: marisol.id, field: own.field, value: 'Bowline', status: 'established', speaker: author });
  const shared = brain.defineField(old, { kind: 'character', label: 'Sea legs' });
  brain.addStatement({ elementId: marisol.id, field: shared.field as string, value: 'Born with them', status: 'established', speaker: author });
  brain.link(old, { fromId: marisol.id, toId: port.id, relation: 'located_at' });
  brain.link(old, { fromId: marisol.id, toId: ana.id, relation: 'knows' });
  return { brain, store: env.store, old, fresh, marisol, ana, port, ownField: own.field, sharedField: shared.field as string };
}

const valueOf = (brain: ReturnType<typeof shelf>['brain'], elId: string, field: string) => {
  const v = brain.field(elId, field);
  return (v.current ?? v.latest ?? v.unanswered[0] ?? v.possibilities[0])?.value;
};

describe('bring a record from another novel', () => {
  it('copies the title, notes, and the current entry of each field with its status as it stands', () => {
    const s = shelf();
    const r = s.brain.bring(s.fresh, s.old, [s.marisol.id]);
    expect(r.brought).toHaveLength(1);
    expect(r.novel).toBe('I Declare War');
    const copy = s.brain.element(r.brought[0]!.id, s.fresh);
    expect(copy.title).toBe('Marisol Vega');
    expect(copy.kind).toBe('character');
    expect(copy.body).toBe('Keeps the light. Never sleeps before two.');
    expect(copy.project_id).toBe(s.fresh);
    expect(s.brain.field(copy.id, 'role').current?.value).toBe('Protagonist');
    expect(s.brain.field(copy.id, 'role').current?.status).toBe('established');
    expect(s.brain.field(copy.id, 'role').history).toHaveLength(0); // only the latest value comes over
    expect(s.brain.field(copy.id, 'want').possibilities[0]?.status).toBe('developing');
    expect(s.brain.field(copy.id, 'wound').unanswered).toHaveLength(1);
    expect(s.brain.field(copy.id, 'ghost').possibilities[0]?.status).toBe('proposed');
    // Set aside stays behind.
    expect(s.brain.field(copy.id, 'need').setAside).toHaveLength(0);
    expect(s.brain.field(copy.id, 'need').latest).toBeNull();
  });

  it('brings her own fields along, on the record and for the kind', () => {
    const s = shelf();
    const id = s.brain.bring(s.fresh, s.old, [s.marisol.id]).brought[0]!.id;
    expect(valueOf(s.brain, id, s.ownField)).toBe('Bowline');
    expect(valueOf(s.brain, id, s.sharedField)).toBe('Born with them');
    const page = s.brain.elementPage(id);
    expect(page.fields.find((f) => f.def.field === s.ownField)?.def.label).toBe('Favorite knot');
    expect(page.fields.find((f) => f.def.field === s.sharedField)?.def.label).toBe('Sea legs');
  });

  it('records where every entry came from', () => {
    const s = shelf();
    const id = s.brain.bring(s.fresh, s.old, [s.marisol.id]).brought[0]!.id;
    const role = s.brain.field(id, 'role').current!;
    expect(role.speaker_kind).toBe('source');
    expect(role.speaker_name).toBe('I Declare War');
    expect(String(role.note)).toMatch(/^Brought from I Declare War on [A-Z][a-z]+ \d{1,2}, \d{4}\.$/);
    const q = role.qualifiers as Record<string, any>;
    expect(q.brought_from.novel).toBe('I Declare War');
    expect(q.brought_from.projectId).toBe(s.old);
    expect(q.brought_from.elementId).toBe(s.marisol.id);
    // The note it had in the other novel is kept too.
    expect(String(s.brain.field(id, 'want').possibilities[0]!.note)).toContain('The note it had there: From the first outline.');
    // Who first said it is remembered.
    expect((s.brain.field(id, 'ghost').possibilities[0]!.qualifiers as any).brought_from.speaker).toBe('assistant');
    // The record itself says where it came from.
    const attrs = JSON.parse(s.brain.element(id).attrs_json as string);
    expect(attrs.brought_from).toMatchObject({ novel: 'I Declare War', projectId: s.old, elementId: s.marisol.id });
    // "Where did this come from?" has an answer.
    expect(s.brain.statementProvenance(role.id).statement.note).toContain('I Declare War');
  });

  it('leaves connections behind and does not copy other records', () => {
    const s = shelf();
    const before = s.brain.elements(s.fresh).length;
    const id = s.brain.bring(s.fresh, s.old, [s.marisol.id]).brought[0]!.id;
    expect(s.brain.linksOf(id)).toHaveLength(0);
    expect(s.brain.links(s.fresh)).toHaveLength(0);
    expect(s.brain.elements(s.fresh).length).toBe(before + 1);
    expect(s.brain.elements(s.fresh).some((e) => e.title === 'Port Ellery')).toBe(false);
    // The chooser says how many connections stay behind.
    const list = s.brain.bringable(s.fresh, s.old, 'character');
    expect(list.records.find((r) => r.id === s.marisol.id)?.connections).toBe(2);
  });

  it('keeps the copy independent: editing it never changes the original', () => {
    const s = shelf();
    const id = s.brain.bring(s.fresh, s.old, [s.marisol.id]).brought[0]!.id;
    s.brain.updateElement(id, { title: 'Marisol Vega-Hale', body: 'Rewritten.' });
    s.brain.addStatement({ elementId: id, field: 'role', value: 'Antagonist', status: 'established', speaker: { kind: 'author' }, supersedes: 'current' });
    const w = s.brain.field(id, 'want').possibilities[0]!;
    s.brain.setStatementStatus(w.id, 'established');
    const orig = s.brain.element(s.marisol.id, s.old);
    expect(orig.title).toBe('Marisol Vega');
    expect(orig.body).toBe('Keeps the light. Never sleeps before two.');
    expect(s.brain.field(s.marisol.id, 'role').current?.value).toBe('Protagonist');
    expect(s.brain.field(s.marisol.id, 'want').possibilities[0]?.status).toBe('developing');
    expect(s.brain.linksOf(s.marisol.id)).toHaveLength(2);
  });

  it('warns about a record with the same title and kind already here, and still brings it when asked', () => {
    const s = shelf();
    const mine = s.brain.createElement(s.fresh, { kind: 'character', title: 'marisol vega ' });
    const list = s.brain.bringable(s.fresh, s.old, 'character');
    expect(list.records.find((r) => r.title === 'Marisol Vega')?.alreadyHere).toBe(true);
    expect(list.records.find((r) => r.title === 'Ana Ruiz')?.alreadyHere).toBe(false);
    // A place with the same name would not count: kinds must match too.
    s.brain.createElement(s.fresh, { kind: 'location', title: 'Ana Ruiz' });
    expect(s.brain.bringable(s.fresh, s.old, 'character').records.find((r) => r.title === 'Ana Ruiz')?.alreadyHere).toBe(false);
    const r = s.brain.bring(s.fresh, s.old, [s.marisol.id]);
    const chars = s.brain.elements(s.fresh, { kind: 'character' });
    expect(chars).toHaveLength(2);
    expect(r.brought[0]!.id).not.toBe(mine.id);
    expect(s.brain.element(mine.id).title).toBe('marisol vega'); // nothing merged into hers
  });

  it('is one step in the Story Trail, and one undo removes everything it brought', () => {
    const s = shelf();
    const before = s.store.history(s.fresh).length;
    const r = s.brain.bring(s.fresh, s.old, [s.marisol.id, s.ana.id]);
    expect(r.words.many).toBe('characters');
    const trail = s.store.history(s.fresh);
    expect(trail.length).toBe(before + 1);
    expect(trail[0]!.reason).toBe('Brought 2 characters from I Declare War');
    expect(trail[0]!.id).toBe(r.batchId);
    expect(undoMeaning(trail[0]!.reason as string)).toMatch(/originals in the other novel stay/);
    s.store.revert(r.batchId, 'author');
    expect(s.brain.elements(s.fresh, { kind: 'character' })).toHaveLength(0);
    const live = s.store.db.prepare('SELECT COUNT(*) AS n FROM statements WHERE project_id=? AND deleted_at IS NULL').get(s.fresh) as { n: number };
    expect(live.n).toBe(0);
    expect(s.brain.fieldsFor(s.fresh, 'character', { all: true }).some((d) => d.field === s.sharedField)).toBe(false);
    // The originals are untouched by the undo.
    expect(s.brain.elements(s.old, { kind: 'character' })).toHaveLength(2);
    expect(s.brain.field(s.marisol.id, 'role').current?.value).toBe('Protagonist');
  });

  it('respects which novel is which', () => {
    const s = shelf();
    expect(() => s.brain.bring(s.fresh, s.fresh, [s.marisol.id])).toThrow(/different novel/);
    // A record named as from one novel but living in another is refused.
    const other = s.brain.createProject('Third Book').id;
    expect(() => s.brain.bring(s.fresh, other, [s.marisol.id])).toThrow(/not found/);
    // A removed novel is not offered and cannot be brought from.
    s.brain.removeProject(s.old);
    expect(() => s.brain.bringable(s.fresh, s.old, 'character')).toThrow(/not found/);
    expect(() => s.brain.bring(s.fresh, s.old, [s.marisol.id])).toThrow(/not found/);
  });

  it('brings a kind of her own along when this novel does not have it', () => {
    const s = shelf();
    const k = s.brain.defineKind(s.old, { label: 'Running gag' });
    const gag = s.brain.createElement(s.old, { kind: k.key as string, title: 'The broken foghorn' });
    s.brain.addStatement({ elementId: gag.id, field: 'payoff', value: 'It works on the last page', status: 'developing', speaker: { kind: 'author' } });
    const r = s.brain.bring(s.fresh, s.old, [gag.id]);
    expect(r.words.one).toBe('running gag');
    expect(s.brain.kinds(s.fresh).some((x) => x.key === k.key)).toBe(true);
    expect(s.brain.field(r.brought[0]!.id, 'payoff').possibilities[0]?.value).toBe('It works on the last page');
  });

  it('travels with the novel when it is shared or backed up', () => {
    const s = shelf();
    const id = s.brain.bring(s.fresh, s.old, [s.marisol.id]).brought[0]!.id;
    const archive = exportArchive(s.store, s.fresh);
    const copy = importArchive(s.store, archive, { asCopy: true }) as { projectId?: string; id?: string };
    const pid = (copy.projectId ?? copy.id) as string;
    const els = s.brain.elements(pid, { kind: 'character' });
    expect(els.map((e) => e.title)).toEqual(['Marisol Vega']);
    expect(els[0]!.id).not.toBe(id);
    const role = s.brain.field(els[0]!.id as string, 'role').current!;
    expect(role.value).toBe('Protagonist');
    expect(role.speaker_name).toBe('I Declare War');
  });
});
