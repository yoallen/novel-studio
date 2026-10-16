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
