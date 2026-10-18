// The AI collaborator: a thinking partner, never a ghostwriter (R-A-089 to R-A-108, D-18).
// - It reads her latest decisions, guardrails and the open questions before it answers (R-A-095).
// - Everything it suggests arrives as a suggestion that waits for her (R-A-024, R-A-097).
// - It never writes into the manuscript, and on anything marked as hers it declines to draft (R-A-012).
// - It writes sample lines only when she asks, always labeled as an example (D-18).
// - Nothing leaves her computer unless she has turned the collaborator on for this novel (R-A-108).

import type { Structure } from './structure.js';
import { localDay } from './goals.js';
import { Store, Row, ValidationError, NotFoundError, nowIso } from './store.js';
import { BRAND } from '../brand.js';
import { Brain } from './brain.js';
import { Manuscript } from './manuscript.js';
import { Conversations } from './conversations.js';
import { Continuity } from './continuity.js';
import { settingsOf } from './settings.js';
import { statusLabel } from './labels.js';
import { STORY_TYPES, CHARACTERISTICS, FRAMEWORKS } from './catalog.js';
import { methods as myMethods, shelf as myShelf } from './methods.js';

export type Mode = 'discuss' | 'teach' | 'show' | 'hand' | 'critique' | 'resources';

export interface AiMessage { role: 'user' | 'assistant'; content: unknown }
export interface AiTool { name: string; description: string; input_schema: Record<string, unknown> }
export interface AiResponse { content: { type: string; text?: string; id?: string; name?: string; input?: unknown }[]; stop_reason: string | null }
/** The narrow surface the collaborator needs, so tests can run without the network. */
export interface AiClient { create(req: { model: string; max_tokens: number; system: string; messages: AiMessage[]; tools?: AiTool[] }): Promise<AiResponse> }

export const DEFAULT_MODEL = 'claude-opus-5-5';

/** Her own craft shelf, consulted before anything else (R-A-105). Titles and authors only; never page or chapter numbers. */
export const CRAFT_SHELF = [
  'Save the Cat! Writes a Novel, Jessica Brody', 'Save the Cat!, Blake Snyder', 'Story, Robert McKee', 'Creating Character Arcs, K. M. Weiland',
  'How to Write a Novel Using the Snowflake Method, Randy Ingermanson', 'Techniques of the Selling Writer, Dwight V. Swain',
  'The Anatomy of Story, John Truby', 'The Hidden Tools of Comedy, Steve Kaplan', 'The Moral Premise, Stanley D. Williams',
];

const MODE_TEXT: Record<Mode, string> = {
  discuss: 'Talk it through with the author as a creative partner. Ask at most one useful question at a time. Help the thinking happen.',
  teach: 'Teach it: name the idea, define every term at first use, explain why it works and the common way it fails or is misunderstood, then give a fresh example, ideally one that lands and one that fails. Do not compress.',
  show: 'Show it: give two or three examples in different flavors so there is never one right answer to match. Label every one "One way it could be done". None is a decision.',
  hand: 'Hand it to me: return the work to the author. Set up what is decided, what is open, and a prompt that invites the author to write it. Do not write it for the author.',
  critique: 'Critique: be honest, never flattering. Say what works, what does not work yet and why, and how it could be strengthened without taking over the author’s voice. Separate checkable facts from your interpretation. Frame concerns as questions.',
  resources: 'Craft resources: point the author to where to learn more about this craft problem. Start with the author’s own shelf. Name books, authors or well-known sources only. Never give chapter numbers, page numbers or quotations, and never invent a title. If you are not sure a resource exists, say so.',
};

const GUIDANCE_TEXT = {
  quiet: 'Quiet. The author is in the flow. Answer only what the author asked, briefly. Raise nothing else unless it breaks a decision or guardrail.',
  advisory: 'Advisory. Answer what the author asked, and mention at most one thing the author may want to look at next.',
  deep: 'Deep. The author wants the full conversation: teach, question, and point out structure, causality and character issues you notice.',
};

const TOOLS: AiTool[] = [
  { name: 'suggest_fact', description: 'Suggest a value for one field of a story element. It waits for the author to accept, defer or decline. Use only element ids from the context.', input_schema: { type: 'object', properties: { element_id: { type: 'string' }, field: { type: 'string', description: 'lowercase_with_underscores' }, value: { type: 'string' }, rationale: { type: 'string' } }, required: ['element_id', 'field', 'value'] } },
  { name: 'suggest_question', description: 'Suggest a question for the author to consider. It is kept apart from the author’s own questions until the author adopts it.', input_schema: { type: 'object', properties: { question: { type: 'string' }, about_element_id: { type: 'string' } }, required: ['question'] } },
  { name: 'suggest_connection', description: 'Suggest a connection between two story elements (for example causes, plants, pays_off, reveals, appears_in). It waits for the author.', input_schema: { type: 'object', properties: { from_id: { type: 'string' }, to_id: { type: 'string' }, relation: { type: 'string' }, rationale: { type: 'string' } }, required: ['from_id', 'to_id', 'relation'] } },
];

export class Collaborator {
  private key: string | null = null;
  constructor(private store: Store, private brain: Brain, private ms: Manuscript, private convs: Conversations, private continuity: Continuity, private clientFactory?: (key: string) => AiClient) {}

  /** The key lives in memory only; the desktop shell keeps it in the operating system's secure storage. */
  setKey(key: string | null) { this.key = key && key.trim() ? key.trim() : null; }
  hasKey() { return !!this.key; }

  status(projectId: string) {
    const p = this.brain.project(projectId);
    const s = settingsOf(p.profile);
    const ai = (p.profile.ai ?? {}) as Record<string, unknown>;
    return { keySet: !!this.key, enabled: !!ai.enabled, shareManuscript: !!ai.shareManuscript, model: (ai.model as string) || DEFAULT_MODEL, guidanceWhilePlanning: s.guidanceWhilePlanning, guidanceWhileDrafting: s.guidanceWhileDrafting, consentedAt: (ai.consented_at as string | null) ?? null };
  }

  /** Turning the collaborator on is her explicit consent for story records (and, separately, prose) to be sent (R-A-108). */
  configure(projectId: string, input: { enabled?: boolean; shareManuscript?: boolean; model?: string }) {
    const p = this.brain.project(projectId);
    const ai = { ...((p.profile.ai ?? {}) as Record<string, unknown>), ...input, consented_at: input.enabled ? nowIso() : (p.profile.ai as Record<string, unknown> | undefined)?.consented_at ?? null };
    this.brain.updateProject(projectId, { profile: { ...p.profile, ai } });
    return this.status(projectId);
  }

  private client(): AiClient {
    if (!this.key) throw new ValidationError('Add your Claude API key in Settings to talk with the collaborator. Everything else works without it.');
    if (this.clientFactory) return this.clientFactory(this.key);
    throw new ValidationError('The collaborator is not available in this build.');
  }

  /** What the collaborator is told about the story: her decisions first, then what is still open, then guardrails (R-A-095). */
  context(projectId: string, focusElementId?: string | null, sceneId?: string | null) {
    const p = this.brain.project(projectId);
    const st = settingsOf(p.profile);
    const ai = this.status(projectId);
    const label = (s: string) => statusLabel(s as never, st.statusLabels, st.authorName);
    const lines: string[] = [];
    lines.push(`Novel: ${p.title}`);
    const prof = p.profile as Record<string, unknown>;
    if (prof.premise_sentence) lines.push(`The author’s one sentence: ${prof.premise_sentence}`);
    // How she has set this novel up; guidance uses her chosen frameworks' vocabulary (R-B-094).
    const setup = (prof.setup ?? {}) as { genres?: { name: string; role: string }[]; storyTypes?: { key: string; role: string }[]; characteristics?: string[]; frameworkNotes?: Record<string, string> };
    if (setup.genres?.length) lines.push(`Genres: ${setup.genres.map((g) => `${g.name} (${g.role})`).join(', ')}`);
    if (setup.storyTypes?.length) lines.push(`Blake Snyder story types: ${setup.storyTypes.map((t) => `${STORY_TYPES.find((d) => d.key === t.key)?.name ?? t.key} (${t.role})`).join(', ')}`);
    if (setup.characteristics?.length) {
      const own = ((prof.setup as { customCharacteristics?: { key: string; name: string; group: string }[] } | undefined)?.customCharacteristics) ?? [];
      const named = (k: string) => { const c = CHARACTERISTICS.find((x) => x.key === k) ?? own.find((x) => x.key === k); return c ? `${c.name} (${c.group})` : k; };
      lines.push(`Narrative characteristics: ${setup.characteristics.map(named).join(', ')}`);
    }
    const fw = (prof.frameworks as string[] | undefined) ?? [];
    if (fw.length) lines.push(`The author’s storytelling toolkit (use these frameworks' terms; combinations are deliberate): ${fw.map((k) => `${FRAMEWORKS.find((f) => f.key === k)?.name ?? myMethods(this.store).find((m) => m.key === k)?.name ?? k}${setup.frameworkNotes?.[k] ? ` [how the author uses it: ${setup.frameworkNotes[k]}]` : ''}`).join('; ')}`);
    for (const m of myMethods(this.store).filter((x) => fw.includes(x.key))) {
      lines.push(`The author’s own method "${m.name}"${m.source ? ` (from ${m.source})` : ''}: ${m.job}${m.beats.length ? ` Beats: ${m.beats.map((b) => `${b.name} (${Math.round(b.at[0] * 100)}%)`).join(', ')}.` : ''}${m.questions.length ? ` Questions it asks: ${m.questions.join(' ')}` : ''}`);
    }
    if (fw.includes('discovery')) lines.push('The author discovers the story while writing. Do not push outlines or beat sheets on the author.');
    const elements = this.brain.elements(projectId).filter((e) => !['thought', 'scene_plan', 'beat'].includes(e.kind as string));
    const rows = this.store.db.prepare(
      `SELECT s.*, e.title AS element_title, e.kind AS element_kind FROM statements s JOIN elements e ON e.id=s.element_id
       WHERE s.project_id=? AND s.deleted_at IS NULL AND s.superseded_by_id IS NULL AND e.deleted_at IS NULL AND s.status <> 'set_aside'
       ORDER BY e.kind, e.title, s.field, s.made_at DESC`,
    ).all(projectId) as Row[];
    const privateFields = new Set(['tuning_fork', 'theme_music', 'playlist']);
    const byEl = new Map<string, Row[]>();
    for (const r of rows) { if (privateFields.has(r.field as string)) continue; byEl.set(r.element_id as string, [...(byEl.get(r.element_id as string) ?? []), r]); }
    lines.push('', 'STORY RECORDS (status in brackets; "Decided" items are the author’s and current; older versions are omitted; examples are never decisions):');
    for (const e of elements) {
      const st2 = byEl.get(e.id as string) ?? [];
      if (!st2.length && !e.body) continue;
      lines.push(`- [${e.id}] ${e.kind}: ${e.title}${e.reserved ? ` (kept for the author: ${e.reserved})` : ''}`);
      if (e.body && ['question', 'idea', 'line'].includes(e.kind as string)) lines.push(`    text: ${String(e.body).slice(0, 600)}`);
      for (const s of st2) {
        const q = JSON.parse((s.qualifiers_json as string) || '{}') as Record<string, unknown>;
        const who = s.speaker_kind === 'assistant' ? (q.accepted_by ? ', suggested by the assistant and accepted by the author' : ', suggested by the assistant') : '';
        lines.push(`    ${s.field} [${label(s.status as string)}${who}${q.timing ? `, timing: ${q.timing}` : ''}]: ${String(JSON.parse(s.value_json as string) ?? '(open)').slice(0, 500)}`);
      }
    }
    // Her beat sheet: every beat in order, what she has written for it, and the scene cards placed there,
    // so "I'm on beat three" means her Setup, not the Setup in general.
    lines.push(...this.beatSheet(projectId, rows, label));
    const guards = this.brain.elements(projectId, { kind: 'guardrail' });
    if (guards.length) {
      lines.push('', 'GUARDRAILS (never break these; if a suggestion would, say so):');
      for (const g of guards) lines.push(`- ${g.parent_id ? `${this.store.get('elements', g.parent_id as string)?.title}: ` : ''}${g.body || g.title}`);
    }
    const reserved = this.store.db.prepare('SELECT title, reserved FROM scenes WHERE project_id=? AND reserved IS NOT NULL AND deleted_at IS NULL').all(projectId) as Row[];
    if (reserved.length) lines.push('', 'SCENES KEPT FOR HER TO WRITE: ' + reserved.map((r) => `${r.title} (${r.reserved})`).join('; '));
    const open = this.continuity.review(projectId).open.slice(0, 12);
    if (open.length) lines.push('', 'OPEN STORY QUESTIONS THE PROGRAM HAS NOTICED:', ...open.map((f) => `- ${f.message}`));
    if (focusElementId) {
      const page = this.brain.elementPage(focusElementId);
      lines.push('', `FOCUS: ${page.element.kind} "${page.element.title}" [${focusElementId}]`);
      // Everything on the record she asked about, including beats and cards, which the list above leaves out.
      const own = rows.filter((r) => r.element_id === focusElementId);
      if (page.element.body) lines.push(`  notes: ${String(page.element.body).slice(0, 1500)}`);
      for (const r of own) lines.push(`  ${r.field} [${label(r.status as string)}]: ${String(JSON.parse(r.value_json as string) ?? '(open)').slice(0, 1500)}`);
      if (page.element.kind === 'beat') {
        const d = this.continuity.structure.beatDetail(focusElementId);
        if (d.def) lines.push(`  What this beat is (${d.template.replace(/_/g, ' ')}): ${JSON.stringify(d.def).slice(0, 1500)}`);
      }
    }
    if (sceneId) {
      const s = this.ms.scene(sceneId);
      lines.push('', `FOCUS SCENE: "${s.title}"${s.reserved ? ` (kept for the author: ${s.reserved}; do not draft it)` : ''}`);
      // Her settled draft is the truth for this scene: where it and the scene plan disagree, the draft wins.
      if (s.confirmed) lines.push('The author has settled this draft: where the prose and the scene plan disagree, the prose is right and the plan is history.');
      if (ai.shareManuscript) lines.push("The author’s prose (do not rewrite it; comment only if asked):", String(s.text).slice(-12000));
      else lines.push('(The author has not chosen to share manuscript prose with the collaborator.)');
    }
    return lines.join('\n');
  }

  /** The novel's beat sheet in order, with her own words on each beat and the cards placed there. */
  private beatSheet(projectId: string, rows: Row[], label: (s: string) => string): string[] {
    let beats: ReturnType<Structure['beats']>;
    try { beats = this.continuity.structure.beats(projectId); } catch { return []; }
    if (!beats.length) return [];
    const cards = this.brain.elements(projectId, { kind: 'scene_plan' }).concat(this.brain.elements(projectId, { kind: 'event' }));
    const placed = new Map<string, { decided: string[]; maybe: string[] }>();
    for (const c of cards) {
      const pm = this.continuity.structure.placements(c.id as string);
      if (pm.decided) { const e = placed.get(pm.decided.beatId) ?? { decided: [], maybe: [] }; e.decided.push(c.title as string); placed.set(pm.decided.beatId, e); }
      for (const m of pm.candidates) { const e = placed.get(m.beatId) ?? { decided: [], maybe: [] }; e.maybe.push(c.title as string); placed.set(m.beatId, e); }
    }
    const out = ['', `BEAT SHEET (${String(this.continuity.structure.spine(projectId) ?? '').replace(/_/g, ' ')}), in order, with the author's own words on each beat and the scene cards placed there:`];
    beats.forEach((b, i) => {
      const id = b.element.id as string;
      out.push(`${i + 1}. [${id}] ${b.element.title}${b.act ? ` (act ${b.act})` : ''}${b.element.reserved ? ` (kept for the author: ${b.element.reserved})` : ''}`);
      if (b.element.body) out.push(`    notes: ${String(b.element.body).slice(0, 600)}`);
      for (const r of rows.filter((x) => x.element_id === id)) out.push(`    ${r.field} [${label(r.status as string)}]: ${String(JSON.parse(r.value_json as string) ?? '(open)').slice(0, 600)}`);
      const p = placed.get(id);
      if (p?.decided.length) out.push(`    scenes placed here: ${p.decided.join('; ')}`);
      if (p?.maybe.length) out.push(`    scenes that might go here: ${p.maybe.join('; ')}`);
    });
    return out;
  }

  /** What she asked to be called (About you), then her name in Settings, then "You". */
  private myName(projectId: string): string {
    const r = this.store.db.prepare("SELECT value_json FROM settings WHERE key='author_profile'").get() as Row | undefined;
    const about = ((r ? JSON.parse(r.value_json as string) : {}).about ?? {}) as Record<string, string>;
    return (about.name || settingsOf(this.brain.project(projectId).profile).authorName || 'You').trim();
  }

  private system(projectId: string, mode: Mode, drafting: boolean) {
    const st = settingsOf(this.brain.project(projectId).profile);
    // Door closed: while drafting, the collaborator keeps problems to itself unless asked.
    const shut = drafting && !!st.doorClosedUntil && localDay() <= st.doorClosedUntil;
    const level = shut ? 'quiet' : drafting ? st.guidanceWhileDrafting : st.guidanceWhilePlanning;
    const about = (() => { const r = this.store.db.prepare("SELECT value_json FROM settings WHERE key='author_profile'").get() as Row | undefined; return ((r ? JSON.parse(r.value_json as string) : {}).about ?? {}) as Record<string, string>; })();
    const name = about.name || st.authorName || 'the author';
    const aboutLines = [
      about.pronouns && `Pronouns: ${about.pronouns}.`,
      about.approach && `How they find a story: ${about.approach}.`,
      about.experience && `Writing experience: ${about.experience}.`,
      about.helpStyle && `How they like to be helped: ${about.helpStyle}`,
      about.avoid && `Please avoid: ${about.avoid}`,
      about.more && `Also: ${about.more}`,
    ].filter(Boolean) as string[];
    return [
      ...(aboutLines.length ? [`ABOUT THE AUTHOR, in the author’s own words (honor these):`, ...aboutLines.map((l) => `- ${l}`), ''] : []),
      `You are the collaborator inside ${BRAND.name}, a novel-writing program. You are talking with ${name}, the author. ${BRAND.name} remembers; the author decides.`,
      'Your role: a thinking partner and story architect\'s assistant. Not a ghostwriter, not a creative director. You help the author think; the program remembers; the author decides.',
      'Rules you never break:',
      '- Never write or rewrite the author’s manuscript. Never "improve" the author’s prose or narration.',
      '- Write sample lines or prose only when the author explicitly asks, and label each "One way it could be done". Never for anything kept for the author to write; then offer questions or teaching instead.',
      '- The author’s decisions (marked Decided) are current. Do not reopen them unless the author asks. Never present a possibility, an example or your own idea as decided.',
      '- Speak to the author by name. Use the author’s pronouns when given; never assume gender, and use they when unknown.',
      '- Label what you say: what the author has decided, what is still developing or open, and what is your suggestion.',
      '- Never assign race, ethnicity, religion, age or appearance the author has not specified, and never infer one from another or from a casting reference.',
      '- Do not invent backstory or trauma to fill an empty field. A Ghost explains the Lie; it need not be tragic, and an event during the story is not a Ghost.',
      '- Honest critique, never flattery. If something does not work yet, say so kindly and specifically.',
      '- When the author compares a character to someone, treat it as borrowed qualities, not a literal copy. Ask which qualities if unclear.',
      '- Respect every guardrail. If a suggestion would break one, say which.',
      '- To propose a story fact, question or connection, use the suggestion tools; they wait for the author. Never claim something was saved or decided.',
      '- Craft resources: titles and authors only, never chapter or page numbers, never invented citations. Start with the author’s own shelf: ' + myShelf(this.store).map((b) => `${b.title}${b.author ? `, ${b.author}` : ''}${b.useFor ? ` (she uses it for: ${b.useFor})` : ''}`).join('; ') + '.',
      '- Plain, warm language. No em dashes. Short paragraphs. One useful question at most.',
      `Guidance level: ${GUIDANCE_TEXT[level as keyof typeof GUIDANCE_TEXT] ?? GUIDANCE_TEXT.advisory}`,
      ...(shut ? ['The author is drafting with the door closed: getting the story down, not getting it right. Do not point out problems, inconsistencies or weaknesses in the draft unless the author asks for them by name. Help them keep moving.'] : []),
      `Mode: ${MODE_TEXT[mode]}`,
    ].join('\n');
  }

  /** Ask the collaborator. Her message and its reply are kept word for word in the conversation; its suggestions wait for her. */
  async ask(conversationId: string, input: { text: string; mode?: Mode; focusElementId?: string | null; sceneId?: string | null }) {
    const conv = this.convs.get(conversationId);
    const pid = conv.project_id as string;
    const status = this.status(pid);
    if (!status.enabled) throw new ValidationError('The collaborator is off for this novel. Turn it on in Settings when you are ready; nothing is sent until you do.');
    if (!input.text.trim()) throw new ValidationError('Say something first.');
    const mode = input.mode ?? 'discuss';
    const client = this.client();
    const authorTurn = this.convs.addTurn(conversationId, { speaker_kind: 'author', speaker_name: this.myName(pid), text: input.text });
    const history = (this.convs.full(conversationId).turns as Row[]).slice(-30);
    const messages: AiMessage[] = [];
    for (const t of history) {
      const role = t.speaker_kind === 'assistant' ? 'assistant' : 'user';
      const last = messages[messages.length - 1];
      if (last && last.role === role) last.content = `${last.content}\n\n${t.text}`;
      else messages.push({ role, content: t.text as string });
    }
    if (messages[0]?.role === 'assistant') messages.shift();
    const ctx = this.context(pid, input.focusElementId ?? (conv.focus_element_id as string | null), input.sceneId ?? null);
    messages[0] = { role: 'user', content: `${ctx}\n\n---\n\n${messages[0]?.content ?? input.text}` };

    const suggestions: { kind: string; summary: string }[] = [];
    const pending: { kind: 'statement' | 'link' | 'question'; target: Record<string, unknown>; after: unknown; rationale?: string }[] = [];
    let text = '';
    for (let round = 0; round < 4; round++) {
      let res: AiResponse;
      try { res = await client.create({ model: status.model, max_tokens: 4000, system: this.system(pid, mode, !!input.sceneId), messages, tools: TOOLS }); }
      catch (e) {
        const code = (e as { status?: number }).status;
        if (code === 401 || code === 403) throw new ValidationError('Claude did not accept the API key. Check it in Settings. Your message is kept.');
        if (code === 429 || code === 529) throw new ValidationError('Claude is busy right now. Try again in a minute. Your message is kept.');
        throw new ValidationError('The collaborator could not be reached. Check the internet connection. Your message is kept.');
      }
      const uses = res.content.filter((c) => c.type === 'tool_use');
      const said = res.content.filter((c) => c.type === 'text').map((c) => c.text ?? '').join('').trim();
      if (said) text += (text ? '\n\n' : '') + said;
      if (!uses.length || res.stop_reason !== 'tool_use') break;
      messages.push({ role: 'assistant', content: res.content });
      const results = uses.map((u) => {
        const inp = (u.input ?? {}) as Record<string, string>;
        try {
          if (u.name === 'suggest_fact') {
            const el = this.brain.element(inp.element_id ?? '', pid);
            pending.push({ kind: 'statement', target: { elementId: el.id, field: String(inp.field ?? '').toLowerCase().replace(/[^a-z0-9_]/g, '_') }, after: { value: inp.value }, rationale: inp.rationale });
            suggestions.push({ kind: 'fact', summary: `${el.title}, ${inp.field}: ${inp.value}` });
          } else if (u.name === 'suggest_question') {
            pending.push({ kind: 'question', target: { aboutId: inp.about_element_id ?? null }, after: { text: inp.question } });
            suggestions.push({ kind: 'question', summary: String(inp.question) });
          } else if (u.name === 'suggest_connection') {
            this.brain.element(inp.from_id ?? '', pid); this.brain.element(inp.to_id ?? '', pid);
            pending.push({ kind: 'link', target: { fromId: inp.from_id, toId: inp.to_id, relation: inp.relation }, after: null, rationale: inp.rationale });
            suggestions.push({ kind: 'connection', summary: `${inp.relation}` });
          }
          return { type: 'tool_result', tool_use_id: u.id, content: 'Recorded as a suggestion. It waits for the author.' };
        } catch (e) {
          return { type: 'tool_result', tool_use_id: u.id, content: `Not recorded: ${(e as Error).message}`, is_error: true };
        }
      });
      messages.push({ role: 'user', content: results });
    }
    text = stripPageCitations(text);
    if (!text.trim()) text = suggestions.length ? 'I left my suggestions for you to look at.' : '(No reply.)';
    const reply = this.convs.addTurn(conversationId, { speaker_kind: 'assistant', speaker_name: 'Collaborator', text });
    for (const s of pending) {
      if (s.kind === 'question') {
        // A question the collaborator raises is a suggestion like any other: it becomes one of her
        // questions only when she accepts it.
        const text = String((s.after as Record<string, string>).text);
        this.brain.propose(pid, { origin: 'assistant', kind: 'element', target: { aboutId: s.target.aboutId ?? null }, after: { kind: 'question', title: text.slice(0, 80), body: text }, conversationId, turnId: reply.id as string });
      } else {
        this.brain.propose(pid, { origin: 'assistant', kind: s.kind, target: s.target, after: s.after, rationale: s.rationale, conversationId, turnId: reply.id as string });
      }
    }
    return { authorTurn, reply, suggestions };
  }

  /** Start a focused conversation for a craft question: critique a scene, check a causal chain, find resources. */
  start(projectId: string, input: { title: string; focusElementId?: string | null; mode?: Mode }) {
    const c = this.convs.create(projectId, { title: input.title, focusElementId: input.focusElementId ?? null, mode: input.mode ?? 'discuss' });
    return c;
  }
}

export function anthropicClientFactory(): (key: string) => AiClient {
  return (key: string) => ({
    async create(req) {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: key });
      const res = await client.messages.create(req as never);
      return res as unknown as AiResponse;
    },
  });
}

export function assertMode(m: string): Mode {
  if (!['discuss', 'teach', 'show', 'hand', 'critique', 'resources'].includes(m)) throw new NotFoundError('mode');
  return m as Mode;
}

/** A safety net under the prompt: the collaborator never cites chapter or page numbers it cannot verify (R-A-105). */
export function stripPageCitations(text: string) {
  return text
    .replace(/,?\s*\(?\b(?:pp?\.|pages?)\s*\d+(?:\s*[-\u2013]\s*\d+)?\)?/gi, '')
    .replace(/\s*\((?:ch\.|chapters?)\s*(?:\d+|[ivxlc]+)\)/gi, '')
    .replace(/\u2014/g, ', ');
}
