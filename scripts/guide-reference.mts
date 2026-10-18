// Builds the guide's reference chapter, "Every kind and every field", from the teaching the program
// shows beside each field, so the guide and the screens always say the same thing.
// Run: npx tsx scripts/guide-reference.mts
import { writeFileSync } from 'node:fs';
import { TEMPLATES, KIND_LABELS } from '../src/core/templates.ts';
import people from '../src/ui/fieldteach/people.json' with { type: 'json' };
import structure from '../src/ui/fieldteach/structure.json' with { type: 'json' };
import world from '../src/ui/fieldteach/world.json' with { type: 'json' };
import extra from '../src/ui/fieldteach/extra.json' with { type: 'json' };

const TEACH: Record<string, any> = { ...people, ...structure, ...world, ...extra };
const NEED: Record<string, string> = { core: 'Most books need this.', useful: 'Useful for many books.', situational: 'Only for some books.' };
const mistake = (m: string) => { const t = m.replace(/^the (common|usual) mistake (is|here is)\s*/i, ''); return t.charAt(0).toUpperCase() + t.slice(1); };

const ORDER = ['character', 'arc', 'relationship', 'interview', 'beat', 'scene_plan', 'event', 'reveal', 'clue', 'payoff', 'storyline', 'set_piece', 'hidden_move', 'line', 'motif', 'theme', 'value', 'question', 'idea', 'thought', 'note', 'object', 'location', 'storyworld', 'rule', 'research', 'guardrail', 'song', 'act', 'sequence', 'being', 'magic', 'culture', 'faction', 'belief', 'language', 'source', 'document', 'era'];
const out: string[] = [];
out.push('# Every kind and every field', '');
out.push('This chapter explains every kind of record in the Story Brain and every field on it: what it is, why it matters, whether most books need it, the common mistake, and an example. It is the same teaching you see when you click **Why it matters** under a field, gathered in one place so you can read it straight through or look one up.', '');
out.push('**Every field is optional.** A field is a place to put what you know when you know it. A blank field is never a mistake, and no book needs all of them. The labels "Most books need this", "Useful for many books" and "Only for some books" are there to help you choose where to spend your time.', '');
out.push('**Kinds that only some books use** (such as Magic and powers, or Languages) appear when you switch on worldbuilding for a book in Novel setup.', '');
for (const kind of ORDER) {
  const t = TEACH[kind]; if (!t) continue;
  const label = KIND_LABELS[kind]?.plural ?? kind;
  out.push(`## ${label}: every field`, '');
  const a = t.about;
  if (a) {
    out.push(`${a.what} ${a.why}`, '');
    if (a.when) out.push(`**When to use it.** ${a.when}`, '');
    if (a.mistake) out.push(`**The common mistake.** ${mistake(a.mistake)}`, '');
    if (a.example) out.push(`**Example.** ${a.example}`, '');
  }
  const fields = TEMPLATES[kind] ?? [];
  let group = '';
  for (const f of fields) {
    const ft = t.fields?.[f.field];
    if (!ft) continue;
    if (f.group !== group) {
      group = f.group;
      out.push(`### ${label}: ${group}`, '');
      if (t.groups?.[group]) out.push(`*${t.groups[group]}*`, '');
    }
    out.push(`**${f.label}.** ${ft.what} ${NEED[ft.need] ?? ''} ${ft.why}`.replace(/\s+/g, ' ').trim(), '');
    if (ft.differs) out.push(`How it differs: ${ft.differs}`, '');
    if (ft.mistake) out.push(`The common mistake: ${mistake(ft.mistake)}`, '');
    if (ft.example) out.push(`Example: ${ft.example}`, '');
  }
  if (!fields.length && t.fields?.description) out.push(`**Description.** ${t.fields.description.what} ${t.fields.description.why}`, '');
}
const md = out.join('\n').replace(/\n{3,}/g, '\n\n');
if (/—/.test(md)) throw new Error('An em dash slipped into the reference.');
writeFileSync(new URL('../src/ui/guide/90-every-field.md', import.meta.url), md);
console.log(`${md.length} characters, ${md.split('\n## ').length - 1} kinds`);
