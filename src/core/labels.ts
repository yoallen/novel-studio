// On-screen words for statuses and markers. Chosen by the author (decision D-21, 2026-10-16).
// Renamable in Settings; stored labels override these defaults. {author} is replaced with the
// author's first name from Settings, so the words work for any author using the program.

export const DEFAULT_STATUS_LABELS = {
  established: 'Decided',
  developing: 'Developing',
  unanswered: 'Still open',
  illustrative: 'One way it could be done',
  proposed: "Here's a suggestion",
  set_aside: 'Set aside',
} as const;

/** The marker for anything the author has kept for herself to write or decide (her Bible's "Over to me"). */
export const DEFAULT_OWNED_LABEL = "{author}, it's on you now";

export type StatusKey = keyof typeof DEFAULT_STATUS_LABELS;

export function statusLabel(status: StatusKey, overrides: Partial<Record<StatusKey, string>> = {}, author = ''): string {
  return fill(overrides[status] ?? DEFAULT_STATUS_LABELS[status], author);
}

export function ownedLabel(override: string | undefined, author: string): string {
  return fill(override ?? DEFAULT_OWNED_LABEL, author);
}

function fill(label: string, author: string): string {
  const name = author.trim();
  return name ? label.replace(/\{author\}/g, name) : label.replace(/\{author\},\s*/g, '').replace(/^./, (c) => c.toUpperCase());
}

/**
 * The circle a scene shows in the binder, from the status she chose: empty before the first drafting step,
 * half on the first drafting step (being written), full on every step after it (written).
 */
export type SceneCircle = 'empty' | 'half' | 'full';
export const CIRCLE_WORDS: Record<SceneCircle, string> = { empty: 'not started', half: 'being written', full: 'written' };
export function sceneCircle(ladder: { key: string; drafted?: boolean }[], status: string): SceneCircle {
  const at = ladder.findIndex((x) => x.key === status);
  const first = ladder.findIndex((x) => x.drafted);
  if (at < 0 || first < 0 || at < first) return 'empty';
  return at === first ? 'half' : 'full';
}

/** One line each: what the "Kept for you" markers mean. Markers she adds herself have no line. */
export const RESERVED_HINTS: Record<string, string> = {
  'Mine to write': 'You write this one. The collaborator never drafts it.',
  'Mine to build': 'You work out how it is built: the mechanics, the setup, how the pieces fit.',
  'Mine to design': 'You design it: how it looks, the space, the shape of the gag or the trap.',
  'Mine to choreograph': 'You stage the movement: who goes where, the fight, the chase, the physical comedy.',
  'Mine to time': 'You set the timing: the pacing, when a reveal lands, the beat before the punchline.',
  'Mine to escalate': 'You decide how it builds, and how big it gets before it breaks.',
  'Mine to settle': 'You decide the open question here. Suggestions wait; nothing is settled for you.',
};
