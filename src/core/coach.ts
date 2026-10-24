// The push coach: during a writing push (any length, such as November and 50,000 words), Where was I?'s
// Today page carries a short note for the day, a line about a writer, about writing or just for fun,
// the milestones that mean something, plain help with pace, a line about where the next scene sits in
// the book, and the next unwritten scene when she's stuck.
//
// Notes are chosen by phase, not by day number, so any length moves through a beginning, a middle and an
// end. Something that happened (a comeback, a big day, a long run, a rest day, falling far behind or
// getting far ahead) takes the day's place first. Nothing repeats until everything of its kind has been
// seen, across every push and every novel on this computer; then the longest-unseen comes back first.
// Her own notes mix in. Craft advice is taught in Story Canon's own words and credited; facts are true
// and sourced in the library files.

import type { Store, Row } from './store.js';
import type { Brain } from './brain.js';
import type { Structure } from './structure.js';
import type { Progress } from './progress.js';
import { daysBetween, addDays } from './progress.js';
import { settingsOf } from './settings.js';
import NOTES_RAW from './data/coach-notes.json' with { type: 'json' };
import SPOTS_RAW from './data/coach-spotlights.json' with { type: 'json' };

export interface CoachNote { id: string; kind: string; title: string; body: string; from?: string }
export interface Spotlight { id: string; kind: 'writer' | 'writing' | 'fun'; text: string; source?: string }

export const NOTES = NOTES_RAW as CoachNote[];
export const SPOTLIGHTS = SPOTS_RAW as Spotlight[];

export const PHASES = ['before', 'start', 'early', 'slump', 'middle', 'pressure', 'dark', 'home', 'almost', 'last', 'after'] as const;
export const EVENTS = ['restday', 'comeback', 'bigday', 'streak', 'behind', 'ahead'] as const;

/** Milestones as shares of the push goal, with what each one means for the book. */
export const MILESTONES: { share: number; title: string; body: string }[] = [
  { share: 0.1, title: 'The first tenth', body: 'The hardest words of any push are the first ones, and they are behind you. You have proved the habit exists.' },
  // Milestones are shares of the push, not of the book: a push may be a whole short novel or one stretch of a long one,
  // so none of them names a beat. Where she is in the story comes from her own plan.
  { share: 0.25, title: 'A quarter of the way', body: 'The start-up cost of this push is paid. From here the work is keeping the rhythm, not finding it.' },
  { share: 0.5, title: 'Halfway', body: 'Every word left in this push is fewer than you have already written. If the draft feels different now than it did on the first day, it is finding its feet.' },
  { share: 0.75, title: 'Three quarters', body: 'This stretch often feels darkest, for writers and heroes alike. The end is close enough to see. Keep going.' },
  { share: 0.9, title: 'Ninety percent', body: 'You can finish from here on ordinary days. No heroics needed.' },
  { share: 1, title: 'You reached your goal', body: 'You set a goal and kept it. Whatever the draft needs next, it exists now, and a draft that exists can be made better. One that does not exist cannot.' },
];

/** The phase of day i (0-based) of a push n days long. */
export function phaseOf(i: number, n: number): string {
  if (n <= 1 || i >= n - 1) return 'last';
  if (i <= 0) return 'start';
  if (i === n - 2) return 'almost';
  const f = i / (n - 1);
  return f < 0.2 ? 'early' : f < 0.35 ? 'slump' : f < 0.55 ? 'middle' : f < 0.7 ? 'pressure' : f < 0.82 ? 'dark' : 'home';
}

/** A small stable hash, so ties are broken the same way every time but differently for each novel. */
function hash(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

/** The one never seen, or else the one seen longest ago; ties go the same way every time. */
export function pick<T extends { id: string }>(items: T[], lastSeen: Map<string, string>, salt: string): T | null {
  if (!items.length) return null;
  return [...items].sort((a, b) => {
    const la = lastSeen.get(a.id) ?? '', lb = lastSeen.get(b.id) ?? '';
    return la === lb ? hash(salt + a.id) - hash(salt + b.id) : la < lb ? -1 : 1;
  })[0]!;
}

/** When a phase has shown every note it has in this push, the phases beside it lend theirs, nearest first. */
const NEIGHBORS: Record<string, string[]> = {
  early: ['slump', 'middle'], slump: ['early', 'middle'], middle: ['pressure', 'slump'], pressure: ['middle', 'dark'],
  dark: ['pressure', 'home'], home: ['dark', 'pressure'], before: [], after: [], start: ['early'], almost: ['home'], last: ['almost'],
};

const fmt = (n: number) => n.toLocaleString('en-US');
interface LogEntry { project: string; day: string; note: string; spot: string | null }

export class Coach {
  constructor(private store: Store, private brain: Brain, private structure: Structure, private progress: Progress,
    private library: { notes: CoachNote[]; spotlights: Spotlight[] } = { notes: NOTES, spotlights: SPOTLIGHTS }) {}

  // ---------- what she has seen, and her own notes (kept on this computer, and with each novel) ----------
  private get(key: string): any { const r = this.store.db.prepare('SELECT value_json FROM settings WHERE key=?').get(key) as Row | undefined; return r ? JSON.parse(r.value_json as string) : null; }
  private put(key: string, v: unknown) { this.store.db.prepare('INSERT INTO settings(key,value_json) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json').run(key, JSON.stringify(v)); }
  private log(): LogEntry[] { return (this.get('coach_log') as LogEntry[] | null) ?? []; }
  private profile(projectId: string) { const p = this.store.get('projects', projectId); return p?.profile_json ? JSON.parse(p.profile_json as string) : {}; }

  /** Her own notes: the ones on this computer and the ones that came with this novel, together. */
  ownNotes(projectId?: string): string[] {
    const here = (this.get('coach_own') as string[] | null) ?? [];
    const withNovel = projectId ? settingsOf(this.profile(projectId)).coachOwn : [];
    const all = [...here, ...withNovel.filter((n) => !here.includes(n))];
    if (all.length !== here.length) this.put('coach_own', all);
    return all;
  }
  /** Replace her own notes. They are kept on this computer and with this novel, so they travel to her other computer. */
  setOwnNotes(projectId: string, notes: string[]) {
    const clean = [...new Set(notes.map((n) => n.trim()).filter(Boolean))].slice(0, 200).map((n) => n.slice(0, 500));
    this.put('coach_own', clean);
    this.brain.updateSettings(projectId, { coachOwn: clean });
    return clean;
  }

  /**
   * Everything the coach says today. `wpm` is her own sprint pace in words a minute, measured on this
   * computer, when she has run sprints; without it the coach speaks in words a day only.
   */
  today(projectId: string, opts: { tz?: string; now?: Date; wpm?: number | null } = {}) {
    const st = settingsOf(this.profile(projectId));
    const r = this.progress.progress(projectId, { tz: opts.tz, now: opts.now });
    if (!st.coach || !r.push) return { show: false as const };
    const daysTotal = r.days.length;
    const name = r.push.name || 'Your writing push';
    const base = { show: true as const, name, daysTotal, goal: r.goal, total: r.total };
    const phase = r.status === 'ahead' ? 'before' : r.status === 'ended' ? 'after' : null;
    const dayNo = phase ? null : daysBetween(r.start, r.today) + 1;

    // What happened, which takes the day's place first.
    const calendar = phase ?? phaseOf(dayNo! - 1, daysTotal);
    let kind = calendar;
    if (!phase) {
      const past = r.days.filter((d) => d.day < r.today);
      const yesterday = past[past.length - 1];
      const evenPace = r.goal ? r.goal / daysTotal : 0;
      if (r.dailyGoal === 0 && r.todaySet) kind = 'restday';
      else if (yesterday && yesterday.words <= 0 && !(yesterday.set && yesterday.goal === 0) && past.some((d) => d.words > 0)) kind = 'comeback';
      else if (yesterday && past.length >= 2 && yesterday.words > 0 && past.slice(0, -1).every((d) => d.words < yesterday.words)) kind = 'bigday';
      else if (r.streak >= 7 && r.streak % 7 === 0 && r.todayWords <= 0) kind = 'streak';
      // Being far behind or far ahead can last for days; it takes about one day in three, so the rest of the coach still speaks.
      else if (dayNo! % 3 === 0 && r.behind != null && evenPace > 0 && r.behind > 3 * evenPace) kind = 'behind';
      else if (dayNo! % 3 === 0 && r.behind != null && evenPace > 0 && -r.behind > 3 * evenPace) kind = 'ahead';
      // The first and last days always keep their own notes.
      if (calendar === 'start' || calendar === 'last' || !this.library.notes.some((n) => n.kind === kind)) kind = calendar;
    }

    const { note, spotlight } = this.choose(projectId, r.today, kind, calendar, r.start);
    const head = { ...base, kind, note, spotlight, where: this.where(projectId) };

    if (phase === 'before') return { ...head, phase: 'before' as const, daysUntil: daysBetween(r.today, r.start), milestone: null, next: null, pace: null, stuck: this.stuck(projectId) };
    if (phase === 'after') {
      const written = r.days.filter((d) => d.words > 0);
      const best = written.reduce<{ day: string; words: number } | null>((a, d) => (!a || d.words > a.words ? { day: d.day, words: d.words } : a), null);
      return { ...head, phase: 'after' as const, milestone: null, next: null, pace: null, stuck: null, where: null,
        recap: { total: r.total, goal: r.goal, met: r.goal != null && r.total >= r.goal, daysWritten: written.length, daysTotal, best, streak: r.streak } };
    }

    // A milestone crossed in the last two days stays on the page, so it is not missed.
    let milestone: { title: string; body: string; words: number; when: 'today' | 'yesterday' } | null = null;
    let next: { title: string; words: number; toGo: number } | null = null;
    if (r.goal) {
      const through = (day: string) => r.days.filter((d) => d.day <= day && !d.future).reduce((a, d) => a + d.words, 0);
      const before = (day: string) => through(addDays(day, -1));
      const yesterday = addDays(r.today, -1);
      for (const m of MILESTONES) {
        const at = Math.ceil(m.share * r.goal);
        if (r.total >= at && before(r.today) < at) milestone = { title: m.title, body: m.body, words: at, when: 'today' };
        else if (!milestone && yesterday >= r.start && through(yesterday) >= at && before(yesterday) < at && r.total >= at) milestone = { title: m.title, body: m.body, words: at, when: 'yesterday' };
      }
      const upcoming = MILESTONES.find((m) => r.total < Math.ceil(m.share * r.goal!));
      if (upcoming) next = { title: upcoming.title, words: Math.ceil(upcoming.share * r.goal), toGo: Math.ceil(upcoming.share * r.goal) - r.total };
    }
    return { ...head, phase: 'during' as const, dayNo, milestone, next, pace: this.pace(r, opts.wpm ?? null), stuck: this.stuck(projectId) };
  }

  /** Today's note and line. Chosen once a day and kept, so the page says the same thing all day. */
  private choose(projectId: string, day: string, kind: string, calendar: string, pushStart: string): { note: CoachNote; spotlight: Spotlight | null } {
    const log = this.log();
    const byId = new Map(this.library.notes.map((n) => [n.id, n]));
    const own = this.ownNotes(projectId).map((text) => ({ id: `own-${hash(text).toString(36)}`, kind: 'own', title: 'In your own words', body: text } as CoachNote));
    own.forEach((n) => byId.set(n.id, n));
    const spotById = new Map(this.library.spotlights.map((s) => [s.id, s]));
    const kept = log.find((e) => e.project === projectId && e.day === day);
    if (kept && byId.has(kept.note)) return { note: byId.get(kept.note)!, spotlight: kept.spot ? spotById.get(kept.spot) ?? null : null };

    const lastSeen = new Map<string, string>();
    for (const e of log) { const k = `${e.day}:${e.project}`; for (const id of [e.note, e.spot]) if (id && (lastSeen.get(id) ?? '') < k) lastSeen.set(id, k); }
    const ordinal = log.filter((e) => e.project === projectId).length;

    // Her own notes take about one ordinary day in four.
    const ordinary = PHASES.includes(kind as never) && kind !== 'start' && kind !== 'last';
    let note: CoachNote | null = null;
    if (own.length && ordinary && ordinal % 4 === 3) note = pick(own, lastSeen, projectId);
    // Something not yet seen in this push: the day's own kind first; an event that has used up its notes in this push
    // gives way to the calendar; a phase that has used up its notes borrows from the phases beside it.
    const freshThisPush = (n: { id: string }) => { const k = lastSeen.get(n.id); return !k || k.slice(0, 10) < pushStart || !k.endsWith(`:${projectId}`); };
    const order = [kind, ...(kind !== calendar ? [calendar] : []), ...(NEIGHBORS[calendar] ?? [])];
    for (const k of order) {
      if (note) break;
      const fresh = this.library.notes.filter((n) => n.kind === k && freshThisPush(n));
      if (fresh.length) note = pick(fresh, lastSeen, projectId);
    }
    note ??= pick(this.library.notes.filter((n) => n.kind === kind), lastSeen, projectId) ?? pick(this.library.notes, lastSeen, projectId)!;

    // The line under it: just for fun on rest days, after a big day, and every third day; otherwise writers, then writing.
    const fun = kind === 'restday' || kind === 'bigday' || ordinal % 3 === 2;
    const spotKind: Spotlight['kind'] = fun ? 'fun' : ordinal % 3 === 1 ? 'writing' : 'writer';
    const spotOrder: Spotlight['kind'][] = [spotKind, ...(['writer', 'writing', 'fun'] as const).filter((k) => k !== spotKind)];
    let spotlight: Spotlight | null = null;
    for (const k of spotOrder) {
      const fresh = this.library.spotlights.filter((x) => x.kind === k && freshThisPush(x));
      if (fresh.length) { spotlight = pick(fresh, lastSeen, projectId); break; }
    }
    spotlight ??= pick(this.library.spotlights.filter((x) => x.kind === spotKind), lastSeen, projectId) ?? pick(this.library.spotlights, lastSeen, projectId);

    log.push({ project: projectId, day, note: note.id, spot: spotlight?.id ?? null });
    this.put('coach_log', log.slice(-3000));
    return { note, spotlight };
  }

  /** Behind, ahead or on pace, in plain numbers, with what it takes. Never a scolding. */
  private pace(r: ReturnType<Progress['progress']>, wpm: number | null) {
    if (r.goal == null || r.behind == null) return null;
    const need = r.dailyGoal ?? 0;
    const left = Math.max(0, need - Math.max(0, r.todayWords));
    const sprints = wpm && wpm > 0 && left > 0 ? Math.max(1, Math.ceil(left / (wpm * 30))) : null;
    const sprintLine = sprints ? ` At your sprint pace, about ${fmt(Math.round(wpm! * 30))} words in 30 minutes, that is ${sprints === 1 ? 'one sprint' : `${sprints} sprints`}.` : '';
    const still = left < need ? `, and ${fmt(left)} are still to go` : '';
    if (r.remaining === 0) return { kind: 'done' as const, text: `You have reached ${fmt(r.goal)}. Everything you write from here is extra.` };
    if (r.behind > 0) return { kind: 'behind' as const, text: `You are ${fmt(r.behind)} words behind an even pace. That is already spread over the ${r.daysLeft} days left, so today asks ${fmt(need)}${still}.${sprintLine} Nothing else has to change.` };
    if (r.behind < 0) return { kind: 'ahead' as const, text: `You are ${fmt(-r.behind)} words ahead of an even pace. Today asks ${fmt(need)}${still}.${sprintLine} The extra is yours to bank or to rest on.` };
    return { kind: 'on' as const, text: `You are right on pace. Today asks ${fmt(need)}${still}.${sprintLine}` };
  }

  /** Where the next unwritten scene sits in the book, with what that beat asks, from her own beat sheet. */
  private where(projectId: string) {
    const s = this.stuck(projectId);
    if (!s?.beatId) return null;
    try {
      const d = this.structure.beatDetail(s.beatId) as any;
      const ask = (d?.def?.test as string | undefined) || String(d?.def?.description ?? '').split(/(?<=[.!?])\s+/)[0] || '';
      return { beat: s.beat, text: ask.trim() || null };
    } catch { return null; }
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
    return { cardId: card.id, title: card.title, beat: card.beat, beatId: card.beatId, sceneId: card.sceneId, purpose: purpose || null, turn: start || end ? `${start || '?'} to ${end || '?'}` : null, conflict: conflict || null, question };
  }
}
