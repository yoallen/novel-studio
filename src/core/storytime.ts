// What a book holds across time and feeling: how old everyone is in each scene, one person's several selves,
// the reader response she is aiming for chapter by chapter, and the songs the story is built on.

import { Store, Row, ValidationError } from './store.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';

/** The four tabs a reader might reach for, and her own words for any others. */
export const READER_RESPONSES = ['Profound', 'Funny', 'Relatable', 'Shocking'] as const;

const PRESENT = new Set(['appears_in', 'pov_of']);

/** Question sets for interviewing a character. She answers in the character's own voice. */
export const INTERVIEW_SETS: { key: string; name: string; about: string; questions: string[] }[] = [
  {
    key: 'know', name: 'Getting to know them',
    about: 'Ten questions that get under the surface. Answer as the character, in their words, not yours.',
    questions: [
      'What is the first thing you remember?', 'Who taught you how to love, and how did they teach it?',
      'What do you want people to think when you walk into a room?', 'What do you lie about most often?',
      'What would you never forgive?', 'What are you most ashamed of?', 'What does a perfect ordinary day look like for you?',
      'What are you afraid someone will find out?', 'Who do you miss?', 'What would you do with one more day?',
    ],
  },
  {
    key: 'villain', name: 'The villain interview (Dara Resnik)',
    about: 'Answer as the villain, who believes they are right, helping, or saving someone, and that the cost is worth it. Then say the answers out loud without looking. If the villain cannot answer as honestly as your hero, you have written an obstacle, not a person.',
    questions: [
      'What is your happiest childhood memory?', 'Who was your first friend, and where are they now?',
      'What was your biggest fear when you were small?', 'What makes you cry?', 'Who hurt you most as a child, and what happened?',
    ],
  },
];

export class StoryTime {
  constructor(private store: Store, private brain: Brain, private ms: Manuscript) {}

  /** The value a field holds now: decided first, then the newest pencil version. */
  private value(id: string, field: string): unknown {
    const v = this.brain.field(id, field);
    return v.current?.value ?? v.latest?.value ?? v.possibilities[0]?.value ?? null;
  }
  private values(id: string, field: string): string[] {
    const v = this.brain.field(id, field);
    const all = [...v.currentAll, ...v.possibilities].map((s) => s.value);
    return [...new Set(all.flatMap((x) => (Array.isArray(x) ? x : [x])).map((x) => String(x ?? '').trim()).filter(Boolean))];
  }
  private year(id: string, field: string): number | null {
    const m = /-?\d{1,6}/.exec(String(this.value(id, field) ?? ''));
    return m ? Number(m[0]) : null;
  }

  /** A character's age in a given story year: a fixed age wins (a younger self who stays eight), else year minus birth year. */
  ageIn(characterId: string, year: number | null): { age: number | null; how: 'fixed' | 'born' | 'unknown' } {
    const fixed = this.year(characterId, 'fixed_age');
    if (fixed != null) return { age: fixed, how: 'fixed' };
    const born = this.year(characterId, 'born');
    if (born != null && year != null) return { age: year - born, how: 'born' };
    return { age: null, how: 'unknown' };
  }

  /** The scenes in reading order, each with its plan, its story year and who is in it. */
  private scenes(projectId: string) {
    const chapters = this.ms.outline(projectId) as unknown as (Row & { scenes: Row[] })[];
    const links = this.brain.links(projectId) as Row[];
    const out: { sceneId: string; title: string; chapter: string; chapterId: string; planId: string | null; year: number | null; people: string[] }[] = [];
    for (const c of chapters) for (const s of c.scenes) {
      const planId = (s.plan_element_id as string | null) ?? null;
      const people = new Set<string>();
      if (s.pov_element_id) people.add(s.pov_element_id as string);
      if (planId) for (const l of links) if (l.to_id === planId && PRESENT.has(l.relation as string)) people.add(l.from_id as string);
      out.push({ sceneId: s.id as string, title: s.title as string, chapter: c.title as string, chapterId: c.id as string, planId, year: planId ? this.year(planId, 'story_year') : null, people: [...people] });
    }
    return out;
  }

  /** Who is in this scene, and how old each of them is. */
  agesInScene(sceneId: string) {
    const s = this.ms.scene(sceneId);
    const row = this.scenes(s.project_id as string).find((x) => x.sceneId === sceneId);
    if (!row) return { year: null, people: [] };
    const people = row.people.map((id) => this.brain.element(id)).filter((e) => e.kind === 'character' && !e.deleted_at)
      .map((e) => ({ id: e.id as string, title: e.title as string, ...this.ageIn(e.id as string, row.year) }));
    return { year: row.year, people };
  }

  /** One character across the book: their age in every scene they are in, and their other selves. */
  character(characterId: string) {
    const el = this.brain.element(characterId);
    const pid = el.project_id as string;
    const scenes = this.scenes(pid).filter((x) => x.people.includes(characterId))
      .map((x) => ({ sceneId: x.sceneId, title: x.title, chapter: x.chapter, year: x.year, ...this.ageIn(characterId, x.year) }));
    const links = this.brain.linksOf(characterId) as Row[];
    const selfIds = new Set<string>();
    for (const l of links) if (l.relation === 'same_person_as') selfIds.add((l.from_id === characterId ? l.to_id : l.from_id) as string);
    const selves = [...selfIds].map((id) => this.brain.element(id)).filter((e) => !e.deleted_at)
      .map((e) => ({ id: e.id as string, title: e.title as string, ...this.ageIn(e.id as string, null) }))
      .sort((a, b) => (a.age ?? 999) - (b.age ?? 999));
    return { born: this.year(characterId, 'born'), fixedAge: this.year(characterId, 'fixed_age'), scenes, selves };
  }

  /** Chapter by chapter: the reader responses she is aiming for, gathered from the scene cards. */
  readerMap(projectId: string) {
    const outline = this.ms.outline(projectId) as unknown as (Row & { scenes: Row[] })[];
    const chapters = outline.map((c, i) => {
      const scenes = c.scenes.map((sc) => ({ title: sc.title as string, responses: sc.plan_element_id ? this.values(sc.plan_element_id as string, 'reader_response') : [] }));
      return { chapterId: c.id as string, title: c.title as string, number: i + 1, responses: [...new Set(scenes.flatMap((x) => x.responses))], scenes };
    });
    const counts: Record<string, number> = {};
    for (const c of chapters) for (const x of c.responses) counts[x] = (counts[x] ?? 0) + 1;
    return { chapters, counts, withNone: chapters.filter((c) => !c.responses.length).map((c) => c.number) };
  }

  /** The songs, in the order they first play in the book; songs not placed yet come last. */
  soundtrack(projectId: string) {
    const rows = this.scenes(projectId);
    const at = new Map(rows.map((r, i) => [r.planId, i]));
    const links = this.brain.links(projectId) as Row[];
    const songs = this.brain.elements(projectId, { kind: 'song' }) as Row[];
    return songs.map((s) => {
      const plays = links.filter((l) => l.from_id === s.id && l.relation === 'plays_in').map((l) => rows.find((r) => r.planId === l.to_id)).filter(Boolean) as typeof rows;
      plays.sort((a, b) => (at.get(a.planId) ?? 0) - (at.get(b.planId) ?? 0));
      const belongsTo = links.filter((l) => l.from_id === s.id && l.relation === 'theme_song_of').map((l) => this.brain.element(l.to_id as string).title as string);
      return {
        id: s.id as string, title: s.title as string, artist: String(this.value(s.id as string, 'artist') ?? ''),
        carries: String(this.value(s.id as string, 'carries') ?? ''), plays: plays.map((p) => ({ title: p.title, chapter: p.chapter })), belongsTo,
        first: plays.length ? at.get(plays[0]!.planId) ?? Infinity : Infinity,
      };
    }).sort((a, b) => a.first - b.first || a.title.localeCompare(b.title)).map(({ first, ...rest }) => rest);
  }

  /** Add a set of interview questions to a character, or one question of her own. Questions already asked are not repeated. */
  addInterview(characterId: string, input: { set?: string; question?: string }) {
    const el = this.brain.element(characterId);
    if (el.kind !== 'character') throw new ValidationError('Interviews belong to characters.');
    const pid = el.project_id as string;
    const set = INTERVIEW_SETS.find((x) => x.key === input.set);
    const questions = set ? set.questions : input.question?.trim() ? [input.question.trim().slice(0, 300)] : [];
    const asked = new Set((this.brain.elements(pid, { kind: 'interview' }) as Row[]).filter((e) => e.parent_id === characterId).map((e) => String(e.title)));
    const made: string[] = [];
    const base = Date.now();
    questions.filter((q) => !asked.has(q)).forEach((q, i) => made.push(this.brain.createElement(pid, { kind: 'interview', title: q, parentId: characterId, sortKey: base + i, attrs: set ? { set: set.key } : {} }).id as string));
    return { added: made.length };
  }
}
