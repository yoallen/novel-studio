import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure, SAVE_THE_CAT, PROFILES } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { exportArchive } from '../src/core/backup.js';
import type { Store } from '../src/core/store.js';

/** The story as the author sees it: every live record, without bookkeeping columns. */
function liveState(store: Store, pid: string) {
  const a = exportArchive(store, pid);
  const skip = new Set(['batches', 'journal', 'writing_sessions']);
  const out: Record<string, unknown[]> = {};
  for (const [t, rows] of Object.entries(a.tables)) {
    if (skip.has(t)) continue;
    out[t] = rows.filter((r) => !r.deleted_at).map((r) => { const { version: _v, updated_at: _u, ...rest } = r; return rest; });
  }
  return JSON.stringify(out);
}

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
function setup(target = 90000) {
  env = freshStore();
  const pid = env.brain.createProject('I Declare War').id as string;
  env.brain.updateSettings(pid, { targetWords: target, wordsPerPage: [250, 300] });
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  st.applySaveTheCat(pid);
  const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
  return { pid, st, rp, beat };
}

describe('beat sheet as she uses it (R-C-007 to R-C-019)', () => {
  it('creates her fifteen beats in order, with Stasis = Death and the Finale steps as sub-beats, and never duplicates them', () => {
    const { pid, st } = setup();
    st.applySaveTheCat(pid);
    const beats = st.beats(pid);
    expect(beats.filter((b) => b.attrs.number).map((b) => b.attrs.number)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(beats.length).toBe(SAVE_THE_CAT.length);
    const setupId = beats.find((b) => b.attrs.template_key === 'setup')!.element.id;
    expect(beats.find((b) => b.attrs.template_key === 'stasis_death')!.element.parent_id).toBe(setupId);
    expect(SAVE_THE_CAT.find((b) => b.key === 'catalyst')!.description).toContain('With the catlyst, we knock it all down.');
    expect(SAVE_THE_CAT.find((b) => b.key === 'fun_and_games')!.sceneType).toBe('Multi Scene or Multi Chapters');
  });

  it('computes both of her placement models for any length, at 250 and 300 words per page', () => {
    const { pid, st } = setup(90000);
    const lm = st.landmarks(pid);
    const ail = lm.beats.find((b) => b.key === 'all_is_lost')!;
    expect(ail.at.brody!.words).toEqual([67500, 67500]);
    expect(ail.at.snyder!.words[0]).toBe(61364);
    expect(ail.at.brody!.pages[250]).toEqual([270, 270]);
    expect(ail.at.brody!.pages[300]).toEqual([225, 225]);
    const cat = lm.beats.find((b) => b.key === 'catalyst')!;
    expect(cat.at.brody!.words[0]).toBe(9000);
    expect(cat.at.brody!.window!.text).toBe('10% or earlier.');
    env.brain.updateSettings(pid, { targetWords: 112000 });
    expect(st.landmarks(pid).beats.find((b) => b.key === 'catalyst')!.at.brody!.words[0]).toBe(11200);
    expect(PROFILES.map((p) => p.key)).toEqual(['brody', 'snyder']);
  });

  it('a card can hold several candidate beats until she decides; deciding keeps the others in history (R-C-012)', () => {
    const { pid, st, beat } = setup();
    const card = st.addCard(pid, { title: 'The insult exchange' });
    st.place(card.id, beat('bad_guys_close_in'), 'candidate');
    st.place(card.id, beat('all_is_lost'), 'candidate');
    let p = st.placements(card.id);
    expect(p.decided).toBeNull();
    expect(p.candidates).toHaveLength(2);
    expect(st.board(pid).unplaced.map((c) => c.title)).toEqual(['The insult exchange']);
    st.place(card.id, beat('all_is_lost'), 'decide');
    p = st.placements(card.id);
    expect(p.decided!.beatId).toBe(beat('all_is_lost'));
    const row = st.board(pid).rows.find((r) => r.act === 'IIB')!;
    expect(row.beats.find((b) => b.key === 'all_is_lost')!.cards.map((c) => c.title)).toEqual(['The insult exchange']);
  });

  it('asks, never blocks, when Midpoint and All Is Lost share a polarity', () => {
    const { pid, st, beat } = setup();
    env.brain.addStatement({ elementId: beat('midpoint'), field: 'polarity', value: 'False defeat', status: 'established', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: beat('all_is_lost'), field: 'polarity', value: 'False defeat', status: 'established', speaker: { kind: 'author' } });
    expect(st.questions(pid).map((q) => q.text).join(' ')).toMatch(/inverse of each other. Intended\?/);
  });
});

describe('the Ripple Effect (R-C-075 to R-C-078)', () => {
  function story() {
    const s = setup();
    const { pid, st, beat } = s;
    const plant = st.addCard(pid, { title: 'Francine writes in the ledger', beatId: beat('setup') });
    const find = st.addCard(pid, { title: 'Kevin finds the ledger', beatId: beat('all_is_lost') });
    const confront = st.addCard(pid, { title: 'Kevin shows Anthony', beatId: beat('dark_night') });
    const win = st.addCard(pid, { title: 'They use the ledger', beatId: beat('finale') });
    const ledger = env.brain.createElement(pid, { kind: 'clue', title: 'The ledger' });
    const truth = env.brain.createElement(pid, { kind: 'event', title: 'Francine started the war' });
    const kevin = env.brain.createElement(pid, { kind: 'character', title: 'Kevin' });
    const link = (fromId: string, toId: string, relation: string) => env.brain.link(pid, { fromId, toId, relation: relation as never });
    link(plant.id, ledger.id, 'plants');
    link(win.id, ledger.id, 'pays_off');
    link(find.id, truth.id, 'reveals');
    link(kevin.id, find.id, 'appears_in');
    link(kevin.id, confront.id, 'appears_in');
    link(kevin.id, truth.id, 'knows');
    link(confront.id, truth.id, 'depends_on');
    link(find.id, confront.id, 'causes');
    return { ...s, plant, find, confront, win, ledger, truth, kevin };
  }

  it('previewing the ledger discovery at the Midpoint changes nothing and explains what it touches', () => {
    const { pid, rp, find, beat } = story();
    const before = exportArchive(env.store, pid).checksums;
    const r = rp.preview(pid, { type: 'moveCard', planId: find.id, beatId: beat('midpoint') });
    expect(exportArchive(env.store, pid).checksums).toEqual(before);
    expect(r.moves.find((m) => m.title === 'Francine started the war')).toMatchObject({ from: { beat: 'All Is Lost' }, to: { beat: 'Midpoint' } });
    expect([...r.moves, ...r.touches].map((t) => t.title)).toEqual(expect.arrayContaining(['Kevin', 'Kevin shows Anthony', 'Francine started the war']));
    expect(r.newQuestions).toHaveLength(0);
  });

  it('moving an effect before its cause, or an action before the knowledge it needs, raises questions; undo restores everything exactly', () => {
    const { pid, rp, confront, beat, find } = story();
    const before = liveState(env.store, pid);
    const preview = rp.preview(pid, { type: 'moveCard', planId: confront.id, beatId: beat('fun_and_games') });
    const rules = preview.newQuestions.map((q) => q.rule).sort();
    expect(rules).toEqual(['acting before knowing', 'cause before effect']);
    expect(preview.newQuestions.find((q) => q.rule === 'cause before effect')!.message).toContain('"Kevin shows Anthony" is caused by "Kevin finds the ledger"');
    const done = rp.commit(pid, { type: 'moveCard', planId: confront.id, beatId: beat('fun_and_games') });
    expect(done.committed).toBe(true);
    expect(rp.current(pid).length).toBe(2);
    env.store.revert(done.batch!.id as string, 'author');
    expect(liveState(env.store, pid)).toBe(before);
    expect(rp.current(pid)).toHaveLength(0);
    void find;
  });

  it('a setup moved after its payoff is flagged; a comic detail elsewhere raises nothing (R-C-078)', () => {
    const { pid, rp, plant, beat } = story();
    const r = rp.preview(pid, { type: 'moveCard', planId: plant.id, beatId: beat('final_image') });
    expect(r.newQuestions.map((q) => q.rule)).toEqual(['setup before payoff']);
    const joke = env.brain.createElement(pid, { kind: 'object', title: 'The garden gnome' });
    const card = new Structure(env.store, env.brain, env.ms).addCard(pid, { title: 'Gnome gag', beatId: beat('fun_and_games') });
    env.brain.link(pid, { fromId: joke.id, toId: card.id, relation: 'appears_in' });
    const r2 = rp.preview(pid, { type: 'moveCard', planId: card.id, beatId: beat('bad_guys_close_in') });
    expect(r2.newQuestions).toHaveLength(0);
    expect(r2.touches.map((t) => t.title)).toEqual([]);
  });

  it('alternate structures are saved, compared without touching canon, and adopted or discarded', () => {
    const { pid, rp, find, beat } = story();
    const before = exportArchive(env.store, pid).checksums.statements;
    const alt = rp.saveAlternate(pid, 'Ledger at the Midpoint', [{ type: 'moveCard', planId: find.id, beatId: beat('midpoint') }]);
    const cmp = rp.compareAlternate(alt.id as string);
    expect(cmp.steps).toHaveLength(1);
    expect(exportArchive(env.store, pid).checksums.statements).toBe(before);
    rp.adoptAlternate(alt.id as string);
    expect(new Structure(env.store, env.brain, env.ms).decidedBeat(find.id)).toBe(beat('midpoint'));
    rp.discardAlternate(alt.id as string);
    expect(rp.alternates(pid)).toHaveLength(0);
  });
});

describe('the Midpoint trust test (R-C-079, R-A-041)', () => {
  it('passes all seven steps', () => {
    const { pid, st, rp, beat } = setup();
    // 1. Establish all fifteen beats.
    for (const b of st.beats(pid).filter((x) => x.attrs.number)) env.brain.addStatement({ elementId: b.element.id as string, field: 'function', value: `What ${b.element.title} does in this book`, status: 'established', speaker: { kind: 'author' } });
    const kevin = env.brain.createElement(pid, { kind: 'character', title: 'Kevin' });
    env.brain.addStatement({ elementId: kevin.id, field: 'goal', value: 'Win the war', status: 'established', speaker: { kind: 'author' } });
    const mpCard = st.addCard(pid, { title: 'The pie scene', beatId: beat('midpoint') });
    const ail = st.addCard(pid, { title: 'All Is Lost scene', beatId: beat('all_is_lost') });
    env.brain.link(pid, { fromId: mpCard.id, toId: ail.id, relation: 'causes' });
    const unrelatedBefore = JSON.stringify(env.brain.elementPage(kevin.id).fields.map((f) => f.view));
    const snapshot = liveState(env.store, pid);
    // 2. Change the Midpoint.
    env.brain.addStatement({ elementId: beat('midpoint'), field: 'function', value: 'A false victory that makes the war public', status: 'established', speaker: { kind: 'author' }, supersedes: 'current' });
    const change = env.store.history(pid)[0]!;
    // 3. Regenerate every related view.
    const lm = st.landmarks(pid), board = st.board(pid), order = rp.order(pid);
    // 4. All fifteen beats still exist, in order.
    expect(lm.beats.filter((b) => b.number).map((b) => b.number)).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(board.rows.flatMap((r) => r.beats).length).toBe(15);
    expect(order.map((u) => u.title)).toEqual(['The pie scene', 'All Is Lost scene']);
    // 5. Unrelated character information is unchanged.
    expect(JSON.stringify(env.brain.elementPage(kevin.id).fields.map((f) => f.view))).toBe(unrelatedBefore);
    // 6. Only appropriate dependencies are flagged.
    expect(rp.current(pid)).toHaveLength(0);
    const preview = rp.preview(pid, { type: 'moveCard', planId: mpCard.id, beatId: beat('final_image') });
    expect(preview.newQuestions.map((q) => q.rule)).toEqual(['cause before effect']);
    expect(preview.touches.map((t) => t.title)).toEqual(['All Is Lost scene']);
    // 7. Reverse the change and recover the previous state exactly.
    env.store.revert(change.id as string, 'author');
    expect(liveState(env.store, pid)).toBe(snapshot);
  });
});
