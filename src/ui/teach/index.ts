// Teaching for every kind of record and every field: what it is, why it matters, whether most books
// need it, the common mistake, and an example. Shown beside each field, and gathered in Help.
import people from './people.json';
import structure from './structure.json';
import world from './world.json';
import extra from './extra.json';

export interface FieldTeach { what: string; why: string; need: 'core' | 'useful' | 'situational'; mistake?: string; example?: string; /** How it differs from a neighboring field she might confuse it with. */ differs?: string }
export interface KindTeach { about?: { what: string; why: string; when?: string; mistake?: string; example?: string; differs?: string }; groups?: Record<string, string>; fields?: Record<string, FieldTeach> }

export const TEACH: Record<string, KindTeach> = { ...(people as Record<string, KindTeach>), ...(structure as Record<string, KindTeach>), ...(world as Record<string, KindTeach>), ...(extra as Record<string, KindTeach>) };

export const NEED_WORDS: Record<FieldTeach['need'], string> = {
  core: 'Most books need this',
  useful: 'Useful for many books',
  situational: 'Only for some books',
};

export function teachField(kind: string, field: string): FieldTeach | null {
  return TEACH[kind]?.fields?.[field] ?? null;
}
