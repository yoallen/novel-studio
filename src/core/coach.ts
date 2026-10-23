// The push coach: during a writing push (such as November and 50,000 words), Where was I's Today page
// carries a short note for the day, marks the milestones that mean something, says plainly what being
// behind or ahead takes, and, when she's stuck, hands her the next unwritten scene with one question.
// Craft advice is taught in Story Canon's own words and credited to the teacher it comes from; nothing
// is quoted. The notes follow the push's own length, so a ten-day push and a sixty-day push both get a
// beginning, a middle and an end.

import type { Store } from './store.js';
import type { Brain } from './brain.js';
import type { Structure } from './structure.js';
import type { Progress } from './progress.js';
import { daysBetween } from './progress.js';
import { settingsOf } from './settings.js';

export interface CoachNote { title: string; body: string; from?: string }

/** Thirty notes for the days of a push, in order. A push of another length is mapped onto them. */
export const PUSH_NOTES: CoachNote[] = [
  { title: 'Start messy', body: 'Today the only job is to begin. The first words of any draft are the hardest and the least important, so let them be rough. You are not writing the book today. You are proving to yourself that you will.', from: "Anne Lamott, Bird by Bird, on messy first drafts" },
  { title: 'Write with the door closed', body: 'A first draft is for you alone. Nobody reads it, so nothing in it has to be good yet. Stephen King writes his first draft with the door closed and opens it only to rewrite. Door closed in Settings does the same for your pages.', from: 'Stephen King, On Writing' },
  { title: 'Keep your hand moving', body: 'When a sentence stalls, write the next one anyway. Don\'t reread, don\'t fix, don\'t look things up. Leave a note for later in double brackets, like [[check the date]], and keep going.', from: 'Natalie Goldberg, Writing Down the Bones' },
  { title: 'Stop while you know what happens next', body: 'End today\'s session in the middle of something you could easily finish. Tomorrow you sit down already knowing the next line, and the hardest part of starting is gone. Hemingway made a habit of it.', from: 'Ernest Hemingway, as he described his working habit' },
  { title: 'One scene at a time', body: 'Fifty thousand words is too big to hold. One scene is not. Open the next card, read its turn and its conflict, and write only that. The book is made of scenes you finished, one after another.', from: 'Anne Lamott, Bird by Bird' },
  { title: 'Every scene turns', body: 'Before you write a scene, ask what is at stake for the viewpoint character when it opens, and how that has changed when it ends. Robert McKee calls a scene that changes nothing a non-event. If you know the turn, the scene knows where it is going.', from: 'Robert McKee, Story' },
  { title: 'Momentum beats perfect', body: 'The habit is worth more than any single page. Look at the columns on this page: every filled one is a day you showed up. If there are gaps, the next filled column starts today. Protect the habit before you protect the words.' },
  { title: 'When the excitement fades', body: 'The excitement of starting fades about now, and the end is still far away. Almost every writer who tries a push like this feels it. It is not a sign the book is failing. It is the middle, and the middle is where books get written.', from: 'Chris Baty, No Plot? No Problem!' },
  { title: 'Lower the bar, not the goal', body: 'If today feels heavy, make the session smaller, not the goal. Set a fifteen minute sprint and write badly on purpose. A rough five hundred words beats a perfect zero, and they count exactly the same.' },
  { title: 'Scene, then sequel', body: 'If you don\'t know what comes next, look at what just happened. Dwight Swain\'s rhythm is a scene of action, then a sequel of reaction: the character feels the blow, faces a dilemma, and makes a decision. That decision is your next scene.', from: 'Dwight Swain, Techniques of the Selling Writer' },
  { title: 'Give them a gap', body: 'Let a character act expecting one result and get another. McKee calls that space the gap. It forces the character to reach deeper, and it gives you something to write when the plot feels stuck.', from: 'Robert McKee, Story' },
  { title: 'Fun and Games is the promise', body: 'In Save the Cat, the stretch after Break into Two is where the story delivers what the premise promised. Ask what a reader picked up this book to see, and write a scene that gives it to them.', from: 'Blake Snyder, Save the Cat!, and Jessica Brody, Save the Cat! Writes a Novel' },
  { title: 'Skip ahead if you need to', body: 'Nothing says you must write in order. If one scene won\'t come, write the one you can\'t wait to write. Leave a note for later where the gap is, and come back when the story has caught up to it.' },
  { title: 'Count what you did, not what you missed', body: 'Look at your total, not at today\'s gap. Every word on the page is a word that did not exist when this push began. If you are behind, the catch-up is already spread over the days left, so today only has to be today.' },
  { title: 'The Midpoint changes direction', body: 'Around halfway, Snyder and Brody put the Midpoint: a false victory or a false defeat that turns the story. If your draft feels like it is drifting, this is the beat that turns it. The stakes go up, and the clock starts.', from: 'Blake Snyder and Jessica Brody' },
  { title: 'Halfway is a real place', body: 'You are past the middle of the push. Whatever happened in the first half, you know your story better now than you did on day one. Write from what you know now, and fix the early pages in the rewrite.' },
  { title: 'Let the bad guys close in', body: 'After the Midpoint, pressure builds from outside and inside at once. If a scene feels slack, take something away from your hero: an ally, a resource, a belief. Pressure writes scenes for you.', from: 'Blake Snyder, Save the Cat!' },
  { title: 'The lie they believe', body: 'Under the plot, your hero is wrong about something. K.M. Weiland calls it the Lie the character believes. Put them in a scene where the Lie costs them, and the scene will mean more than its events.', from: 'K.M. Weiland, Creating Character Arcs' },
  { title: 'Sprint when it\'s hard', body: 'On a day when the words won\'t come, don\'t wait for them. Start a sprint, let everything else disappear, and write until the clock stops. Most writers find the words arrive after they start, not before.' },
  { title: 'Rest is part of the plan', body: 'If you need a lighter day, set it on purpose. A day you set lower spreads its words over the days after it, and it never breaks your run. A planned rest is not quitting. It is pacing.' },
  { title: 'The dark stretch', body: 'Many writers hit their lowest point about here, and so do their heroes. In Save the Cat this is All Is Lost and the Dark Night of the Soul. If the book feels hopeless today, you may be exactly where the story is. Write through it.', from: 'Blake Snyder, Save the Cat!' },
  { title: 'Write the scene you\'re avoiding', body: 'There is usually one scene you keep putting off because it matters too much. Write it today, badly. A rough version of the hardest scene is worth more than a polished version of an easy one.' },
  { title: 'Trust the draft to be fixed', body: 'You will find things to change. Leave notes for later and keep moving. Rewriting is a different job with a different mind, and it gets its own time. This push is for getting it down.', from: 'Stephen King, On Writing' },
  { title: 'Break into Three', body: 'Your hero learns something in the dark and finally acts on it. If you are heading toward the ending, ask what your hero knows now that they did not know at the start, and let them use it.', from: 'Blake Snyder and Jessica Brody' },
  { title: 'The crisis is a choice', body: 'McKee\'s crisis is a true dilemma: two bad choices, or two good things that can\'t both be kept. Make your hero choose, and make it cost them. The choice shows the reader who they really are.', from: 'Robert McKee, Story' },
  { title: 'The end is close enough to see', body: 'From here you can finish on ordinary days. No heroics needed. Keep showing up, keep the sessions small if you need to, and let the finish line pull you.' },
  { title: 'Write the climax big', body: 'Don\'t hold anything back for later. The climax is where every thread you planted pays off. If you planted it, this is the time to pay it off. If you didn\'t, write it anyway and plant it in the rewrite.' },
  { title: 'Ending is a skill too', body: 'Endings feel hard because they have to answer the question the beginning asked. Look at your first scene. Your last one should echo it, changed. Snyder calls it the Final Image: the Opening Image, after everything.', from: 'Blake Snyder, Save the Cat!' },
  { title: 'Almost there', body: 'Tomorrow is the last day. Whatever your total is, you have a draft that did not exist when this push began. Plan tomorrow\'s session tonight: the scene, the time, the place. Then sleep.' },
  { title: 'The last day', body: 'Write today for the joy of finishing. If you reach your goal, celebrate it. If you don\'t, celebrate the words you have, because they are real and they are yours. Either way, write the date down. You did this.' },
];

/** Before the push: the two weeks leading up to it. */
export const BEFORE_NOTES: { from: number; note: CoachNote }[] = [
  { from: 8, note: { title: 'Get ready, not perfect', body: 'In the days before a push, plan just enough to start. Know your lead, what they want, and your first few scenes. A Board with a handful of cards is plenty. The rest you will discover while you write.' } },
  { from: 4, note: { title: 'Clear the decks', body: 'Look at the days ahead and set any lighter days now, so your daily goal already accounts for them. Make a backup. Run a short sprint to make sure everything feels familiar.' } },
  { from: 1, note: { title: 'Tomorrow you begin', body: 'Decide now when and where you will write tomorrow, and the first scene you will open. Leave the program on that scene tonight. When you sit down, all you have to do is start.' } },
];

export const AFTER_NOTE: CoachNote = { title: 'You finished the push', body: 'Take a day or two away from the draft before you read it. When you come back, read it the way a reader would, and write notes for later instead of fixing as you go. The draft exists now, and a draft that exists can be made better.', from: 'Stephen King, On Writing, on letting a draft rest' };

/** Milestones as shares of the push goal, with what each one means for the book. */
export const MILESTONES: { share: number; title: string; body: string }[] = [
  { share: 0.1, title: 'The first tenth', body: 'The hardest words of any push are the first ones, and they are behind you. You have proved the habit exists.' },
  { share: 0.25, title: 'A quarter of the way', body: 'In a book of this length you would be past the Catalyst, the moment the story starts moving. Let it move.' },
  { share: 0.5, title: 'Halfway', body: 'Snyder and Brody put the Midpoint here: the place a story changes direction. If your draft feels different now than it did on day one, the story is finding itself.' },
  { share: 0.75, title: 'Three quarters', body: 'This stretch often feels darkest, for writers and heroes alike. The end is close enough to see. Keep going.' },
  { share: 0.9, title: 'Ninety percent', body: 'You can finish from here on ordinary days. No heroics needed.' },
  { share: 1, title: 'You reached your goal', body: 'Write the date down. Whatever the draft needs next, it exists now, and a draft that exists can be made better. One that does not exist cannot.' },
];

/** Which of the thirty notes belongs to day i (0-based) of a push n days long. */
export function noteIndex(i: number, n: number): number {
  if (n <= 1 || i >= n - 1) return PUSH_NOTES.length - 1;
  if (i <= 0) return 0;
  if (i === n - 2) return PUSH_NOTES.length - 2;
  return Math.min(PUSH_NOTES.length - 3, Math.max(1, Math.floor((i * PUSH_NOTES.length) / n)));
}

const fmt = (n: number) => n.toLocaleString('en-US');

export class Coach {
  constructor(private store: Store, private brain: Brain, private structure: Structure, private progress: Progress) {}

  /**
   * Everything the coach says today. `wpm` is her own sprint pace in words a minute, measured on this
   * computer, when she has run sprints; without it the coach speaks in words a day only.
   */
  today(projectId: string, opts: { tz?: string; now?: Date; wpm?: number | null } = {}) {
    const p = this.store.get('projects', projectId);
    const st = settingsOf(p?.profile_json ? JSON.parse(p.profile_json as string) : {});
    const r = this.progress.progress(projectId, { tz: opts.tz, now: opts.now });
    if (!st.coach || !r.push) return { show: false as const };
    const daysTotal = r.days.length;
    const name = r.push.name || 'Your writing push';
    const base = { show: true as const, name, daysTotal, goal: r.goal, total: r.total };

    if (r.status === 'ahead') {
      const until = daysBetween(r.today, r.start);
      const note = BEFORE_NOTES.find((b) => until >= b.from)?.note ?? BEFORE_NOTES[BEFORE_NOTES.length - 1]!.note;
      return { ...base, phase: 'before' as const, daysUntil: until, note, milestone: null, next: null, pace: null, stuck: this.stuck(projectId) };
    }
    if (r.status === 'ended') {
      const written = r.days.filter((d) => d.words > 0);
      const best = written.reduce<{ day: string; words: number } | null>((a, d) => (!a || d.words > a.words ? { day: d.day, words: d.words } : a), null);
      return { ...base, phase: 'after' as const, note: AFTER_NOTE, milestone: null, next: null, pace: null, stuck: null,
        recap: { total: r.total, goal: r.goal, met: r.goal != null && r.total >= r.goal, daysWritten: written.length, daysTotal, best, streak: r.streak } };
    }

    const dayNo = daysBetween(r.start, r.today) + 1;
    const note = PUSH_NOTES[noteIndex(dayNo - 1, daysTotal)]!;

    // A milestone crossed in the last two days stays on the page, so it is not missed.
    let milestone: { title: string; body: string; words: number; when: 'today' | 'yesterday' } | null = null;
    let next: { title: string; words: number; toGo: number } | null = null;
    if (r.goal) {
      const byDay = new Map(r.days.map((d) => [d.day, d.words]));
      const totalThrough = (day: string) => r.days.filter((d) => d.day <= day && !d.future).reduce((a, d) => a + d.words, 0);
      const yesterday = r.days.find((d, i) => r.days[i + 1]?.day === r.today)?.day;
      const before = (day: string | undefined) => (day ? totalThrough(day) - (byDay.get(day) ?? 0) : 0);
      for (const m of MILESTONES) {
        const at = Math.ceil(m.share * r.goal);
        if (r.total >= at && before(r.today) < at) milestone = { title: m.title, body: m.body, words: at, when: 'today' };
        else if (!milestone && yesterday && totalThrough(yesterday) >= at && before(yesterday) < at && r.total >= at) milestone = { title: m.title, body: m.body, words: at, when: 'yesterday' };
      }
      const upcoming = MILESTONES.find((m) => r.total < Math.ceil(m.share * r.goal!));
      if (upcoming) next = { title: upcoming.title, words: Math.ceil(upcoming.share * r.goal), toGo: Math.ceil(upcoming.share * r.goal) - r.total };
    }

    return { ...base, phase: 'during' as const, dayNo, note, milestone, next, pace: this.pace(r, opts.wpm ?? null), stuck: this.stuck(projectId) };
  }

  /** Behind, ahead or on pace, in plain numbers, with what it takes. Never a scolding. */
  private pace(r: ReturnType<Progress['progress']>, wpm: number | null) {
    if (r.goal == null || r.behind == null) return null;
    const need = r.dailyGoal ?? 0;
    const left = Math.max(0, need - Math.max(0, r.todayWords));
    const sprints = wpm && wpm > 0 && left > 0 ? Math.max(1, Math.ceil(left / (wpm * 30))) : null;
    const sprintLine = sprints ? ` At your sprint pace, about ${fmt(Math.round(wpm! * 30))} words in 30 minutes, that is ${sprints === 1 ? 'one sprint' : `${sprints} sprints`}.` : '';
    if (r.remaining === 0) return { kind: 'done' as const, text: `You have reached ${fmt(r.goal)}. Everything you write from here is extra.` };
    if (r.behind > 0) {
      return { kind: 'behind' as const, text: `You are ${fmt(r.behind)} words behind an even pace. That is already spread over the ${r.daysLeft} days left, so today asks ${fmt(need)}${left < need ? `, and ${fmt(left)} are still to go` : ''}.${sprintLine} Nothing else has to change.` };
    }
    if (r.behind < 0) {
      return { kind: 'ahead' as const, text: `You are ${fmt(-r.behind)} words ahead of an even pace. Today asks ${fmt(need)}${left < need ? `, and ${fmt(left)} are still to go` : ''}.${sprintLine} The extra is yours to bank or to rest on.` };
    }
    return { kind: 'on' as const, text: `You are right on pace. Today asks ${fmt(need)}${left < need ? `, and ${fmt(left)} are still to go` : ''}.${sprintLine}` };
  }

  /** The next scene card with no words yet, in story order, with one question to start on. */
  stuck(projectId: string) {
    const order = this.structure.plannedOrder(projectId);
    const card = order.find((c) => !c.words || c.words <= 0);
    if (!card) return null;
    const val = (field: string) => { const v = this.brain.field(card.id, field).latest?.value; return v == null ? '' : typeof v === 'string' ? v.trim() : JSON.stringify(v); };
    const start = val('value_start'), end = val('value_end'), conflict = val('conflict'), purpose = val('purpose');
    const question = !conflict
      ? 'Who wants something in this scene, and who or what stands in the way?'
      : !start || !end
        ? 'What is at stake for your viewpoint character when this scene opens, and how is it different when it ends?'
        : 'What does your viewpoint character expect to happen here, and what happens instead?';
    return { cardId: card.id, title: card.title, beat: card.beat, sceneId: card.sceneId, purpose: purpose || null, turn: start || end ? `${start || '?'} to ${end || '?'}` : null, conflict: conflict || null, question };
  }
}
