import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';
import { charge } from '../src/ui/status.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

describe("Snyder's Board: card numbers, row counts, the turn and the conflict", () => {
  it('numbers decided cards straight through the rows in Board order, counts each row, and leaves pencil cards unnumbered', () => {
    env = freshStore();
    const pid = env.brain.createProject('Gull Point').id as string;
    const st = new Structure(env.store, env.brain, env.ms);
    st.applySaveTheCat(pid);
    const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
    const late = st.addCard(pid, { title: 'The light goes dark', beatId: beat('all_is_lost') });
    const first = st.addCard(pid, { title: 'The lamp at dusk', beatId: beat('opening_image') });
    const second = st.addCard(pid, { title: 'The empty boat', beatId: beat('catalyst') });
    const maybe = st.addCard(pid, { title: 'Ana leaves', beatId: beat('dark_night'), mode: 'candidate' });
    env.brain.addStatement({ elementId: second.id as string, field: 'conflict', value: 'Marisol against the harbor board', status: 'established', speaker: { kind: 'author' } });
    const b = st.board(pid) as any;
    expect(b.numbers[first.id as string]).toBe(1);
    expect(b.numbers[second.id as string]).toBe(2);
    expect(b.numbers[late.id as string]).toBe(3);
    expect(b.numbers[maybe.id as string]).toBeUndefined();
    expect(b.rows.map((r: any) => r.count)).toEqual([2, 0, 1, 0]);
    const c2 = b.rows[0].beats.flatMap((x: any) => x.cards).find((c: any) => c.id === second.id);
    expect(c2.conflict).toBe('Marisol against the harbor board');
  });

  it('reads the charge at the end of a value', () => {
    expect(charge('Safety +')).toBe('+');
    expect(charge('Hope -')).toBe('-');
    expect(charge('Hope −')).toBe('-');
    expect(charge('+ Safety')).toBe('+');
    expect(charge('Safety')).toBeNull();
    expect(charge(null)).toBeNull();
  });
});
