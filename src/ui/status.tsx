import { DEFAULT_STATUS_LABELS } from '../core/labels';

export type StatusKey = keyof typeof DEFAULT_STATUS_LABELS;

export function statusWord(settings: any, s: string): string {
  const k = s as StatusKey;
  return (settings?.statusLabels?.[k] as string) || DEFAULT_STATUS_LABELS[k] || s;
}

/** The status choices she can make when she writes something down herself. */
export const AUTHOR_STATUSES: StatusKey[] = ['established', 'developing', 'unanswered', 'illustrative'];

export function ownedWord(settings: any): string {
  // The name from About you, or the first word of her name in Settings.
  const name = String(settings?.callName ?? '').trim() || String(settings?.authorName ?? '').trim().split(/\s+/)[0] || '';
  const label = (settings?.ownedLabel ?? "{author}, it's on you now") as string;
  return name ? label.replace(/\{author\}/g, name) : label.replace(/\{author\},\s*/g, '').replace(/^./, (c) => c.toUpperCase());
}

export function valueText(v: unknown): string {
  if (v == null) return '';
  return typeof v === 'string' ? v : JSON.stringify(v);
}

export function when(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/** The charge at the end of a value, as Snyder marks it: "Safety +" is a plus, "Hope -" a minus. */
export function charge(v: unknown): '+' | '-' | null {
  const t = valueText(v).trim();
  const m = /([+\-−])\s*$/.exec(t) ?? /^([+\-−])/.exec(t);
  return m ? (m[1] === '+' ? '+' : '-') : null;
}
