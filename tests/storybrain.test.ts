import { describe, it, expect, afterEach } from 'vitest';
import { freshStore } from './helpers.js';
import { Conversations, parseConversation } from '../src/core/conversations.js';
import { exportArchive, importArchive } from '../src/core/backup.js';

let env: ReturnType<typeof freshStore>;
afterEach(() => env?.cleanup());

const EXPORT = `### YOLANDA | 2026-10-14 21:05 ET | text

Let's start with Kevin. If you were to write Kevin's last page of the novel in one line, who is he now?

### CHATGPT | 2026-10-14 21:05 ET | reasoning_recap

{"content_type":"reasoning_recap","content":"Worked for a second"}

### CHATGPT | 2026-10-14 21:06 ET | text

Here is one way his wife might put it: "First of all, I don't appreciate the implication."

What if Kevin keeps a notebook of 17 violations?

### YOLANDA | 2026-10-14 21:11 ET | text

I'm keeping that for the book!  Anthony would be a notebook wielding fool too!
`;

describe('conversations are kept whole (R-A-054)', () => {
  it('parses her export format verbatim, keeping every message, speaker and time', () => {
    const { turns, format } = parseConversation(EXPORT);
    expect(format).toBe('export headers');
    expect(turns).toHaveLength(4);
    expect(turns[0]!.speaker_kind).toBe('author');
    expect(turns[2]!.speaker_kind).toBe('assistant');
    expect(turns[1]!.speaker_name).toBe('CHATGPT (reasoning_recap)');
    expect(turns[3]!.text).toBe("I'm keeping that for the book!  Anthony would be a notebook wielding fool too!");
    expect(turns[0]!.said_at).toBe('2026-10-15T01:05:00.000Z');
  });

  it('understands copied chats and named transcripts, and never drops text it cannot parse', () => {
    expect(parseConversation('You said:\nhello\nChatGPT said:\nhi there').turns.map((t) => t.speaker_kind)).toEqual(['author', 'assistant']);
    expect(parseConversation('Me: one\nClaude: two').turns.map((t) => t.speaker_kind)).toEqual(['author', 'assistant']);
    const odd = parseConversation('just some notes\nwith no speakers');
    expect(odd.turns).toHaveLength(1);
    expect(odd.turns[0]!.text).toBe('just some notes\nwith no speakers');
  });

  it('imports with a completeness report, and the conversation is searchable word for word', () => {
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const conv = new Conversations(env.store, env.brain);
    const r = conv.importText(pid, { title: 'Kevin, 10-14 evening', text: EXPORT });
    expect(r).toMatchObject({ turnsFound: 4, turnsStored: 4, complete: true, byAuthor: 2 });
    const hits = env.brain.search(pid, 'notebook wielding fool');
    expect(hits.some((h) => h.hit === 'turn')).toBe(true);
  });

  it('a conversation with emoji and accents still counts as whole', () => {
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const conv = new Conversations(env.store, env.brain);
    const r = conv.importText(pid, { title: 'Laughing', text: '### YOLANDA | 2026-10-14 09:34 ET | text\nHahahahaha! 😂😂 Café.\n\n### CHATGPT | 2026-10-14 09:35 ET | text\nHe would call it 🎙️ The Voice of Reason.' });
    expect(r).toMatchObject({ turnsFound: 2, turnsStored: 2, complete: true });
  });
});

describe('catching what matters inside a conversation (R-A-055, R-A-029)', () => {
  function setup() {
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const kevin = env.brain.createElement(pid, { kind: 'character', title: 'Kevin Wickley' });
    const conv = new Conversations(env.store, env.brain);
    const r = conv.importText(pid, { title: 'Kevin, 10-14 evening', text: EXPORT, focusElementId: kevin.id });
    const { turns } = conv.full(r.conversation.id as string);
    return { pid, kevin, conv, convId: r.conversation.id as string, turns };
  }

  it('Keep this line: one action, verbatim, assistant-written and author-kept, placement open', () => {
    const { conv, turns, pid } = setup();
    const t = turns[2]!;
    const line = '"First of all, I don\'t appreciate the implication."';
    const start = (t.text as string).indexOf(line);
    const m = conv.keep(t.id as string, start, start + line.length);
    const el = env.brain.element(m.element_id as string);
    expect(el.kind).toBe('line');
    expect(el.body).toBe(line);
    expect(JSON.parse(el.attrs_json as string)).toMatchObject({ written_by: 'assistant', kept_by: 'author', placement: 'open' });
    expect(conv.originOf({ elementId: el.id as string })).toMatchObject({ speakerKind: 'assistant', conversationTitle: 'Kevin, 10-14 evening' });
    // Nothing was placed anywhere.
    expect(env.ms.outline(pid)).toHaveLength(0);
  });

  it('a possibility from the assistant stays a suggestion; from her it is developing; both trace to the message', () => {
    const { conv, turns, kevin } = setup();
    const t = turns[2]!;
    const idea = 'What if Kevin keeps a notebook of 17 violations?';
    const s = (t.text as string).indexOf(idea);
    const m = conv.possibility(t.id as string, s, s + idea.length, { elementId: kevin.id, field: 'habits' });
    const st = env.store.get('statements', m.statement_id as string)!;
    expect(st.status).toBe('proposed');
    expect(st.speaker_kind).toBe('assistant');
    expect(conv.originOf({ statementId: st.id as string })!.text).toContain('17 violations');
    const mine = turns[3]!;
    const m2 = conv.possibility(mine.id as string, 0, 30, { elementId: kevin.id, field: 'habits' });
    expect(env.store.get('statements', m2.statement_id as string)!.status).toBe('developing');
  });

  it('questions the assistant raised are suggestions, not filed as hers', () => {
    const { conv, turns } = setup();
    const t = turns[2]!;
    const q = 'What if Kevin keeps a notebook of 17 violations?';
    const s = (t.text as string).indexOf(q);
    const m = conv.capture(t.id as string, s, s + q.length, 'question');
    expect(JSON.parse(env.brain.element(m.element_id as string).attrs_json as string).suggested).toBe(true);
    const mine = conv.capture(turns[0]!.id as string, 0, 30, 'question');
    expect(JSON.parse(env.brain.element(mine.element_id as string).attrs_json as string).suggested).toBeUndefined();
  });

  it('the harvest lists what she kept, what stays open and who said what, and decides nothing', () => {
    const { conv, turns, kevin, convId } = setup();
    const t = turns[2]!;
    const line = '"First of all, I don\'t appreciate the implication."';
    const a = (t.text as string).indexOf(line);
    conv.keep(t.id as string, a, a + line.length, { linkTo: [kevin.id] });
    const idea = 'What if Kevin keeps a notebook of 17 violations?';
    const b = (t.text as string).indexOf(idea);
    conv.possibility(t.id as string, b, b + idea.length, { elementId: kevin.id, field: 'habits' });
    conv.notCanon(turns[0]!.id as string, 0, 10, 'not this');
    const h = conv.harvest(convId);
    expect(h.kept).toHaveLength(1);
    expect(h.possibilities).toHaveLength(1);
    expect(h.notCanon).toHaveLength(1);
    expect(h.implicated.map((e) => e.title)).toContain('Kevin Wickley');
    expect(h.statements.every((s) => s.status !== 'established')).toBe(true);
    expect(h.speakers).toEqual(expect.arrayContaining(['YOLANDA', 'CHATGPT']));
  });
});

describe('statuses, possibilities and suggestions (R-A-023 to R-A-028)', () => {
  it('competing possibilities coexist and none wins by being newest', () => {
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const arc = env.brain.createElement(pid, { kind: 'arc', title: "Kevin's arc" });
    for (const v of ['If I let my guard down, I could lose everything again.', 'If I am not in control, everything I have worked for can be taken away.', 'A third option'])
      env.brain.addStatement({ elementId: arc.id, field: 'lie', value: v, status: 'developing', speaker: { kind: 'author' } });
    const f = env.brain.field(arc.id, 'lie');
    expect(f.current).toBeNull();
    expect(f.possibilities).toHaveLength(3);
    env.brain.setStatementStatus(f.possibilities[2]!.id as string, 'established');
    const g = env.brain.field(arc.id, 'lie');
    expect(g.current!.value).toContain('guard down');
    expect(g.possibilities).toHaveLength(2);
  });

  it('a suggestion waits; accepting records who accepted it; rejecting or deferring changes nothing', () => {
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const anthony = env.brain.createElement(pid, { kind: 'character', title: 'Anthony Vernon' });
    const p1 = env.brain.propose(pid, { origin: 'assistant', kind: 'statement', target: { elementId: anthony.id, field: 'humor' }, after: { value: 'Expressive, physical, code-switching' }, rationale: 'From the 10-15 discussion' });
    const p2 = env.brain.propose(pid, { origin: 'assistant', kind: 'statement', target: { elementId: anthony.id, field: 'temperament' }, after: { value: 'dry' } });
    expect(env.brain.field(anthony.id, 'humor').latest).toBeNull();
    env.brain.decideProposal(p2.id as string, 'rejected');
    env.brain.decideProposal(p1.id as string, 'deferred');
    expect(env.brain.field(anthony.id, 'temperament').latest).toBeNull();
    const r = env.brain.acceptProposal(p1.id as string, { status: 'established' });
    const f = env.brain.field(anthony.id, 'humor');
    expect(f.current!.value).toBe('Expressive, physical, code-switching');
    expect(f.current!.speaker_kind).toBe('assistant');
    expect((env.store.get('statements', f.current!.id as string)!.qualifiers_json as string)).toContain('"accepted_by":"author"');
    expect(r.proposal.status).toBe('accepted');
    expect(env.brain.proposals(pid, 'pending')).toHaveLength(0);
  });

  it('multi-value fields keep several decisions at once; timing says when a fact is true', () => {
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const k = env.brain.createElement(pid, { kind: 'character', title: 'Kevin' });
    env.brain.addStatement({ elementId: k.id, field: 'values', value: 'Being taken seriously', status: 'established', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: k.id, field: 'values', value: 'His family', status: 'established', speaker: { kind: 'author' } });
    expect(env.brain.field(k.id, 'values').currentAll.map((s) => s.value)).toEqual(['His family', 'Being taken seriously']);
    const job = env.brain.addStatement({ elementId: k.id, field: 'history', value: 'Lost his job years before the story', status: 'established', speaker: { kind: 'author' }, qualifiers: { timing: 'backstory' } });
    expect((job as any).qualifiers.timing).toBe('backstory');
  });
});

describe('the author can add what the program did not define (R-A-109)', () => {
  it('a new kind with its own fields behaves like a built-in one, and survives an archive round trip', () => {
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const gag = env.brain.defineKind(pid, { label: 'Running gag' });
    const fieldA = env.brain.defineField(pid, { kind: gag.key as string, label: 'First appearance' });
    env.brain.defineField(pid, { kind: gag.key as string, label: 'How it escalates', multi: true });
    const g1 = env.brain.createElement(pid, { kind: gag.key as string, title: 'Christine the cursed car' });
    env.brain.addStatement({ elementId: g1.id, field: fieldA.field as string, value: 'Opening driveway scene', status: 'developing', speaker: { kind: 'author' } });
    const page = env.brain.elementPage(g1.id);
    expect(page.fields.map((f) => f.def.label)).toEqual(['First appearance', 'How it escalates']);
    expect(env.brain.search(pid, 'cursed car')).toHaveLength(1);
    // A custom field on a built-in kind, for this novel only.
    env.brain.defineField(pid, { kind: 'location', label: 'Weather' });
    const other = env.brain.createProject('Another novel').id as string;
    expect(env.brain.fieldsFor(other, 'location').some((f) => f.label === 'Weather')).toBe(false);
    // Archive round trip keeps kinds, fields and values.
    const a = exportArchive(env.store, pid);
    const copy = importArchive(env.store, a, { asCopy: true });
    const els = env.brain.elements(copy.projectId, { kind: gag.key as string });
    expect(els).toHaveLength(1);
    expect(env.brain.elementPage(els[0]!.id as string).fields[0]!.view.latest!.value).toBe('Opening driveway scene');
  });
});

describe('the map of choices ahead (R-A-042)', () => {
  it('lists what is still open, what has options but no decision, open questions, her reserved work and waiting suggestions', () => {
    env = freshStore();
    const pid = env.brain.createProject('IDW').id as string;
    const anthony = env.brain.createElement(pid, { kind: 'arc', title: "Anthony's arc" });
    env.brain.addStatement({ elementId: anthony.id, field: 'ghost', value: null, status: 'unanswered', speaker: { kind: 'author' } });
    const ev = env.brain.createElement(pid, { kind: 'event', title: 'The distraction', reserved: 'Mine to build' });
    env.brain.addStatement({ elementId: ev.id, field: 'function', value: 'Francine needs both men distracted', status: 'established', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: ev.id, field: 'execution', value: 'A five-dollar bill', status: 'developing', speaker: { kind: 'author' } });
    env.brain.addStatement({ elementId: ev.id, field: 'execution', value: 'Something else', status: 'developing', speaker: { kind: 'author' } });
    env.brain.capture(pid, 'Where does the Confession go?', { kind: 'question' });
    const m = env.brain.openDecisions(pid);
    expect(m.stillOpen.map((s) => s.field)).toEqual(['ghost']);
    expect(m.choosing).toEqual([expect.objectContaining({ element_title: 'The distraction', field: 'execution', options: 2 })]);
    expect(m.questions.map((q) => q.title)).toEqual(['Where does the Confession go?']);
    expect(m.reserved.map((r) => r.reserved)).toEqual(['Mine to build']);
  });
});
