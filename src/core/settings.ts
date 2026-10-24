// Per-novel settings live in the project's profile. Every value has a default, so a new novel in any
// genre starts working immediately, and the author can change any of them (R-A-109: the program is editable).

import { DEFAULT_STATUS_LABELS, DEFAULT_OWNED_LABEL, StatusKey } from './labels.js';
import { ValidationError } from './store.js';

export interface LadderStep { key: string; label: string; drafted?: boolean }

/** R-B-026 default ladder. Keys are stable; labels and extra steps are the author's to change. */
export const DEFAULT_SCENE_LADDER: LadderStep[] = [
  { key: 'idea', label: 'Idea' },
  { key: 'planned', label: 'Planned' },
  { key: 'ready', label: 'Ready to draft' },
  { key: 'drafting', label: 'Drafting', drafted: true },
  { key: 'first_draft', label: 'First draft complete', drafted: true },
  { key: 'revising', label: 'Revising', drafted: true },
  { key: 'revised', label: 'Revised', drafted: true },
  { key: 'final', label: 'Finalized', drafted: true },
];

export type Guidance = 'quiet' | 'advisory' | 'deep';
export type GoalType = 'none' | 'words' | 'scenes' | 'time' | 'milestones';

/** A stretch of days with a word goal, such as November and 50,000 words. Dates are calendar days, YYYY-MM-DD. */
export interface PushPause { from: string; back: string; extend: boolean; daysAdded: number }
export interface WritingPush {
  name: string; start: string; end: string; words: number | null;
  /** Which push this is, so changing its name or dates edits it rather than making a second book. */
  id?: string;
  /** A real deadline (a contest, a due date, November): a pause keeps its last day unless she says otherwise. */
  deadline?: boolean;
  /** Stretches she stepped away: no daily goal, no coach, and the days show as books lying on their sides. */
  pauses?: PushPause[];
  /** When a push begins partway through a day, it counts only from this moment. */
  startedAt?: string;
  /** When a push ended early: the day, the last day it had planned, and the moment, so later words are not its. */
  endedEarly?: { on: string; plannedEnd: string; at: string };
}

/** A push's identity: its id, or, for a push made before pushes had ids, its first day and name. */
export const pushId = (p: WritingPush) => p.id ?? `${p.start}|${p.name ?? ''}`;
const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDay = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const daysFrom = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
/** A push is running from its first day through its last, unless it has ended early. */
export const pushRunning = (p: WritingPush | null, today: string) => !!p && !p.endedEarly && p.start <= today && today <= p.end;
/** The pause covering a day, if any (the day she comes back is not paused). */
export const pauseOn = (p: WritingPush | null, day: string) => p?.pauses?.find((x) => x.from <= day && day < x.back) ?? null;
/** Every paused day of a push. */
export function pausedDays(p: WritingPush): Set<string> {
  const out = new Set<string>();
  for (const x of p.pauses ?? []) for (let d = x.from; d < x.back; d = addDay(d, 1)) out.add(d);
  return out;
}

import { DEFAULT_WATCH_WORDS } from './revise.js';

export interface ImportLabel { label: string; status: 'established' | 'developing' | 'unanswered' | 'illustrative' | 'proposed' | 'set_aside' }
/** Her Story Bible's labels, then the program's own words, then common ones. Longest match wins. */
export const DEFAULT_IMPORT_LABELS: ImportLabel[] = [
  { label: 'Decided in spirit', status: 'developing' },
  { label: 'Decided', status: 'established' },
  { label: 'One way I could play it, not a decision yet', status: 'illustrative' },
  { label: 'One way I could play it', status: 'illustrative' },
  { label: 'One way it could be done', status: 'illustrative' },
  { label: "Here's a suggestion", status: 'proposed' },
  { label: 'Example', status: 'illustrative' },
  { label: 'Weak', status: 'illustrative' },
  { label: 'Strong', status: 'illustrative' },
  { label: 'Over to me', status: 'unanswered' },
  { label: 'My move', status: 'unanswered' },
  { label: 'My turn', status: 'unanswered' },
  { label: 'Now I write', status: 'unanswered' },
  { label: "Here's where I take over", status: 'unanswered' },
  { label: 'Hand it to me', status: 'unanswered' },
  { label: 'Still open', status: 'unanswered' },
  { label: 'Open', status: 'unanswered' },
  { label: 'Developing', status: 'developing' },
  { label: 'What it is', status: 'developing' },
  { label: 'Set aside', status: 'set_aside' },
  // Labels used in her decision archives.
  { label: 'Author-established story-bible foundation', status: 'established' },
  { label: 'New author statements', status: 'developing' },
  { label: 'Exact keeper', status: 'established' },
  { label: 'Author correction (emphatic)', status: 'established' },
  { label: 'Author correction', status: 'established' },
  { label: 'Author direction', status: 'established' },
  { label: 'Developing author concept', status: 'developing' },
  { label: 'Developing author scene', status: 'developing' },
  { label: 'Exact author line', status: 'developing' },
  { label: 'Editorial possibility', status: 'proposed' },
  { label: 'Editorial caution', status: 'proposed' },
];

export interface ProjectSettings {
  authorName: string;
  /** The name on the book: a pen name, or blank to use the author's name. Printed on exported title pages. */
  byline: string;
  sceneLadder: LadderStep[];
  guidanceWhileDrafting: Guidance;
  guidanceWhilePlanning: Guidance;
  goal: { type: GoalType; target: number | null; note: string };
  push: WritingPush | null;
  /** Pushes she has had before this one, kept when a new push replaces them: each is a shelf in her bookcase. */
  pastPushes: WritingPush[];
  /** The push she has planned to begin after the one she is in ends. It starts on its own day. */
  nextPush: WritingPush | null;
  targetWords: number | null;
  wordsPerPage: number[];
  statusLabels: Partial<Record<StatusKey, string>>;
  ownedLabel: string;
  reservedMarkers: string[];
  nextWritingAction: string;
  /** The words her own documents use for status, read on import (R-B-069). */
  importLabels: ImportLabel[];
  /** Words and phrases she wants to keep an eye on when revising. */
  watchWords: string[];
  /** Days she set herself (YYYY-MM-DD to words): a lighter day, a rest day (0), or a bigger one. */
  dayGoals: Record<string, number>;
  /** Door closed: through this day (YYYY-MM-DD), nothing judges the draft. null when the door is open. */
  doorClosedUntil: string | null;
  /** The push coach on Where was I? A note for the day, milestones, pace help and the next scene when stuck. */
  coach: boolean;
  /** Her own notes for the push coach, carried with the novel so they reach her other computer. */
  coachOwn: string[];
  /** The beats she says she is writing in now, by id. null: Story Canon follows the scene she is writing. */
  writingNow: string[] | null;
}

export const DEFAULT_RESERVED_MARKERS = ['Mine to write', 'Mine to build', 'Mine to design', 'Mine to choreograph', 'Mine to time', 'Mine to escalate', 'Mine to settle'];

export function settingsOf(profile: Record<string, unknown> | undefined, today = localDay()): ProjectSettings {
  return promoted(readSettings(profile), today);
}

/** The planned next push takes over on its first day; the one before it goes to the finished shelf. */
function promoted(st: ProjectSettings, today: string): ProjectSettings {
  if (!st.nextPush || st.nextPush.start > today) return st;
  const old = st.push;
  const keep = old && !st.pastPushes.some((x) => pushId(x) === pushId(old)) ? [...st.pastPushes, old].slice(-60) : st.pastPushes;
  return { ...st, push: st.nextPush, nextPush: null, pastPushes: keep };
}

function readSettings(profile: Record<string, unknown> | undefined): ProjectSettings {
  const p = (profile ?? {}) as Record<string, any>;
  const s = (p.settings ?? {}) as Partial<ProjectSettings>;
  return {
    authorName: typeof s.authorName === 'string' ? s.authorName : '',
    byline: typeof s.byline === 'string' ? s.byline : '',
    sceneLadder: Array.isArray(s.sceneLadder) && s.sceneLadder.length ? s.sceneLadder : DEFAULT_SCENE_LADDER,
    guidanceWhileDrafting: s.guidanceWhileDrafting ?? 'quiet',
    guidanceWhilePlanning: s.guidanceWhilePlanning ?? 'advisory',
    goal: s.goal ?? { type: 'none', target: null, note: '' },
    push: s.push && typeof s.push.start === 'string' && typeof s.push.end === 'string' ? s.push : null,
    pastPushes: Array.isArray(s.pastPushes) ? s.pastPushes.filter((x) => x && typeof x.start === 'string' && typeof x.end === 'string') : [],
    nextPush: s.nextPush && typeof s.nextPush.start === 'string' && typeof s.nextPush.end === 'string' ? s.nextPush : null,
    targetWords: typeof s.targetWords === 'number' ? s.targetWords : (typeof p.target_words === 'number' ? p.target_words : null),
    wordsPerPage: Array.isArray(s.wordsPerPage) && s.wordsPerPage.length ? s.wordsPerPage : [250, 300],
    statusLabels: s.statusLabels ?? {},
    ownedLabel: s.ownedLabel ?? DEFAULT_OWNED_LABEL,
    reservedMarkers: Array.isArray(s.reservedMarkers) && s.reservedMarkers.length ? s.reservedMarkers : DEFAULT_RESERVED_MARKERS,
    nextWritingAction: typeof s.nextWritingAction === 'string' ? s.nextWritingAction : '',
    watchWords: Array.isArray(s.watchWords) ? s.watchWords : DEFAULT_WATCH_WORDS,
    importLabels: Array.isArray(s.importLabels) && s.importLabels.length ? s.importLabels : DEFAULT_IMPORT_LABELS,
    dayGoals: s.dayGoals && typeof s.dayGoals === 'object' && !Array.isArray(s.dayGoals)
      ? Object.fromEntries(Object.entries(s.dayGoals).filter(([d, n]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isFinite(n) && (n as number) >= 0)) as Record<string, number>
      : {},
    doorClosedUntil: typeof s.doorClosedUntil === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.doorClosedUntil) ? s.doorClosedUntil : null,
    coach: s.coach !== false,
    coachOwn: Array.isArray(s.coachOwn) ? s.coachOwn.filter((x): x is string => typeof x === 'string') : [],
    writingNow: Array.isArray(s.writingNow) ? s.writingNow.filter((x): x is string => typeof x === 'string').slice(0, 40) : null,
  };
}

/** Validate a settings patch; returns the merged settings to store under profile.settings. */
export function mergeSettings(profile: Record<string, unknown>, patch: Partial<ProjectSettings>): ProjectSettings {
  const cur = settingsOf(profile);
  const next = { ...cur, ...patch } as ProjectSettings;
  if (patch.sceneLadder) {
    const keys = new Set<string>();
    for (const step of patch.sceneLadder) {
      if (!step || typeof step.key !== 'string' || !/^[a-z0-9_]{1,40}$/.test(step.key)) throw new ValidationError('Each status step needs a short key (lowercase letters, numbers, underscores).');
      if (typeof step.label !== 'string' || !step.label.trim()) throw new ValidationError('Each status step needs a name.');
      if (keys.has(step.key)) throw new ValidationError('Two status steps share the same key.');
      keys.add(step.key);
    }
  }
  for (const g of ['guidanceWhileDrafting', 'guidanceWhilePlanning'] as const) {
    if (patch[g] && !['quiet', 'advisory', 'deep'].includes(patch[g]!)) throw new ValidationError('Guidance must be Quiet, Advisory or Deep Analysis.');
  }
  if (patch.goal && !['none', 'words', 'scenes', 'time', 'milestones'].includes(patch.goal.type)) throw new ValidationError('Unknown goal type.');
  const today = localDay();
  const checkPush = (x: WritingPush, what: string) => {
    const { start, end, words } = x;
    const isDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`));
    if (!isDay(start) || !isDay(end)) throw new ValidationError(`${what} needs a first and a last day.`);
    if (end < start) throw new ValidationError(`The last day of ${what.toLowerCase()} comes before the first.`);
    if ((Date.parse(end) - Date.parse(start)) / 86_400_000 > 366) throw new ValidationError('A writing push can run a year at most.');
    if (words != null && (!Number.isFinite(words) || words < 1 || words > 2_000_000)) throw new ValidationError('The push goal should be between 1 and 2,000,000 words.');
  };
  const fresh = (x: WritingPush): WritingPush => ({
    id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: (x.name ?? '').trim().slice(0, 60), start: x.start, end: x.end, words: x.words ?? null, deadline: !!x.deadline,
    ...(x.start <= today ? { startedAt: new Date().toISOString() } : {}),
  });
  if ('push' in patch) {
    const old = cur.push, now = patch.push ?? null;
    const sameAs = (a: WritingPush | null, b: WritingPush | null) => !!a && !!b && (b.id ? b.id === pushId(a) : a.start === b.start && (a.name ?? '') === (b.name ?? ''));
    if (now) checkPush(now, 'A writing push');
    if (old && sameAs(old, now)) {
      // An edit: her name, dates, words and deadline change; its pauses and history stay with it.
      next.push = { ...old, id: pushId(old), name: (now!.name ?? '').trim().slice(0, 60), start: now!.start, end: now!.end, words: now!.words ?? null, deadline: now!.deadline ?? old.deadline ?? false };
      next.pastPushes = cur.pastPushes;
    } else {
      // A push that is running holds until she pauses it or ends it: a new one never starts on top of it.
      if (pushRunning(old, today)) throw new ValidationError(`${old!.name || 'Your writing push'} is still running. Change it, pause it or end it early; plan your next push to begin after it.`);
      next.push = now ? fresh(now) : null;
      next.pastPushes = old && old.start <= today && !cur.pastPushes.some((x) => pushId(x) === pushId(old)) ? [...cur.pastPushes, old].slice(-60) : cur.pastPushes;
    }
  } else next.pastPushes = cur.pastPushes;
  if ('nextPush' in patch) {
    const np = patch.nextPush ?? null;
    if (np) {
      checkPush(np, 'Your next push');
      const after = next.push && !next.push.endedEarly ? next.push.end : null;
      if (after && np.start <= after) throw new ValidationError(`Your next push begins after ${next.push!.name || 'this one'} ends, on ${addDay(after, 1)} or later.`);
      next.nextPush = cur.nextPush && np.id === pushId(cur.nextPush) ? { ...cur.nextPush, name: (np.name ?? '').trim().slice(0, 60), start: np.start, end: np.end, words: np.words ?? null, deadline: !!np.deadline } : { ...fresh(np), startedAt: undefined };
    } else next.nextPush = null;
  } else next.nextPush = cur.nextPush;
  if (patch.dayGoals) {
    const days = Object.entries(patch.dayGoals);
    if (days.length > 400) throw new ValidationError('Too many set days.');
    for (const [d, n] of days) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(`${d}T00:00:00Z`))) throw new ValidationError('A set day needs a date.');
      if (!Number.isInteger(n) || n < 0 || n > 100_000) throw new ValidationError('A day\'s words should be between 0 and 100,000.');
    }
  }
  if (patch.byline != null) next.byline = String(patch.byline).trim().slice(0, 120);
  if (patch.wordsPerPage && patch.wordsPerPage.some((n) => !Number.isFinite(n) || n < 100 || n > 600)) throw new ValidationError('Words per page should be between 100 and 600.');
  if (patch.targetWords != null && (!Number.isFinite(patch.targetWords) || patch.targetWords < 1000 || patch.targetWords > 2_000_000)) throw new ValidationError('Target length should be between 1,000 and 2,000,000 words.');
  return next;
}

export { DEFAULT_STATUS_LABELS };



/** Pause the running push until she comes back. With extend, its last day moves out by the days paused. */
export function pausePush(st: ProjectSettings, back: string, extend: boolean, today = localDay()): ProjectSettings {
  const p = st.push;
  if (!pushRunning(p, today)) throw new ValidationError('There is no push running to pause.');
  if (pauseOn(p, today)) throw new ValidationError('This push is already paused.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(back) || back <= today) throw new ValidationError('Pick the day you will be back: tomorrow or later.');
  const days = daysFrom(today, back);
  if (days > 366) throw new ValidationError('A pause can last a year at most.');
  const end = extend ? addDay(p!.end, days) : p!.end;
  if (st.nextPush && end >= st.nextPush.start) throw new ValidationError(`Moving the last day out would run into your next push, which begins ${st.nextPush.start}. Keep the last day, or move your next push first.`);
  return { ...st, push: { ...p!, end, pauses: [...(p!.pauses ?? []), { from: today, back, extend, daysAdded: extend ? days : 0 }] } };
}

/** Come back early: the pause ends today, and days it had added to the end come off again. */
export function resumePush(st: ProjectSettings, today = localDay()): ProjectSettings {
  const p = st.push, cur = pauseOn(p, today);
  if (!p || !cur) throw new ValidationError('This push is not paused.');
  const unused = daysFrom(today, cur.back);
  const pauses = (p.pauses ?? []).map((x) => (x === cur ? { ...x, back: today, daysAdded: x.extend ? x.daysAdded - unused : 0 } : x)).filter((x) => x.back > x.from);
  return { ...st, push: { ...p, end: cur.extend ? addDay(p.end, -unused) : p.end, pauses } };
}

/** End the running push early, honestly: it goes to the finished shelf as it stands, marked so. */
export function endPushEarly(st: ProjectSettings, today = localDay(), at = new Date().toISOString()): ProjectSettings {
  const p = st.push;
  if (!pushRunning(p, today)) throw new ValidationError('There is no push running to end.');
  const ended: WritingPush = { ...p!, id: pushId(p!), end: today, endedEarly: { on: today, plannedEnd: p!.end, at } };
  return { ...st, push: null, pastPushes: [...st.pastPushes, ended].slice(-60) };
}
