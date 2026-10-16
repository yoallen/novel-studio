// Drafting progress: words written each day against the daily goal, the running total for a
// writing push (such as November) or the current month, and how many days in a row she has written.
//
// A day's words are counted from the scene's own saved versions: what typing added, minus what
// typing cut. Bringing in a manuscript, an editor's changes, and restoring an earlier version are
// not writing, so they never count toward a day.

import { Store } from './store.js';
import { Manuscript } from './manuscript.js';
import { settingsOf, WritingPush } from './settings.js';
import { pushPace } from './goals.js';

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

  progress(projectId: string, opts: { tz?: string; now?: Date } = {}) {
    const p = this.store.get('projects', projectId);
    const st = settingsOf(p?.profile_json ? JSON.parse(p.profile_json as string) : {});
    const today = dayIn(opts.tz, opts.now ?? new Date());
    const words = this.dailyWords(projectId, opts.tz);

    const push = pushInView(st.push, today) ? st.push! : null;
    // A push's days are measured against its own pace; any other stretch against the everyday goal.
    const everyday = st.goal.type === 'words' && st.goal.target ? st.goal.target : null;
    const daily = push ? (pushPace(push) ?? everyday) : everyday;
    const start = push ? push.start : `${today.slice(0, 8)}01`;
    const end = push ? push.end : addDays(addDays(`${today.slice(0, 8)}01`, 32).slice(0, 8) + '01', -1);

    const days: ProgressDay[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) days.push({ day: d, words: words.get(d) ?? 0, future: d > today, today: d === today });
    const total = days.reduce((a, d) => a + (d.future ? 0 : d.words), 0);

    // Days in a row with words written. Today still counts as open until it ends.
    let streak = 0;
    for (let d = (words.get(today) ?? 0) > 0 ? today : addDays(today, -1); (words.get(d) ?? 0) > 0; d = addDays(d, -1)) streak++;

    const goal = push?.words ?? null;
    const started = today >= start, ended = today > end;
    const daysLeft = started && !ended ? daysBetween(today, end) + 1 : !started ? daysBetween(start, end) + 1 : 0;
    const remaining = goal != null ? Math.max(0, goal - total) : null;
    return {
      today, start, end,
      push: push ? { name: push.name, words: push.words } : null,
      status: !started ? 'ahead' as const : ended ? 'ended' as const : 'running' as const,
      dailyGoal: daily,
      todayWords: words.get(today) ?? 0,
      days, total, goal, remaining, daysLeft,
      perDayNeeded: remaining != null && daysLeft > 0 ? Math.ceil(remaining / daysLeft) : null,
      streak,
      bookWords: this.ms.totalWords(projectId),
      targetWords: st.targetWords,
    };
  }
}
