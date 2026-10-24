// Drafting progress: words written each day against the daily goal, the running total for a
// writing push (such as November) or the current month, and how many days in a row she has written.
//
// A day's words are counted from the scene's own saved versions: what typing added, minus what
// typing cut. Bringing in a manuscript, an editor's changes, and restoring an earlier version are
// not writing, so they never count toward a day.

import { Store } from './store.js';
import { Manuscript } from './manuscript.js';
import { settingsOf, WritingPush } from './settings.js';

export interface ProgressDay { day: string; words: number; future: boolean; today: boolean }

const DAY_MS = 86_400_000;

/** Calendar day (YYYY-MM-DD) of an instant, in the author's own time zone. */
export function dayIn(tz: string | undefined, at: Date): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || undefined, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
  } catch {
    return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
  }
}

export function addDays(day: string, n: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + n * DAY_MS).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS);
}

/** A push is shown from two weeks before it starts until a week after it ends. */
export function pushInView(push: WritingPush | null, today: string): boolean {
  return !!push && daysBetween(today, push.start) <= 14 && daysBetween(push.end, today) <= 7;
}

export class Progress {
  constructor(private store: Store, private ms: Manuscript) {}

  /** Net words typed on each day, keyed by day in the author's time zone. */
  dailyWords(projectId: string, tz?: string): Map<string, number> {
    const rows = this.store.db.prepare(
      `SELECT r.scene_id, r.word_count, r.reason, r.created_at FROM scene_revisions r JOIN scenes s ON s.id = r.scene_id
       WHERE s.project_id = ? ORDER BY r.scene_id, r.created_at, r.version`,
    ).all(projectId) as { scene_id: string; word_count: number; reason: string; created_at: string }[];
    const byDay = new Map<string, number>();
    let scene = '', prev = 0;
    for (const r of rows) {
      if (r.scene_id !== scene) { scene = r.scene_id; prev = 0; }
      if (r.reason === 'save') {
        const day = dayIn(tz, new Date(r.created_at));
        byDay.set(day, (byDay.get(day) ?? 0) + (r.word_count - prev));
      }
      prev = r.word_count;
    }
    return byDay;
  }

  /** Net words typed since an instant, across every scene: what a sprint wrote, even past midnight. */
  wordsSince(projectId: string, at: string): number {
    const rows = this.store.db.prepare(
      `SELECT r.scene_id, r.word_count, r.reason, r.created_at FROM scene_revisions r JOIN scenes s ON s.id = r.scene_id
       WHERE s.project_id = ? ORDER BY r.scene_id, r.created_at, r.version`,
    ).all(projectId) as { scene_id: string; word_count: number; reason: string; created_at: string }[];
    let scene = '', prev = 0, n = 0;
    for (const r of rows) {
      if (r.scene_id !== scene) { scene = r.scene_id; prev = 0; }
      if (r.reason === 'save' && r.created_at >= at) n += r.word_count - prev;
      prev = r.word_count;
    }
    return n;
  }

  progress(projectId: string, opts: { tz?: string; now?: Date } = {}) {
    const p = this.store.get('projects', projectId);
    const st = settingsOf(p?.profile_json ? JSON.parse(p.profile_json as string) : {});
    const today = dayIn(opts.tz, opts.now ?? new Date());
    const words = this.dailyWords(projectId, opts.tz);

    const push = pushInView(st.push, today) ? st.push! : null;
    const set = st.dayGoals;
    // A push's days are measured against its own pace; any other stretch against the everyday goal.
    const everyday = st.goal.type === 'words' && st.goal.target ? st.goal.target : null;
    const start = push ? push.start : `${today.slice(0, 8)}01`;
    const end = push ? push.end : addDays(addDays(`${today.slice(0, 8)}01`, 32).slice(0, 8) + '01', -1);
    const range: string[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) range.push(d);
    const w = (d: string) => words.get(d) ?? 0;

    // Each day's goal. A day she set keeps her number. With a push, every other day carries an even
    // share of what is still left, worked out from the words written before that day, so a short day
    // spreads its difference over the days after it and a set day never moves.
    const goalOf = new Map<string, number | null>();
    let pace: number | null = null, shortfall = 0, planned = 0;
    if (push?.words) {
      // For a day already gone, days set from today on are not counted: a day you set ahead never
      // changes what an earlier day asked of you.
      const share = (from: number, left: number, pastDay = false) => {
        let reserved = 0, free = 0;
        for (let i = from; i < range.length; i++) { const d = range[i]!; const v = pastDay && d >= today ? undefined : set[d]; if (v != null) reserved += v; else free++; }
        return { free, need: left - reserved };
      };
      // "Ahead" and "behind" are measured against an even share of the whole push for each day gone
      // by, or her own number on a day she set. Days she sets ahead of time never change the past.
      // A day she set that has gone by counts as her number, and whatever it left undone is shared
      // by the other days, so a rest day is never held against her and never hides a real gap.
      const pastSet = range.filter((d) => d < today && set[d] != null);
      const pastSetWords = pastSet.reduce((a, d) => a + set[d]!, 0);
      const evenPace = range.length > pastSet.length ? Math.max(0, Math.ceil((push.words - pastSetWords) / (range.length - pastSet.length))) : 0;
      const first = share(0, push.words);
      const basePace = first.free > 0 ? Math.max(0, Math.ceil(first.need / first.free)) : 0;
      let written = 0;
      for (let i = 0; i < range.length; i++) {
        const d = range[i]!;
        if (d > today) break;
        if (d < today) planned += set[d] ?? evenPace;
        const { free, need } = share(i, push.words - written, d < today);
        const p = free > 0 ? Math.max(0, Math.ceil(need / free)) : 0;
        if (d === today) { pace = free > 0 ? p : (need <= 0 ? 0 : null); shortfall = free > 0 ? 0 : Math.max(0, need); }
        goalOf.set(d, set[d] ?? p);
        written += w(d);
      }
      if (today < start) { pace = first.free > 0 ? basePace : (first.need <= 0 ? 0 : null); shortfall = first.free > 0 ? 0 : Math.max(0, first.need); }
      for (const d of range) if (!goalOf.has(d)) goalOf.set(d, set[d] ?? pace ?? 0);
    } else {
      for (const d of range) goalOf.set(d, set[d] ?? everyday);
    }
    const daily = goalOf.has(today) ? goalOf.get(today)! : (set[today] ?? everyday);

    const days: (ProgressDay & { goal: number | null; set: boolean })[] = range.map((d) => ({ day: d, words: w(d), future: d > today, today: d === today, goal: goalOf.get(d) ?? null, set: set[d] != null }));
    const total = days.reduce((a, d) => a + (d.future ? 0 : d.words), 0);
    const beforeToday = days.reduce((a, d) => a + (d.day < today ? d.words : 0), 0);

    // Days in a row with words written. Today still counts as open until it ends, and a rest day
    // she set herself never breaks the run.
    let streak = 0;
    const floor = addDays(today, -800);
    for (let d = w(today) > 0 ? today : addDays(today, -1); d > floor && (w(d) > 0 || set[d] === 0); d = addDays(d, -1)) if (w(d) > 0) streak++;

    const goal = push?.words ?? null;
    const started = today >= start, ended = today > end;
    const daysLeft = started && !ended ? daysBetween(today, end) + 1 : !started ? daysBetween(start, end) + 1 : 0;
    const remaining = goal != null ? Math.max(0, goal - total) : null;
    return {
      today, start, end,
      push: push ? { name: push.name, words: push.words } : null,
      status: !started ? 'ahead' as const : ended ? 'ended' as const : 'running' as const,
      dailyGoal: daily,
      todaySet: set[today] != null,
      todayWords: w(today),
      days, total, goal, remaining, daysLeft,
      /** Against the plan as it stood on the first day: positive is behind, negative is ahead. Counted to the end of yesterday. */
      behind: goal != null && started && !ended ? planned - beforeToday : null,
      /** Words her set days leave with no day to write them in. */
      shortfall,
      setDays: Object.entries(set).filter(([d]) => d >= today).sort(([a], [b]) => a.localeCompare(b)).map(([day, n]) => ({ day, words: n })),
      /** The pace for the days she has not set, from today to the end. */
      perDayNeeded: goal != null ? (remaining === 0 ? 0 : pace) : null,
      /** Once today's goal is met: the pace for the days after today, counting what today brought. */
      afterToday: (() => {
        if (goal == null || !started || ended || today === end) return null;
        let reserved = 0, free = 0;
        for (const d of range) if (d > today) { if (set[d] != null) reserved += set[d]!; else free++; }
        return free > 0 ? { perDay: Math.max(0, Math.ceil((goal - total - reserved) / free)), days: daysBetween(today, end) } : null;
      })(),
      streak,
      bookWords: this.ms.totalWords(projectId),
      targetWords: st.targetWords,
    };
  }

  /**
   * The bookcase: one shelf for each push that has begun, newest first, with every day of it. A day's book
   * is as thick as its words; it is in ink when the day met its goal (a day she set keeps her number,
   * any other day an even share of the push), in pencil when it fell short. A rest day she set is a chair.
   */
  shelves(projectId: string, opts: { tz?: string; now?: Date } = {}) {
    const p = this.store.get('projects', projectId);
    const st = settingsOf(p?.profile_json ? JSON.parse(p.profile_json as string) : {});
    const today = dayIn(opts.tz, opts.now ?? new Date());
    const words = this.dailyWords(projectId, opts.tz);
    const key = (x: { start: string; end: string; name: string }) => `${x.start}|${x.end}|${x.name ?? ''}`;
    const all = [...st.pastPushes, ...(st.push ? [st.push] : [])].filter((x) => x.start <= today);
    const seen = new Set<string>();
    const pushes = all.filter((x) => (seen.has(key(x)) ? false : (seen.add(key(x)), true))).sort((a, b) => b.start.localeCompare(a.start));
    return pushes.map((push) => {
      const range: string[] = [];
      for (let d = push.start; d <= push.end; d = addDays(d, 1)) range.push(d);
      const even = push.words ? Math.ceil(push.words / range.length) : null;
      const days = range.map((d) => {
        const w = words.get(d) ?? 0, set = st.dayGoals[d];
        const goal = set ?? even;
        return { day: d, words: w, rest: set === 0, met: goal != null ? w >= goal && w > 0 : w > 0, today: d === today, future: d > today };
      });
      const total = days.reduce((a, d) => a + (d.future ? 0 : d.words), 0);
      return { name: push.name, start: push.start, end: push.end, goal: push.words, total, done: today > push.end, current: !!st.push && key(push) === key(st.push), days, dayNo: today <= push.end ? range.indexOf(today) + 1 : range.length, daysTotal: range.length };
    });
  }
}
