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
  sceneLadder: LadderStep[];
  guidanceWhileDrafting: Guidance;
  guidanceWhilePlanning: Guidance;
  goal: { type: GoalType; target: number | null; note: string };
  targetWords: number | null;
  wordsPerPage: number[];
  statusLabels: Partial<Record<StatusKey, string>>;
  ownedLabel: string;
  reservedMarkers: string[];
  nextWritingAction: string;
  /** The words her own documents use for status, read on import (R-B-069). */
  importLabels: ImportLabel[];
}

export const DEFAULT_RESERVED_MARKERS = ['Mine to write', 'Mine to build', 'Mine to design', 'Mine to choreograph', 'Mine to time', 'Mine to escalate', 'Mine to settle'];

export function settingsOf(profile: Record<string, unknown> | undefined): ProjectSettings {
  const p = (profile ?? {}) as Record<string, any>;
  const s = (p.settings ?? {}) as Partial<ProjectSettings>;
  return {
    authorName: typeof s.authorName === 'string' ? s.authorName : '',
    sceneLadder: Array.isArray(s.sceneLadder) && s.sceneLadder.length ? s.sceneLadder : DEFAULT_SCENE_LADDER,
    guidanceWhileDrafting: s.guidanceWhileDrafting ?? 'quiet',
    guidanceWhilePlanning: s.guidanceWhilePlanning ?? 'advisory',
    goal: s.goal ?? { type: 'none', target: null, note: '' },
    targetWords: typeof s.targetWords === 'number' ? s.targetWords : (typeof p.target_words === 'number' ? p.target_words : null),
    wordsPerPage: Array.isArray(s.wordsPerPage) && s.wordsPerPage.length ? s.wordsPerPage : [250, 300],
    statusLabels: s.statusLabels ?? {},
    ownedLabel: s.ownedLabel ?? DEFAULT_OWNED_LABEL,
    reservedMarkers: Array.isArray(s.reservedMarkers) && s.reservedMarkers.length ? s.reservedMarkers : DEFAULT_RESERVED_MARKERS,
    nextWritingAction: typeof s.nextWritingAction === 'string' ? s.nextWritingAction : '',
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
  if (patch.wordsPerPage && patch.wordsPerPage.some((n) => !Number.isFinite(n) || n < 100 || n > 600)) throw new ValidationError('Words per page should be between 100 and 600.');
  if (patch.targetWords != null && (!Number.isFinite(patch.targetWords) || patch.targetWords < 1000 || patch.targetWords > 2_000_000)) throw new ValidationError('Target length should be between 1,000 and 2,000,000 words.');
  return next;
}

export { DEFAULT_STATUS_LABELS };
