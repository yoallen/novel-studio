// The Story Trail in a writer's words. Older changes were recorded with the program's own names for
// things ("located_at", "arc_type", "Add location"); this turns them into plain words when they are shown.
// The record itself is never rewritten.

import { relationSentence } from './relations.js';
import { KIND_LABELS } from './templates.js';
import { DEFAULT_STATUS_LABELS } from './labels.js';

export interface TrailLookup {
  /** The label of a field on the record with this title, if one is known. */
  fieldLabel(title: string, field: string): string | null;
  statusWord?(status: string): string;
}

const kindWord = (k: string) => (KIND_LABELS[k]?.label ?? k.replace(/^x_/, '').replace(/_/g, ' ')).toLowerCase();
const plainKey = (f: string) => f.replace(/^x_/, '').replace(/^st_[a-z_]+?_/, '').replace(/_/g, ' ');
const KEY = /^[a-z][a-z0-9_]*$/;
const RELATION = /^(.*) (contains|part_of|realizes|causes|enables|motivates|depends_on|plants|pays_off|reveals|conceals|foreshadows|mirrors|contradicts|appears_in|pov_of|located_at|knows|suspects|believes_falsely|relates_to|answers|raises|inspired_by|advances|can_see|cannot_see|same_person_as|plays_in|theme_song_of|calls_up|is_a|member_of|retells|written_by) (.*)$/;

export function describeChange(reason: string, look: TrailLookup): string {
  const r = (reason ?? '').trim();
  if (!r) return 'A change';
  if (r.startsWith('Undo: ')) return `Undid: ${describeChange(r.slice(6), look)}`;
  const status = (s: string) => look.statusWord?.(s) ?? (DEFAULT_STATUS_LABELS as Record<string, string>)[s] ?? s.replace(/_/g, ' ');
  const label = (title: string, field: string) => look.fieldLabel(title, field) ?? plainKey(field);

  let m = r.match(/^Replace "(.*)" with "(.*)" in (\d+ places? in \d+ scenes?)$/s);
  if (m) return m[2] ? `Replaced "${m[1]}" with "${m[2]}" in ${m[3]}` : `Took out "${m[1]}" in ${m[3]}`;
  m = r.match(/^Link (.*)$/);
  if (m) { const x = m[1]!.match(RELATION); if (x) return `Connected: ${relationSentence(x[2]!, x[1]!, x[3]!)}`; }
  if (r === 'Remove connection') return 'Removed a connection';
  m = r.match(/^(Add|Edit|Delete|Restore) ([a-z_]+) "(.*)"$/s);
  if (m && KIND_LABELS[m[2]!]) {
    const verb = { Add: 'Added', Edit: 'Changed', Delete: 'Deleted', Restore: 'Restored' }[m[1] as 'Add'];
    return `${verb} the ${kindWord(m[2]!)} "${m[3]}"`;
  }
  m = r.match(/^Add ([a-z_]+)$/);
  if (m && KIND_LABELS[m[1]!]) return `Added a ${kindWord(m[1]!)}`;
  m = r.match(/^Settings: (.*)$/);
  if (m) return `Changed settings: ${m[1]}`;
  m = r.match(/^(.*): ([a-z][a-z0-9_]*) marked ([a-z_]+)$/s);
  if (m) return `${m[1]}: ${label(m[1]!, m[2]!)} marked ${status(m[3]!)}`;
  m = r.match(/^(.*): remove ([a-z][a-z0-9_]*) statement$/s);
  if (m) return `${m[1]}: removed an entry from ${label(m[1]!, m[2]!)}`;
  m = r.match(/^(.*): ([^:]+)$/s);
  if (m && KEY.test(m[2]!)) return `${m[1]}: ${label(m[1]!, m[2]!)}`;
  m = r.match(/^Accept suggestion for (.*)$/);
  if (m) return `Accepted a suggestion for ${m[1]!.replace(/^x /, '')}`;
  m = r.match(/^File "(.*)" as ([a-z_]+)$/s);
  if (m) return `Filed "${m[1]}" as ${kindWord(m[2]!) === 'idea' ? 'an idea' : `a ${kindWord(m[2]!)}`}`;
  m = r.match(/^New field "(.*)" for ([a-z_]+)$/);
  if (m) return `New place to write, "${m[1]}", on every ${kindWord(m[2]!)}`;
  m = r.match(/^Message in "(.*)"$/s);
  if (m) return `A message in the conversation "${m[1]}"`;
  if (r === 'Update novel settings') return 'Changed this novel\'s settings';
  if (r === 'Change novel setup') return 'Changed Novel setup';
  return r;
}

/** What an Undo of this change will do, in one short line. */
export function undoMeaning(reason: string): string {
  const r = (reason ?? '').trim();
  if (r.startsWith('Undo: ')) return 'Puts back what the undo removed.';
  if (/^Message in /.test(r)) return 'Removes this message from the conversation. Nothing in your story changes.';
  if (/^Link /.test(r)) return 'Removes this connection.';
  if (/^Replace "/.test(r)) return 'Puts back the old words in every scene this replace changed.';
  if (/^Add /.test(r)) return 'Removes what was added. It can be restored from Deleted things.';
  if (/^Delete /.test(r)) return 'Brings it back.';
  return 'Puts things back the way they were just before this change.';
}

/** Short names for settings, for "Changed settings: target length, scene status steps". */
export const SETTING_WORDS: Record<string, string> = {
  authorName: 'your name', byline: 'the name on the book', sceneLadder: 'scene status steps', guidanceWhileDrafting: 'guidance while drafting',
  guidanceWhilePlanning: 'guidance while planning', goal: 'everyday goal', push: 'writing push', targetWords: 'target length',
  wordsPerPage: 'words per page', statusLabels: 'words for decisions', ownedLabel: 'the "on you now" marker', reservedMarkers: 'markers for work you keep',
  nextWritingAction: 'next writing action', importLabels: 'words read from your documents', watchWords: 'words to watch', dayGoals: 'lighter and rest days',
  doorClosedUntil: 'door closed',
};
