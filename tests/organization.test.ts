import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Continuity } from '../src/core/continuity.js';
import { Setup } from '../src/core/setup.js';
import { describeChange, undoMeaning } from '../src/core/trailwords.js';
import { RELATION_INFO, relationPhrase, relationSentence } from '../src/core/relations.js';
import { RELATIONS } from '../src/core/brain.js';
import { groupTitle } from '../src/core/groupnames.js';
import { statusLabel } from '../src/core/labels.js';

// How the Story Brain, record pages, Story Trail, Settings and Novel setup are organized and worded for a writer.

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
function setup() {
  env = freshStore();
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  const ct = new Continuity(env.store, env.brain, env.ms, st, rp);
  return { st, ct, su: new Setup(env.store, env.brain, st, ct) };
}
const me = { kind: 'author' as const };

describe('the Story Trail in a writer\'s words', () => {
  const look = { fieldLabel: (t: string, f: string) => (t.startsWith('Kevin') && f === 'arc_type' ? 'Arc type' : null) };
  it('reads connections the right way round, with no program names', () => {
    expect(describeChange("Link Miss Francine's garden located_at Opening image", look)).toBe("Connected: Miss Francine's garden happens at Opening image");
    expect(describeChange('Kevin Wickley: arc 2: arc_type', look)).toBe('Kevin Wickley: arc 2: Arc type');
    expect(describeChange('Setup: some_field', look)).toBe('Setup: some field');
    expect(describeChange('Add location "The garden"', look)).toBe('Added the place "The garden"');
    expect(describeChange('Add location', look)).toBe('Added a place');
    expect(describeChange('Ann: lie marked established', look)).toBe('Ann: lie marked Decided');
    expect(describeChange('Undo: Link A causes B', look)).toBe('Undid: Connected: A causes B');
    // Scenes and moves already read well and stay as they are.
    expect(describeChange('Edit scene "Renamed scene"', look)).toBe('Edit scene "Renamed scene"');
    expect(describeChange('Move "Kevin shows Anthony" to Fun and Games', look)).toBe('Move "Kevin shows Anthony" to Fun and Games');
  });
  it('says what each Undo will do, including for a chat message', () => {
    expect(undoMeaning('Message in "Kevin, 10-14"')).toMatch(/Removes this message from the conversation\. Nothing in your story changes/);
    expect(undoMeaning('Undo: Link A causes B')).toMatch(/Puts back/);
  });
  it('names what changed in settings, and marks which change an undo undid', () => {
    const { su } = setup();
    const pid = su.createNovel('Trail').id as string;
    env.brain.updateSettings(pid, { targetWords: 80000, wordsPerPage: [250, 300] });
    const h = env.store.history(pid);
    expect(h[0]!.reason).toBe('Settings: target length');
    expect(describeChange(h[0]!.reason as string, { fieldLabel: () => null })).toBe('Changed settings: target length');
  });
});

describe('connections read the right way round', () => {
  it('every connection word has a phrase both ways and a plain explanation', () => {
    expect(RELATION_INFO.map((r) => r.key).sort()).toEqual([...RELATIONS].sort());
    for (const r of RELATION_INFO) { expect(r.about.length).toBeGreaterThan(10); expect(r.forward).not.toMatch(/_/); expect(r.back).not.toMatch(/_/); }
    expect(relationPhrase('located_at', 'back', 'Opening image')).toBe('is where Opening image happens');
    expect(relationSentence('appears_in', 'Kevin', 'The five-dollar bill')).toBe('Kevin appears in The five-dollar bill');
  });
});

describe('group names and status words', () => {
  it('a group named after a teacher gets a plain name first', () => {
    expect(groupTitle('Ingermanson')).toBe('Goal and motive (Ingermanson)');
    expect(groupTitle('Identity')).toBe('Identity');
  });
  it('one set of status words, matching the guide', () => {
    expect(['established', 'developing', 'unanswered', 'illustrative', 'proposed'].map((s) => statusLabel(s as never))).toEqual(['Decided', 'Developing', 'Still open', 'Example', 'Suggestion']);
  });
});

describe('the Story Brain', () => {
  it('a question whose answer she decides moves to Answered', () => {
    const { su } = setup();
    const pid = su.createNovel('Q').id as string;
    const q = env.brain.createElement(pid, { kind: 'question', title: 'Why the garden?' });
    const st = env.brain.addStatement({ elementId: q.id, field: 'answer', value: 'It is all she controls.', status: 'developing', speaker: me });
    expect(env.brain.element(q.id).state).toBe('open');
    env.brain.setStatementStatus(st.id, 'established');
    expect(env.brain.element(q.id).state).toBe('answered');
  });
  it('Choices ahead names fields as the record shows them, and lists give a line about each record', () => {
    const { su } = setup();
    const pid = su.createNovel('Choices').id as string;
    su.update(pid, { frameworks: ['weiland'] });
    const c = env.brain.createElement(pid, { kind: 'character', title: 'Ann' });
    const arc = env.brain.createElement(pid, { kind: 'arc', title: 'Ann: trust', parentId: c.id });
    env.brain.addStatement({ elementId: arc.id, field: 'arc_value', value: 'trust', status: 'developing', speaker: me });
    env.brain.addStatement({ elementId: c.id, field: 'importance', value: 'Main', status: 'established', speaker: me });
    env.brain.addStatement({ elementId: c.id, field: 'role', value: 'Lead', status: 'established', speaker: me });
    env.brain.addStatement({ elementId: c.id, field: 'fears', value: null, status: 'unanswered', speaker: me });
    const m = env.brain.openDecisions(pid);
    expect(m.choosing[0]).toMatchObject({ field_label: 'Value this arc is about', kind_label: 'arc' });
    expect(m.stillOpen[0]).toMatchObject({ field_label: 'Fears', kind_label: 'character' });
    const sm = env.brain.kindSummaries(pid, 'character')[c.id as string]!;
    expect(sm).toMatchObject({ established: 2, unanswered: 1 });
    expect(sm.bits.map((b) => b.label)).toEqual(['Narrative importance', 'Role']);
  });
  it('a brand-new novel offers no method\'s questions until she chooses the method', () => {
    const { su } = setup();
    const pid = su.createNovel('Garden Variety', { useDefaults: false }).id as string;
    const groups = new Set(env.brain.fieldsFor(pid, 'character').map((f) => f.group));
    for (const g of ['Ingermanson', 'Forces of antagonism', 'Wound and its fallout', 'Traits and flaws']) expect(groups.has(g)).toBe(false);
    // The arc card is built on Ghost, Lie, Want and Need, so arcs keep them.
    expect(env.brain.fieldsFor(pid, 'arc').some((f) => f.field === 'lie')).toBe(true);
    // "Other facts" comes last on a character.
    const all = env.brain.fieldsFor(pid, 'character');
    expect(all[all.length - 1]!.field).toBe('facts');
  });
});

describe('one home for the heart of the book', () => {
  it('the one sentence and one paragraph in Novel setup are the story world\'s', () => {
    const { su, ct } = setup();
    const pid = su.createNovel('Heart', { profile: { premise_sentence: 'Two men feud; a widow wins.' } }).id as string;
    const world = ct.storyWorld(pid)!;
    expect(env.brain.field(world.id as string, 'logline').latest?.value).toBe('Two men feud; a widow wins.');
    su.update(pid, { premise: 'Two neighbors feud while a widow wins the war.', paragraph: 'Setup. Disaster one. Two. Three. Ending.' });
    const v = env.brain.field(world.id as string, 'logline');
    expect(v.latest?.value).toBe('Two neighbors feud while a widow wins the war.');
    expect(v.history).toHaveLength(1);
    expect(su.get(pid)).toMatchObject({ premise: 'Two neighbors feud while a widow wins the war.', paragraph: 'Setup. Disaster one. Two. Three. Ending.' });
    // Decided stays decided when she rewords it.
    env.brain.setStatementStatus(v.latest!.id as string, 'established');
    su.update(pid, { premise: 'A widow wins the neighbors\' war.' });
    expect(env.brain.field(world.id as string, 'logline').current?.value).toBe('A widow wins the neighbors\' war.');
  });
});

describe('the name she is called by', () => {
  it('comes from About you, or else the first word of her name', () => {
    const { su } = setup();
    const pid = su.createNovel('Name', { profile: { settings: { authorName: 'Yolanda Allen' } } }).id as string;
    expect(env.brain.settings(pid).callName).toBe('Yolanda');
    su.setAuthorProfile({ about: { name: 'Dana' } });
    expect(env.brain.settings(pid).callName).toBe('Dana');
    expect(env.brain.settings(pid).authorName).toBe('Yolanda Allen');
  });
});
