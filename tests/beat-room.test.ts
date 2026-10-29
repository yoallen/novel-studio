import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure, beatDef } from '../src/core/structure.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

function setup(targetWords?: number) {
  env = freshStore();
  const pid = env.brain.createProject('Room', targetWords ? { settings: { targetWords } } : {}).id as string;
  const st = new Structure(env.store, env.brain, env.ms);
  st.applySaveTheCat(pid);
  const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
  const card = (title: string, k: string) => st.addCard(pid, { title, beatId: beat(k) }) as { id: string };
  const write = (planId: string, chapterId: string, words: number) => {
    const s = env.ms.addScene(chapterId, { text: Array.from({ length: words }, (_, i) => `w${i}`).join(' ') + '.' }) as { id: string };
    env.store.db.prepare('UPDATE scenes SET plan_element_id=? WHERE id=?').run(planId, s.id);
  };
  return { pid, st, beat, card, write };
}

describe('how much room a beat takes (Jessica Brody)', () => {
  it('gives every Save the Cat beat Brody\'s size, and the sheet\'s fractions read as percents', () => {
    const size = (k: string) => beatDef('save_the_cat', k)!.brody?.size;
    expect(['opening_image', 'theme_stated', 'catalyst', 'break_into_two', 'b_story', 'midpoint', 'all_is_lost', 'break_into_three', 'final_image'].map(size)).toEqual(Array(9).fill('single'));
    expect(['setup', 'debate', 'fun_and_games', 'bad_guys_close_in', 'dark_night', 'finale'].map(size)).toEqual(Array(6).fill('multi'));
    expect(size('stasis_death')).toBeUndefined();
    expect(beatDef('save_the_cat', 'midpoint')!.window).toBe('50%.');
    expect(beatDef('save_the_cat', 'all_is_lost')!.window).toBe('75%.');
  });

  it('a single-scene beat asks only when its cards spread past one chapter; a multi-scene beat only at one card; an empty beat never', () => {
    const { pid, st, beat, card, write } = setup(80000);
    const room = () => st.room(pid);
    expect(room()[beat('catalyst')]).toMatchObject({ size: 'single', cards: 0, question: null });
    expect(room()[beat('fun_and_games')]).toMatchObject({ size: 'multi', cards: 0, question: null, words: 24000, scenes: null });

    const ch1 = env.ms.addChapter(pid, 'One').id as string, ch2 = env.ms.addChapter(pid, 'Two').id as string;
    const a = card('The dog in the garden', 'catalyst'), b = card('The violation notice', 'catalyst');
    write(a.id, ch1, 30); write(b.id, ch1, 30);
    expect(room()[beat('catalyst')]).toMatchObject({ cards: 2, chapters: 1, question: null });
    const c = card('Kevin vows war', 'catalyst');
    write(c.id, ch2, 30);
    expect(room()[beat('catalyst')]!.question).toBe('Catalyst is a single-scene beat and holds 3 scene cards. A single-scene beat lands in one scene or one chapter. Is all of this the Catalyst, or is some of it the Debate?');

    card('The first prank', 'fun_and_games');
    const fg = room()[beat('fun_and_games')]!;
    expect(fg.question).toBe('Fun and Games is a multi-scene beat with 1 scene card. It spans several scenes or chapters. Is it getting the room it needs?');
    expect(fg.usual).toBe(30);
    expect(fg.scenes).toBe(800);
    card('The HOA flyer war', 'fun_and_games');
    expect(room()[beat('fun_and_games')]!.question).toBeNull();

    const qs = st.questions(pid).map((q) => q.text);
    expect(qs.some((q) => q.startsWith('Catalyst is a single-scene beat'))).toBe(true);
  });

  it('without a target length there is no word estimate, only the count', () => {
    const { pid, st, beat } = setup();
    expect(st.room(pid)[beat('debate')]).toMatchObject({ size: 'multi', words: null, scenes: null, target: null });
  });
});
