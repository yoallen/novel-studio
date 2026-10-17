// Per-novel settings live in the project's profile. Every value has a default, so a new novel in any
// genre starts working immediately, and the author can change any of them (R-A-109: the program is editable).

import { DEFAULT_STATUS_LABELS, DEFAULT_OWNED_LABEL, StatusKey } from './labels.js';
import { ValidationError } from './store.js';

export interface LadderStep { key: string; label: string; drafted?: boolean }

/** R-B-026 default ladder. Keys are stable; labels and extra steps are the author's to change. */
export const DEFAULT_SCENE_LADDER: LadderStep[] = [
  { key: 'idea', label: 'Idea' },
  { key: 'planned', label: 'Planned' },
  { key: 'ready', label: 'Ready to Draft' },
  { key: 'drafting', label: 'Drafting', drafted: true },
  { key: 'first_draft', label: 'First Draft Complete', drafted: true },
  { key: 'revising', label: 'Revising', drafted: true },
  { key: 'revised', label: 'Revised', drafted: true },
  { key: 'final', label: 'Finalized', drafted: true },
];

export type Guidance = 'quiet' | 'advisory' | 'deep';
export type GoalType = 'none' | 'words' | 'scenes' | 'time' | 'milestones';

/** A stretch of days with a word goal, such as November and 50,000 words. Dates are calendar days, YYYY-MM-DD. */
export interface WritingPush { name: string; start: string; end: string; words: number | null }

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
}

export const DEFAULT_RESERVED_MARKERS = ['Mine to write', 'Mine to build', 'Mine to design', 'Mine to choreograph', 'Mine to time', 'Mine to escalate', 'Mine to settle'];

export function settingsOf(profile: Record<string, unknown> | undefined): ProjectSettings {
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
    targetWords: typeof s.targetWords === 'number' ? s.targetWords : (typeof p.target_words === 'number' ? p.target_words : null),
    wordsPerPage: Array.isArray(s.wordsPerPage) && s.wordsPerPage.length ? s.wordsPerPage : [250, 300],
    statusLabels: s.statusLabels ?? {},
    ownedLabel: s.ownedLabel ?? DEFAULT_OWNED_LABEL,
    reservedMarkers: Array.isArray(s.reservedMarkers) && s.reservedMarkers.length ? s.reservedMarkers : DEFAULT_RESERVED_MARKERS,
    nextWritingAction: typeof s.nextWritingAction === 'string' ? s.nextWritingAction : '',
    watchWords: Array.isArray(s.watchWords) ? s.watchWords : DEFAULT_WATCH_WORDS,
    importLabels: Array.isArray(s.importLabels) && s.importLabels.length ? s.importLabels : DEFAULT_IMPORT_LABELS,
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
  if (patch.push) {
    const { name, start, end, words } = patch.push;
    const isDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`));
    if (!isDay(start) || !isDay(end)) throw new ValidationError('A writing push needs a first and a last day.');
    if (end < start) throw new ValidationError('The last day of the push comes before the first.');
    if ((Date.parse(end) - Date.parse(start)) / 86_400_000 > 366) throw new ValidationError('A writing push can run a year at most.');
    if (words != null && (!Number.isFinite(words) || words < 1 || words > 2_000_000)) throw new ValidationError('The push goal should be between 1 and 2,000,000 words.');
    next.push = { name: (name ?? '').trim().slice(0, 60), start, end, words: words ?? null };
  }
  if (patch.byline != null) next.byline = String(patch.byline).trim().slice(0, 120);
  if (patch.wordsPerPage && patch.wordsPerPage.some((n) => !Number.isFinite(n) || n < 100 || n > 600)) throw new ValidationError('Words per page should be between 100 and 600.');
  if (patch.targetWords != null && (!Number.isFinite(patch.targetWords) || patch.targetWords < 1000 || patch.targetWords > 2_000_000)) throw new ValidationError('Target length should be between 1,000 and 2,000,000 words.');
  return next;
}

export { DEFAULT_STATUS_LABELS };

