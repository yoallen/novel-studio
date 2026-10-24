import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Structure } from '../src/core/structure.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

describe('where she is writing, on the book map', () => {
  it('a beat is written in once a scene on it has words; writing now follows her last scene until she chooses', () => {
    env = freshStore();
    const p = env.brain.createProject('Map Book'); const pid = p.id as string;
    const ch = env.ms.addChapter(pid);
    const st = new Structure(env.store, env.brain, env.ms);
    st.applySaveTheCat(pid);
    const beat = (k: string) => st.beats(pid).find((b) => b.attrs.template_key === k)!.element.id as string;
    const write = (title: string, key: string, words: number) => {
      const card = st.addCard(pid, { title, beatId: beat(key) });
      const sc = env.ms.addScene(ch.id);
      env.store.db.prepare('UPDATE scenes SET plan_element_id=? WHERE id=?').run(card.id, sc.id);
      env.ms.saveScene(sc.id, { doc: env.doc(Array.from({ length: words }, (_, i) => `w${i}`).join(' ')), expectVersion: env.ms.scene(sc.id).prose_version as number });
      return sc.id;
    };
    // Nothing written: no beat is written in and nothing is being written, whatever the word count.
    let s = st.strip(pid) as any;
    expect(s.segments.every((x: any) => !x.written)).toBe(true);
    expect(s.auto).toBeNull();
    write('The empty boat', 'catalyst', 40);
    write('The last stand', 'finale', 30); // out of order: written after the Catalyst scene
    s = st.strip(pid) as any;
    const by = (k: string) => s.segments.find((x: any) => x.id === beat(k));
    expect(by('catalyst').written).toBe(true);
    expect(by('finale').written).toBe(true);
    expect(by('midpoint').written).toBe(false);
    expect(s.auto).toBe(beat('finale')); // the scene she last wrote in
    expect(s.writingNow).toBeNull();
    // She says where she is, and it wins; clearing it hands it back.
    env.brain.updateSettings(pid, { writingNow: [beat('debate'), beat('finale')] });
    expect((st.strip(pid) as any).writingNow).toEqual([beat('debate'), beat('finale')]);
    env.brain.updateSettings(pid, { writingNow: null });
    expect((st.strip(pid) as any).writingNow).toBeNull();
  });
});
