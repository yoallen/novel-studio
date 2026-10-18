import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure, SAVE_THE_CAT } from '../src/core/structure.js';
import { Ripple } from '../src/core/ripple.js';
import { Zoom } from '../src/core/zoom.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());
function setup() {
  env = freshStore();
  const pid = env.brain.createProject('I Declare War').id as string;
  const st = new Structure(env.store, env.brain, env.ms);
  const rp = new Ripple(env.store, env.brain, env.ms, st);
  const zoom = new Zoom(env.store, env.brain, env.ms, st, rp);
  st.applySaveTheCat(pid);
  const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
  return { pid, st, zoom, beat };
}

describe('Narrative Zoom, as a novelist reads it', () => {
  it('opens each Save the Cat world above the act it begins, with a one-line meaning beside her own description', () => {
    const { pid, zoom } = setup();
    const v = zoom.view(pid, { level: 'story' }) as any;
    expect(v.children.map((c: any) => c.world)).toEqual(['thesis', 'antithesis', 'antithesis', 'synthesis']);
    const thesis = v.worlds.find((w: any) => w.key === 'thesis');
    expect(thesis.meaning).toMatch(/before/);
    // Her sheet's words, typos and all, are never changed.
    expect(v.worlds.find((w: any) => w.key === 'antithesis').description).toContain('the old wolrd');
  });

  it('reads beat places as a novelist would: a moment, a stretch, and a moment inside a stretch', () => {
    const { pid, zoom } = setup();
    const act = zoom.view(pid, { level: 'act', key: 'I' }) as any;
    const at = (name: string) => act.children.find((c: any) => c.label.endsWith(name)).detail;
    expect(at('Theme Stated')).toBe('5%, during Setup');
    expect(at('Setup')).toBe('1% to 10%');
    expect(at('Catalyst')).toBe('10%');
  });

  it('credits the example from her sheet to the book it comes from, without changing her text', () => {
    const oi = SAVE_THE_CAT.find((b) => b.key === 'opening_image')!;
    expect(oi.exampleFrom).toEqual({ title: 'The Shining', author: 'Stephen King' });
    expect(oi.example).toContain("He's an alcholic with a horrible temper.");
  });

  it('a card that only might go on a beat is not also listed as having no spot', () => {
    const { pid, st, beat, zoom } = setup();
    const maybe = st.addCard(pid, { title: 'The brawl' });
    st.place(maybe.id, beat('midpoint'), 'candidate');
    st.addCard(pid, { title: 'Block-party pie' });
    const b = st.board(pid) as any;
    expect(b.unspotted.map((c: any) => c.title)).toEqual(['Block-party pie']);
    const v = zoom.view(pid, { level: 'story' }) as any;
    expect(v.unplaced.map((c: any) => c.label)).toEqual(['Block-party pie']);
    expect(v.mightOnly).toBe(1);
    expect(v.children.find((c: any) => c.act === 'IIB').detail).toBe('4 beats, 0 scenes decided, 1 might go here');
  });

  it('a card decided on a beat that was removed goes back to having no spot, instead of vanishing from the board', () => {
    const { pid, st, beat } = setup();
    const card = st.addCard(pid, { title: 'Opening image scene', beatId: beat('opening_image') });
    env.brain.deleteElement(beat('opening_image'));
    expect((st.board(pid) as any).unspotted.map((c: any) => c.id)).toEqual([card.id]);
  });

  it('a beat page lists the cards she already has, so she can place one there', () => {
    const { pid, st, beat, zoom } = setup();
    const free = st.addCard(pid, { title: 'Kevin waters the lawn' });
    st.addCard(pid, { title: 'Already here', beatId: beat('setup') });
    const v = zoom.view(pid, { level: 'beat', id: beat('setup') }) as any;
    expect(v.others.map((c: any) => c.label)).toEqual(['Kevin waters the lawn']);
    expect(v.others[0]).toMatchObject({ id: free.id, placed: false });
  });
});

describe('fields on a beat', () => {
  it('Setup has its own list for the six things that need fixing; no other beat does', () => {
    const { beat } = setup();
    const setupPage = env.brain.elementPage(beat('setup'));
    const fix = setupPage.fields.find((f) => f.def.field === 'things_to_fix');
    expect(fix?.def.multi).toBe(true);
    expect(fix?.def.prompt).toMatch(/paid off or fixed/);
    expect(env.brain.elementPage(beat('catalyst')).fields.some((f) => f.def.field === 'things_to_fix')).toBe(false);
  });

  it('a field of her own can go on just one beat, as a list, and stays off every other beat', () => {
    const { beat } = setup();
    const def = env.brain.defineOwnField(beat('catalyst'), { label: 'The phone call', multi: true });
    const mine = env.brain.elementPage(beat('catalyst')).fields.find((f) => f.def.field === def.field);
    expect(mine?.def).toMatchObject({ label: 'The phone call', multi: true, custom: true, own: true });
    expect(env.brain.elementPage(beat('debate')).fields.some((f) => f.def.field === def.field)).toBe(false);
    env.brain.addStatement({ elementId: beat('catalyst'), field: def.field, value: 'Dad calls', status: 'developing', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: beat('catalyst'), field: def.field, value: 'Mom calls', status: 'developing', speaker: { kind: 'author' } });
    expect(env.brain.field(beat('catalyst'), def.field).possibilities).toHaveLength(2);
    // A second field with the same name gets its own key.
    expect(env.brain.defineOwnField(beat('catalyst'), { label: 'The phone call' }).field).not.toBe(def.field);
  });
});
