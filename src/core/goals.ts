// Daily word goals, shared by the service and the screens. No other imports, so the UI can use it directly.

import type { ProjectSettings, WritingPush } from './settings.js';

/** Words a day a push asks for: its goal spread evenly over its days. */
export function pushPace(push: WritingPush | null): number | null {
  if (!push || !push.words) return null;
  const days = Math.round((Date.parse(`${push.end}T00:00:00Z`) - Date.parse(`${push.start}T00:00:00Z`)) / 86_400_000) + 1;
  return days > 0 ? Math.ceil(push.words / days) : null;
}

/** The daily word goal on a given day (YYYY-MM-DD): the push's pace on the push's own days, the everyday goal otherwise. */
export function dailyGoalOn(st: Pick<ProjectSettings, 'goal' | 'push'>, day: string): number | null {
  const pace = st.push && day >= st.push.start && day <= st.push.end ? pushPace(st.push) : null;
  if (pace) return pace;
  return st.goal?.type === 'words' && st.goal.target ? st.goal.target : null;
}

/** Today on this computer, YYYY-MM-DD. */
export function localDay(at = new Date()): string {
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, '0')}-${String(at.getDate()).padStart(2, '0')}`;
}

/** Door closed: through the day she chose, nothing judges the draft. */
export function doorClosed(st: { doorClosedUntil?: string | null } | null | undefined, today = localDay()): boolean {
  return !!st?.doorClosedUntil && today <= st.doorClosedUntil;
}
