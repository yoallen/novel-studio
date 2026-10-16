// HTTP routes for the core services. Each handler validates input with zod before touching data.

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppError } from '../core/store.js';
import * as methodsLib from '../core/methods.js';
import { saveTheCatAsBeats } from '../core/structure.js';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { Services } from './app.js';
import { STATUSES, RELATIONS } from '../core/brain.js';
import { exportArchive, importArchive, planImport, snapshot, listSnapshots } from '../core/backup.js';
import { NotFoundError } from '../core/store.js';

const id = z.string().min(1).max(64);
const P = z.object({ id });
const json = z.record(z.string(), z.unknown());
const doc = z.object({ type: z.literal('doc') }).passthrough();
const speaker = z.object({ kind: z.enum(['author', 'assistant', 'source']), name: z.string().max(120).optional() });

function params<T extends z.ZodTypeAny>(req: FastifyRequest, s: T): z.infer<T> { return s.parse(req.params); }
function body<T extends z.ZodTypeAny>(req: FastifyRequest, s: T): z.infer<T> { return s.parse(req.body ?? {}); }
function query<T extends z.ZodTypeAny>(req: FastifyRequest, s: T): z.infer<T> { return s.parse(req.query ?? {}); }

export function registerRoutes(app: FastifyInstance, svc: Services) {
  const { brain, ms, store, desk, convs, structure, ripple, zoom, continuity } = svc;

  app.get('/api/health', async () => ({ ok: true, schema: store.schemaVersion() }));

  // ----- projects -----
  app.get('/api/projects', async () => brain.listProjects());
  app.post('/api/projects', async (req) => {
    const b = body(req, z.object({ title: z.string().min(1).max(300), profile: json.optional(), useDefaults: z.boolean().optional(), frameworks: z.array(z.string().max(60)).max(30).optional(), spine: z.string().max(60).nullable().optional() }));
    return svc.setup.createNovel(b.title, { profile: b.profile as Record<string, unknown> | undefined, useDefaults: b.useDefaults, frameworks: b.frameworks, spine: b.spine });
  });
  app.get('/api/projects/:id/names', async (req) => svc.lenses.names(params(req, P).id));
  app.get('/api/projects/:id/pacing', async (req) => svc.lenses.pacing(params(req, P).id));
  // ----- the cast across the story -----
  app.get('/api/projects/:id/cast', async (req) => svc.cast.presence(params(req, P).id));
  app.get('/api/projects/:id/cast/pairs', async (req) => svc.cast.pairs(params(req, P).id));
  app.post('/api/projects/:id/cast/together', async (req) => { const b = body(req, z.object({ ids: z.array(id).min(2).max(30), only: z.boolean().optional() })); return svc.cast.together(params(req, P).id, b.ids, { only: b.only }); });
  app.get('/api/projects/:id/cast/groups', async (req) => svc.cast.groups(params(req, P).id));
  app.get('/api/projects/:id/cast/bechdel', async (req) => svc.cast.bechdel(params(req, P).id));
  app.put('/api/projects/:id/cast/bechdel', async (req) => { const b = body(req, z.object({ unit: z.string().max(60), answer: z.enum(['yes', 'no']).nullable() })); return svc.cast.answerBechdel(params(req, P).id, b.unit, b.answer); });
  // ----- many books at once: stages, drafts, the shelf -----
  app.get('/api/library', async () => svc.books.shelf());
  app.get('/api/stages', async () => svc.books.stages());
  app.put('/api/projects/:id/stage', async (req) => svc.books.setStage(params(req, P).id, body(req, z.object({ stage: z.string().min(1).max(60) })).stage));
  app.get('/api/projects/:id/drafts', async (req) => svc.books.drafts(params(req, P).id));
  app.post('/api/projects/:id/drafts/complete', async (req) => svc.books.complete(params(req, P).id, body(req, z.object({ note: z.string().max(2000).optional(), nextName: z.string().max(60).optional() }))));
  app.post('/api/projects/:id/drafts/reopen', async (req) => svc.books.reopenLast(params(req, P).id));
  app.get('/api/projects/:id/drafts/:draftId/compare', async (req) => { const q = z.object({ id, draftId: id }).parse(req.params); return svc.books.compare(q.id, q.draftId); });
  app.get('/api/scenes/:id/drafts', async (req) => svc.books.sceneAcross(params(req, P).id));
  // ----- her own methods and craft shelf (author level, every novel) -----
  const beatIn = z.object({ key: z.string().max(40).optional(), name: z.string().max(80), at: z.tuple([z.number(), z.number()]), act: z.enum(['I', 'IIA', 'IIB', 'III']).optional(), description: z.string().max(4000).optional(), test: z.string().max(1000).optional(), moment: z.string().max(20).nullable().optional() });
  app.get('/api/methods', async () => ({ methods: methodsLib.methods(store), moments: methodsLib.MOMENTS }));
  app.post('/api/methods', async (req) => methodsLib.saveMethod(store, body(req, z.object({ key: z.string().max(60).optional(), name: z.string().min(1).max(80), job: z.string().max(2000).optional(), source: z.string().max(300).optional(), beats: z.array(beatIn).max(60).optional(), questions: z.array(z.string().max(500)).max(40).optional(), fields: z.array(z.object({ kind: z.string().max(60), label: z.string().max(80), prompt: z.string().max(500).optional() })).max(60).optional() })) as never));
  app.delete('/api/methods/:key', async (req) => { methodsLib.removeMethod(store, z.object({ key: z.string().max(60) }).parse(req.params).key); return { removed: true }; });
  app.get('/api/methods/start/:key', async (req) => { const k = z.object({ key: z.string().max(60) }).parse(req.params).key; return k === 'save_the_cat' ? { beats: saveTheCatAsBeats(), source: 'Save the Cat' } : methodsLib.startFrom(k); });
  app.post('/api/projects/:id/methods/:key/refresh', async (req) => { const q = z.object({ id, key: z.string().max(60) }).parse(req.params); return structure.applyTemplate(q.id, q.key).length; });
  app.get('/api/shelf', async () => methodsLib.shelf(store));
  app.put('/api/shelf', async (req) => methodsLib.setShelf(store, body(req, z.object({ books: z.array(z.object({ key: z.string().max(80).optional(), title: z.string().max(200), author: z.string().max(120), useFor: z.string().max(500) })).max(200) })).books as never));
  app.patch('/api/author-profile', async (req) => svc.setup.setAuthorProfile(body(req, z.object({ stages: z.array(z.string().min(1).max(60)).max(40).optional() })) as never));
  // ----- novel setup and author profile (R-B-088 to R-B-095) -----
  const role = z.enum(['primary', 'secondary', 'influence']);
  app.get('/api/projects/:id/setup', async (req) => svc.setup.get(params(req, P).id));
  app.patch('/api/projects/:id/setup', async (req) => svc.setup.update(params(req, P).id, body(req, z.object({
    genres: z.array(z.object({ key: z.string().max(60), name: z.string().max(80), role, parent: z.string().max(60).nullable().optional() })).max(40).optional(),
    storyTypes: z.array(z.object({ key: z.string().max(60), role })).max(10).optional(),
    characteristics: z.array(z.string().max(60)).max(60).optional(),
    customCharacteristics: z.array(z.object({ key: z.string().max(60), name: z.string().max(80), group: z.string().max(40) })).max(40).optional(),
    frameworks: z.array(z.string().max(60)).max(30).optional(),
    frameworkNotes: z.record(z.string().max(60), z.string().max(4000)).optional(),
    customFrameworks: z.array(z.object({ key: z.string().max(60), name: z.string().max(80), job: z.string().max(1000) })).max(20).optional(),
    spine: z.string().max(60).nullable().optional(),
    carryPlacements: z.boolean().optional(),
    premise: z.string().max(600).optional(),
  }).strict())));
  app.get('/api/projects/:id/setup/active', async (req) => svc.setup.activeFeatures(params(req, P).id));
  app.get('/api/author-profile', async () => svc.setup.authorProfile());
  app.post('/api/projects/:id/setup/save-as-defaults', async (req) => svc.setup.saveAsDefaults(params(req, P).id));
  app.get('/api/projects/:id', async (req) => brain.project(params(req, P).id));
  app.patch('/api/projects/:id', async (req) => {
    const b = body(req, z.object({ title: z.string().max(300).optional(), profile: json.optional(), expectVersion: z.number().int().optional() }));
    return brain.updateProject(params(req, P).id, b, b.expectVersion);
  });
  app.get('/api/projects/:id/settings', async (req) => brain.settings(params(req, P).id));
  app.patch('/api/projects/:id/settings', async (req) => {
    const step = z.object({ key: z.string(), label: z.string().max(80), drafted: z.boolean().optional() });
    const b = body(req, z.object({
      authorName: z.string().max(80).optional(),
      sceneLadder: z.array(step).min(1).max(30).optional(),
      guidanceWhileDrafting: z.enum(['quiet', 'advisory', 'deep']).optional(),
      guidanceWhilePlanning: z.enum(['quiet', 'advisory', 'deep']).optional(),
      goal: z.object({ type: z.enum(['none', 'words', 'scenes', 'time', 'milestones']), target: z.number().nullable(), note: z.string().max(500) }).optional(),
      targetWords: z.number().nullable().optional(),
      wordsPerPage: z.array(z.number()).min(1).max(4).optional(),
      statusLabels: z.partialRecord(z.enum(['established', 'developing', 'unanswered', 'illustrative', 'proposed', 'set_aside']), z.string().max(80)).optional(),
      ownedLabel: z.string().max(120).optional(),
      reservedMarkers: z.array(z.string().max(60)).max(30).optional(),
      nextWritingAction: z.string().max(500).optional(),
      watchWords: z.array(z.string().min(1).max(40)).max(100).optional(),
      importLabels: z.array(z.object({ label: z.string().min(1).max(80), status: z.enum(['established', 'developing', 'unanswered', 'illustrative', 'proposed', 'set_aside']) })).max(80).optional(),
    }).strict());
    return brain.updateSettings(params(req, P).id, b);
  });
  app.delete('/api/projects/:id', async (req) => { brain.archiveProject(params(req, P).id); return { archived: true }; });

  // ----- elements -----
  app.get('/api/projects/:id/elements', async (req) => {
    const q = query(req, z.object({ kind: z.string().max(60).optional() }));
    return brain.elements(params(req, P).id, q);
  });
  app.post('/api/projects/:id/elements', async (req) => {
    const b = body(req, z.object({ kind: z.string(), title: z.string().max(500), body: z.string().max(2_000_000).optional(), state: z.string().optional(), parentId: id.nullable().optional(), sortKey: z.number().optional(), attrs: json.optional(), reserved: z.string().max(120).nullable().optional() }));
    return brain.createElement(params(req, P).id, b);
  });
  app.get('/api/projects/:id/deleted', async (req) => {
    const pid = params(req, P).id; brain.project(pid);
    return { elements: brain.deletedElements(pid), scenes: ms.deletedScenes(pid), chapters: ms.deletedChapters(pid) };
  });
  app.get('/api/elements/:id', async (req) => brain.elementView(params(req, P).id));
  app.patch('/api/elements/:id', async (req) => {
    const b = body(req, z.object({ title: z.string().max(500).optional(), body: z.string().max(2_000_000).optional(), state: z.string().optional(), parentId: id.nullable().optional(), sortKey: z.number().optional(), attrs: json.optional(), reserved: z.string().max(120).nullable().optional(), expectVersion: z.number().int().optional() }));
    return brain.updateElement(params(req, P).id, b, b.expectVersion);
  });
  app.delete('/api/elements/:id', async (req) => { brain.deleteElement(params(req, P).id); return { deleted: true }; });
  app.post('/api/elements/:id/restore', async (req) => { brain.restoreElement(params(req, P).id); return { restored: true }; });
  app.post('/api/elements/:id/refile', async (req) => {
    const b = body(req, z.object({ kind: z.enum(['question', 'idea', 'note']) }));
    return brain.refile(params(req, P).id, b.kind);
  });

  // ----- statements -----
  app.post('/api/elements/:id/statements', async (req) => {
    const b = body(req, z.object({
      field: z.string(), value: z.unknown(), status: z.enum(STATUSES), speaker: speaker.optional(),
      sourceId: id.nullable().optional(), excerptId: id.nullable().optional(), madeAt: z.string().datetime().optional(),
      supersedes: z.union([id, z.array(id), z.literal('current')]).nullable().optional(), note: z.string().max(5000).optional(),
      turnId: id.nullable().optional(), qualifiers: json.optional(),
    }));
    return brain.addStatement({ ...b, elementId: params(req, P).id, speaker: b.speaker ?? { kind: 'author' } });
  });
  app.get('/api/elements/:id/fields/:field', async (req) => {
    const p = params(req, z.object({ id, field: z.string() }));
    brain.element(p.id);
    return brain.field(p.id, p.field);
  });
  app.post('/api/statements/:id/status', async (req) => {
    const b = body(req, z.object({ status: z.enum(STATUSES), replaceCurrent: z.boolean().optional() }));
    return brain.setStatementStatus(params(req, P).id, b.status, { replaceCurrent: b.replaceCurrent });
  });
  app.delete('/api/statements/:id', async (req) => { brain.retractStatement(params(req, P).id); return { removed: true }; });
  app.get('/api/statements/:id/provenance', async (req) => brain.statementProvenance(params(req, P).id));

  // ----- sources -----
  app.get('/api/projects/:id/sources', async (req) => brain.sources(params(req, P).id));
  app.post('/api/projects/:id/sources', async (req) => {
    const b = body(req, z.object({ kind: z.enum(['story_bible', 'archive', 'conversation', 'spreadsheet', 'author_entry', 'ai_session', 'document', 'other']), name: z.string().min(1).max(300), madeAt: z.string().nullable().optional(), notes: z.string().max(5000).optional() }));
    return brain.addSource(params(req, P).id, b);
  });

  // ----- links -----
  app.get('/api/projects/:id/links', async (req) => brain.links(params(req, P).id));
  app.post('/api/projects/:id/links', async (req) => {
    const b = body(req, z.object({ fromId: id, toId: id, relation: z.enum(RELATIONS), strength: z.enum(['direct', 'inferred']).optional(), note: z.string().max(5000).optional() }));
    return brain.link(params(req, P).id, b);
  });
  app.delete('/api/links/:id', async (req) => { brain.unlink(params(req, P).id); return { removed: true }; });

  // ----- capture and search -----
  app.post('/api/projects/:id/capture', async (req) => {
    const b = body(req, z.object({ text: z.string().max(2_000_000), kind: z.enum(['thought', 'question', 'idea']).optional(), linkTo: z.array(id).optional(), urgency: z.enum(['now', 'later']).optional() }));
    return brain.capture(params(req, P).id, b.text, { kind: b.kind, linkTo: b.linkTo, urgency: b.urgency });
  });
  app.get('/api/search', async (req) => {
    const q = query(req, z.object({ q: z.string().max(500), project: id.optional() }));
    return brain.search(q.project ?? null, q.q);
  });

  // ----- manuscript -----
  app.get('/api/projects/:id/outline', async (req) => { const pid = params(req, P).id; brain.project(pid); return { chapters: ms.outline(pid), totalWords: ms.totalWords(pid) }; });
  app.post('/api/projects/:id/chapters', async (req) => {
    const b = body(req, z.object({ title: z.string().max(300).optional(), after: id.nullable().optional() }));
    return ms.addChapter(params(req, P).id, b.title, b.after);
  });
  app.post('/api/projects/:id/chapters/order', async (req) => {
    ms.reorderChapters(params(req, P).id, body(req, z.object({ order: z.array(id) })).order); return { ok: true };
  });
  app.patch('/api/chapters/:id', async (req) => {
    const b = body(req, z.object({ title: z.string().max(300), expectVersion: z.number().int().optional() }));
    return ms.renameChapter(params(req, P).id, b.title, b.expectVersion);
  });
  app.delete('/api/chapters/:id', async (req) => { ms.deleteChapter(params(req, P).id); return { deleted: true }; });
  app.post('/api/chapters/:id/restore', async (req) => { ms.restoreChapter(params(req, P).id); return { restored: true }; });
  app.post('/api/chapters/:id/scenes', async (req) => {
    const b = body(req, z.object({ title: z.string().max(300).optional(), text: z.string().max(20_000_000).optional(), doc: doc.optional(), afterSceneId: id.nullable().optional(), status: z.string().max(40).optional() }));
    return ms.addScene(params(req, P).id, b);
  });
  app.get('/api/scenes/:id', async (req) => ms.scene(params(req, P).id));
  app.patch('/api/scenes/:id', async (req) => {
    const b = body(req, z.object({ title: z.string().max(300).optional(), status: z.string().max(40).optional(), povElementId: id.nullable().optional(), planElementId: id.nullable().optional(), confirmed: z.boolean().optional(), reserved: z.string().max(120).nullable().optional(), notes: z.string().max(200_000).optional(), expectVersion: z.number().int().optional() }));
    return ms.updateSceneMeta(params(req, P).id, b, b.expectVersion);
  });
  app.put('/api/scenes/:id/prose', async (req) => {
    const b = body(req, z.object({ doc, expectVersion: z.number().int(), reason: z.string().max(200).optional() }));
    return ms.saveScene(params(req, P).id, b);
  });
  app.put('/api/scenes/:id/autosave', async (req) => {
    const b = body(req, z.object({ doc, baseVersion: z.number().int() }));
    return ms.autosave(params(req, P).id, b.doc, b.baseVersion);
  });
  app.get('/api/scenes/:id/recovery', async (req) => ms.recoveryDoc(params(req, P).id));
  app.delete('/api/scenes/:id/recovery', async (req) => { ms.clearAutosave(params(req, P).id); return { cleared: true }; });
  app.get('/api/projects/:id/recoveries', async (req) => ms.pendingRecoveries(params(req, P).id));
  app.post('/api/scenes/:id/move', async (req) => {
    const b = body(req, z.object({ chapterId: id, index: z.number().int().min(0) }));
    ms.moveScene(params(req, P).id, b.chapterId, b.index); return { moved: true };
  });
  app.delete('/api/scenes/:id', async (req) => { ms.deleteScene(params(req, P).id); return { deleted: true }; });
  app.post('/api/scenes/:id/restore', async (req) => { ms.restoreScene(params(req, P).id); return { restored: true }; });
  app.get('/api/scenes/:id/revisions', async (req) => ms.revisions(params(req, P).id));
  app.get('/api/revisions/:id', async (req) => ms.revision(params(req, P).id));
  app.post('/api/scenes/:id/revisions/:rid/restore', async (req) => {
    const p = params(req, z.object({ id, rid: id }));
    return ms.restoreRevision(p.id, p.rid);
  });

  // ----- writing state, trail, sessions -----
  app.get('/api/projects/:id/writing-state', async (req) => { const pid = params(req, P).id; brain.project(pid); return { state: ms.writingState(pid), trail: ms.openTrail(pid), recoveries: ms.pendingRecoveries(pid) }; });
  app.put('/api/projects/:id/writing-state', async (req) => {
    const b = body(req, z.object({ sceneId: id.nullable().optional(), cursor: z.unknown().optional(), view: z.unknown().optional() }));
    ms.setWritingState(params(req, P).id, b); return { ok: true };
  });
  app.post('/api/projects/:id/trail', async (req) => {
    const b = body(req, z.object({ from: z.unknown(), to: z.unknown(), reason: z.string().max(2000).optional() }));
    return ms.leave(params(req, P).id, b.from, b.to, b.reason);
  });
  app.post('/api/projects/:id/trail/return', async (req) => { ms.returnFromTrail(params(req, P).id); return { ok: true }; });
  app.post('/api/projects/:id/sessions/start', async (req) => { const pid = params(req, P).id; brain.project(pid); return ms.startSession(pid); });
  app.post('/api/projects/:id/sessions/end', async (req) => ms.endSession(params(req, P).id, body(req, z.object({ note: z.string().max(5000).optional() })).note));
  app.get('/api/projects/:id/sessions', async (req) => ms.sessions(params(req, P).id));

  // ----- writing desk -----
  app.get('/api/scenes/:id/context', async (req) => desk.sceneContext(params(req, P).id));
  app.post('/api/scenes/:id/plan', async (req) => {
    const b = body(req, z.object({ field: z.string().max(40), value: z.string().min(1).max(200_000), status: z.enum(['established', 'developing', 'unanswered']).optional() }));
    return desk.setPlanField(params(req, P).id, b.field, b.value, b.status);
  });
  app.post('/api/scenes/:id/capture', async (req) => {
    const b = body(req, z.object({ text: z.string().max(2_000_000), kind: z.enum(['thought', 'question', 'idea']).optional(), urgency: z.enum(['now', 'later']).optional() }));
    return desk.captureForScene(params(req, P).id, b.text, b);
  });
  app.get('/api/projects/:id/where-was-i', async (req) => desk.whereWasI(params(req, P).id));
  app.get('/api/projects/:id/next-action', async (req) => desk.nextWritingAction(params(req, P).id));
  app.get('/api/projects/:id/this-week', async (req) => desk.thisWeek(params(req, P).id));
  app.get('/api/projects/:id/trail', async (req) => { const pid = params(req, P).id; brain.project(pid); return ms.trail(pid); });
  app.post('/api/trail/:id/resolve', async (req) => {
    const b = body(req, z.object({ resolved: z.boolean(), outcome: z.string().max(2000).optional() }));
    ms.resolveTrail(params(req, P).id, b.resolved, b.outcome); return { ok: true };
  });

  // ----- story brain -----
  app.get('/api/projects/:id/kinds', async (req) => brain.kinds(params(req, P).id));
  app.post('/api/projects/:id/kinds', async (req) => brain.defineKind(params(req, P).id, body(req, z.object({ label: z.string().max(80), plural: z.string().max(80).optional(), description: z.string().max(2000).optional() }))));
  app.get('/api/projects/:id/fields', async (req) => brain.fieldsFor(params(req, P).id, query(req, z.object({ kind: z.string().max(60) })).kind));
  app.post('/api/projects/:id/fields', async (req) => brain.defineField(params(req, P).id, body(req, z.object({ kind: z.string().max(60), label: z.string().max(80), group: z.string().max(80).optional(), prompt: z.string().max(1000).optional(), multi: z.boolean().optional(), private: z.boolean().optional() }))));
  app.delete('/api/fields/:id', async (req) => { brain.removeField(params(req, P).id); return { removed: true }; });
  app.get('/api/elements/:id/page', async (req) => brain.elementPage(params(req, P).id));
  app.get('/api/projects/:id/open-decisions', async (req) => brain.openDecisions(params(req, P).id));
  app.get('/api/projects/:id/proposals', async (req) => { const pid = params(req, P).id; brain.project(pid); return brain.proposals(pid, query(req, z.object({ status: z.enum(['pending', 'accepted', 'rejected', 'deferred']).optional() })).status); });
  app.post('/api/projects/:id/proposals', async (req) => {
    const b = body(req, z.object({ origin: z.string().max(80), kind: z.enum(['statement', 'element', 'link']), target: json, after: z.unknown(), before: z.unknown().optional(), rationale: z.string().max(10_000).optional(), conversationId: id.nullable().optional(), turnId: id.nullable().optional() }));
    return brain.propose(params(req, P).id, b);
  });
  app.post('/api/proposals/:id/accept', async (req) => brain.acceptProposal(params(req, P).id, body(req, z.object({ status: z.enum(['established', 'developing']).optional(), value: z.unknown().optional() }))));
  app.post('/api/proposals/:id/decide', async (req) => brain.decideProposal(params(req, P).id, body(req, z.object({ status: z.enum(['rejected', 'deferred', 'pending']) })).status));

  // ----- structure, Narrative Zoom, the Ripple Effect -----
  app.post('/api/projects/:id/structure/save-the-cat', async (req) => structure.applySaveTheCat(params(req, P).id).length);
  app.get('/api/projects/:id/landmarks', async (req) => structure.landmarks(params(req, P).id));
  app.get('/api/projects/:id/board', async (req) => structure.board(params(req, P).id));
  app.get('/api/beats/:id', async (req) => structure.beatDetail(params(req, P).id));
  app.get('/api/projects/:id/structure-questions', async (req) => structure.questions(params(req, P).id, query(req, z.object({ profile: z.string().max(60).optional() })).profile));
  app.post('/api/projects/:id/cards', async (req) => structure.addCard(params(req, P).id, body(req, z.object({ title: z.string().min(1).max(300), beatId: id.nullable().optional(), mode: z.enum(['decide', 'candidate']).optional() }))));
  app.post('/api/elements/:id/place', async (req) => { const b = body(req, z.object({ beatId: id, mode: z.enum(['decide', 'candidate']).optional() })); return structure.place(params(req, P).id, b.beatId, b.mode); });
  app.post('/api/elements/:id/write-scene', async (req) => {
    const planId = params(req, P).id;
    const el = brain.element(planId);
    if (el.kind !== 'scene_plan') throw new NotFoundError('scene card');
    const existing = store.db.prepare('SELECT id FROM scenes WHERE plan_element_id=? AND deleted_at IS NULL').get(planId) as { id: string } | undefined;
    if (existing) return ms.scene(existing.id);
    const b = body(req, z.object({ chapterId: id.optional() }));
    const pid = el.project_id as string;
    let chapterId = b.chapterId ?? (ms.outline(pid).at(-1)?.id as string | undefined);
    if (!chapterId) chapterId = ms.addChapter(pid).id;
    const sc = ms.addScene(chapterId, { title: el.title as string });
    ms.updateSceneMeta(sc.id as string, { planElementId: planId });
    return ms.scene(sc.id as string);
  });
  const op = z.discriminatedUnion('type', [
    z.object({ type: z.literal('moveScene'), sceneId: id, chapterId: id, index: z.number().int().min(0) }),
    z.object({ type: z.literal('moveCard'), planId: id, beatId: id.nullable(), beforePlanId: id.nullable().optional() }),
    z.object({ type: z.literal('moveElement'), elementId: id, fromPlanId: id, toPlanId: id }),
  ]);
  app.post('/api/projects/:id/ripple/preview', async (req) => ripple.preview(params(req, P).id, body(req, z.object({ op })).op));
  app.post('/api/projects/:id/ripple/commit', async (req) => ripple.commit(params(req, P).id, body(req, z.object({ op })).op));
  app.get('/api/projects/:id/ripple/current', async (req) => ripple.current(params(req, P).id));
  app.get('/api/projects/:id/alternates', async (req) => ripple.alternates(params(req, P).id));
  app.post('/api/projects/:id/alternates', async (req) => { const b = body(req, z.object({ name: z.string().max(200), ops: z.array(op).min(1).max(50), note: z.string().max(5000).optional() })); return ripple.saveAlternate(params(req, P).id, b.name, b.ops, b.note); });
  app.get('/api/alternates/:id/compare', async (req) => ripple.compareAlternate(params(req, P).id));
  app.post('/api/alternates/:id/adopt', async (req) => ripple.adoptAlternate(params(req, P).id));
  app.delete('/api/alternates/:id', async (req) => { ripple.discardAlternate(params(req, P).id); return { discarded: true }; });
  const node = z.discriminatedUnion('level', [
    z.object({ level: z.literal('story') }),
    z.object({ level: z.literal('act'), key: z.string().max(10) }),
    z.object({ level: z.literal('beat'), id }),
    z.object({ level: z.literal('card'), id }),
    z.object({ level: z.literal('element'), id }),
  ]);
  app.post('/api/projects/:id/zoom', async (req) => zoom.view(params(req, P).id, body(req, z.object({ node })).node));
  app.get('/api/scenes/:id/locate', async (req) => { const s = ms.scene(params(req, P).id); return zoom.locateScene(s.project_id as string, s.id as string); });

  // ----- continuity -----
  app.post('/api/projects/:id/storyworld', async (req) => continuity.storyWorld(params(req, P).id, true));
  const povShape = z.object({ person: z.string().max(40).optional(), tense: z.string().max(40).optional(), distance: z.string().max(80).optional(), reliability: z.string().max(80).optional(), function: z.string().max(2000).optional(), narrator: id.nullable().optional(), also: z.array(id).max(10).optional() }).strict();
  app.patch('/api/chapters/:id/pov', async (req) => { const b = body(req, z.object({ povElementId: id.nullable().optional(), pov: povShape.optional() })); return continuity.setChapterPov(params(req, P).id, b); });
  app.patch('/api/scenes/:id/pov', async (req) => continuity.setScenePov(params(req, P).id, body(req, z.object({ pov: povShape })).pov));
  app.get('/api/projects/:id/pov', async (req) => continuity.povCoverage(params(req, P).id));
  app.get('/api/projects/:id/timelines', async (req) => continuity.timelines(params(req, P).id));
  app.get('/api/projects/:id/knowledge', async (req) => continuity.knowledge(params(req, P).id));
  app.get('/api/projects/:id/clues', async (req) => continuity.clues(params(req, P).id));
  app.get('/api/projects/:id/storylines', async (req) => continuity.storylines(params(req, P).id));
  app.get('/api/projects/:id/secret-log', async (req) => continuity.secretLog(params(req, P).id));
  app.get('/api/projects/:id/motifs', async (req) => continuity.motifs(params(req, P).id));
  app.get('/api/projects/:id/review', async (req) => continuity.review(params(req, P).id));
  app.post('/api/projects/:id/review/respond', async (req) => continuity.respond(params(req, P).id, body(req, z.object({ key: z.string().min(1).max(500), status: z.enum(['intentional', 'deferred', 'resolved']), note: z.string().max(5000).optional(), text: z.string().max(5000).optional() }))));
  app.delete('/api/finding-notes/:id', async (req) => { continuity.reopen(params(req, P).id); return { reopened: true }; });

  // ----- the collaborator (off until she turns it on; the key never leaves this process) -----
  app.get('/api/projects/:id/ai', async (req) => svc.ai.status(params(req, P).id));
  app.patch('/api/projects/:id/ai', async (req) => svc.ai.configure(params(req, P).id, body(req, z.object({ enabled: z.boolean().optional(), shareManuscript: z.boolean().optional(), model: z.string().regex(/^[a-z0-9.-]{3,60}$/).optional() }))));
  app.put('/api/ai/key', async (req) => { const b = body(req, z.object({ key: z.string().max(400).nullable() })); svc.ai.setKey(b.key); return { keySet: svc.ai.hasKey() }; });
  app.get('/api/projects/:id/ai/context', async (req) => { const q = z.object({ element: id.optional(), scene: id.optional() }).parse(req.query); return { text: svc.ai.context(params(req, P).id, q.element ?? null, q.scene ?? null) }; });
  app.post('/api/conversations/:id/ask', async (req) => svc.ai.ask(params(req, P).id, body(req, z.object({ text: z.string().min(1).max(200_000), mode: z.enum(['discuss', 'teach', 'show', 'hand', 'critique', 'resources']).optional(), focusElementId: id.nullable().optional(), sceneId: id.nullable().optional() }))));

  // ----- conversations -----
  app.get('/api/projects/:id/conversations', async (req) => { const pid = params(req, P).id; brain.project(pid); return convs.list(pid); });
  app.post('/api/projects/:id/conversations', async (req) => convs.create(params(req, P).id, body(req, z.object({ title: z.string().max(300), focusElementId: id.nullable().optional(), mode: z.string().max(40).optional() }))));
  app.post('/api/projects/:id/conversations/import', async (req) => {
    const b = body(req, z.object({ title: z.string().min(1).max(300), text: z.string().min(1).max(50_000_000), focusElementId: id.nullable().optional() }));
    const pid = params(req, P).id;
    return convs.importText(pid, { ...b, authorName: brain.settings(pid).authorName });
  });
  app.get('/api/conversations/:id', async (req) => convs.full(params(req, P).id));
  app.post('/api/conversations/:id/turns', async (req) => convs.addTurn(params(req, P).id, body(req, z.object({ speaker_kind: z.enum(['author', 'assistant', 'source']), speaker_name: z.string().max(120).optional(), text: z.string().max(2_000_000), said_at: z.string().datetime().nullable().optional() }))));
  const range = { start: z.number().int().min(0), end: z.number().int().min(1) };
  app.post('/api/turns/:id/keep', async (req) => { const b = body(req, z.object({ ...range, linkTo: z.array(id).optional(), note: z.string().max(2000).optional() })); return convs.keep(params(req, P).id, b.start, b.end, b); });
  app.post('/api/turns/:id/possibility', async (req) => { const b = body(req, z.object({ ...range, elementId: id, field: z.string().max(64) })); return convs.possibility(params(req, P).id, b.start, b.end, b); });
  app.post('/api/turns/:id/capture', async (req) => { const b = body(req, z.object({ ...range, kind: z.enum(['question', 'idea']), linkTo: z.array(id).optional() })); return convs.capture(params(req, P).id, b.start, b.end, b.kind, b); });
  app.post('/api/turns/:id/not-canon', async (req) => { const b = body(req, z.object({ ...range, note: z.string().max(2000).optional() })); return convs.notCanon(params(req, P).id, b.start, b.end, b.note); });
  app.delete('/api/marks/:id', async (req) => { convs.removeMark(params(req, P).id); return { removed: true }; });
  app.get('/api/conversations/:id/harvest', async (req) => convs.harvest(params(req, P).id));
  app.post('/api/conversations/:id/harvested', async (req) => { convs.markHarvested(params(req, P).id); return { ok: true }; });
  app.get('/api/origin', async (req) => {
    const q = query(req, z.object({ statement: id.optional(), element: id.optional() }));
    const turn = convs.originOf({ statementId: q.statement, elementId: q.element });
    // A fact can also come from a document: the passage it was read from, and what was noted about it.
    const st = q.statement ? store.get('statements', q.statement) : undefined;
    const src = st?.source_id ? store.get('sources', st.source_id as string) : undefined;
    const ex = st?.excerpt_id ? store.get('excerpts', st.excerpt_id as string) : undefined;
    const document = src && src.kind !== 'conversation' ? { name: src.name, kind: src.kind, madeAt: src.made_at ?? null, locator: ex?.locator ?? null, text: ex?.text ?? null } : null;
    const note = (st?.note as string | undefined) || null;
    if (!turn && !document && !note) return { none: true };
    return { ...(turn ?? {}), hasTurn: !!turn, document, note };
  });

  // ----- history -----
  app.get('/api/projects/:id/history', async (req) => { const pid = params(req, P).id; brain.project(pid); return store.history(pid); });
  app.get('/api/history/:table/:id', async (req) => {
    const p = params(req, z.object({ table: z.enum(['elements', 'statements', 'links', 'chapters', 'scenes', 'projects']), id }));
    return store.recordHistory(p.table, p.id);
  });
  app.post('/api/batches/:id/undo', async (req) => {
    const b = body(req, z.object({ force: z.boolean().optional() }));
    return store.revert(params(req, P).id, 'author', { force: b.force });
  });

  // ----- import: files come in, she reviews, then applies (R-B-068 to R-B-075) -----
  const fileBody = z.object({ name: z.string().min(1).max(260), data: z.string().max(80_000_000) });
  const decode = (b64: string) => { const buf = Buffer.from(b64, 'base64'); if (!buf.length) throw new AppError('invalid', 'The file is empty.'); return buf; };
  app.get('/api/projects/:id/imports', async (req) => svc.importer.list(params(req, P).id));
  app.post('/api/projects/:id/imports', async (req) => {
    const pid = params(req, P).id;
    const b = body(req, fileBody.extend({ kind: z.enum(['manuscript', 'document', 'sheet', 'roundtrip']), docKind: z.enum(['story_bible', 'archive', 'document']).optional(), madeAt: z.string().datetime().nullable().optional() }));
    const file = { name: b.name, data: decode(b.data) };
    if (b.kind === 'manuscript') return svc.importer.startManuscript(pid, file);
    if (b.kind === 'sheet') return svc.importer.startSheet(pid, file);
    if (b.kind === 'roundtrip') return svc.importer.startRoundtrip(pid, file);
    return svc.importer.startDocument(pid, { ...file, kind: b.docKind, madeAt: b.madeAt ?? null });
  });
  app.get('/api/imports/:id', async (req) => svc.importer.get(params(req, P).id));
  const flag = z.object({ title: z.string().max(200).optional(), include: z.boolean().optional(), joinPrevious: z.boolean().optional() });
  app.patch('/api/imports/:id', async (req) => {
    const b = body(req, z.object({
      version: z.number().int().optional(),
      chapters: z.record(z.string(), flag).optional(), scenes: z.record(z.string(), flag).optional(),
      docDate: z.string().datetime().nullable().optional(),
      items: z.record(z.string(), z.object({ include: z.boolean().optional(), elementId: id.nullable().optional(), field: z.string().max(64).nullable().optional(), status: z.enum(['established', 'developing', 'unanswered', 'illustrative', 'proposed', 'set_aside', 'unlabeled']).optional(), arc: z.boolean().optional() })).optional(),
      newElements: z.record(z.string(), z.object({ title: z.string().max(200).optional(), kind: z.string().max(40).optional() })).optional(),
      density: z.number().int().optional(), useCorrections: z.boolean().optional(), profileName: z.string().max(120).optional(), keepGuidance: z.boolean().optional(),
      keepComments: z.boolean().optional(), asMethod: z.boolean().optional(),
      roundtrip: z.record(z.string().max(60), z.object({ useEditor: z.boolean().optional(), all: z.enum(['accept', 'reject', 'clear']).optional(), decisions: z.record(z.string().max(200), z.enum(['accept', 'reject']).nullable()).optional() })).optional(),
    }).strict());
    const { version, ...edits } = b;
    return svc.importer.edit(params(req, P).id, edits, version);
  });
  app.post('/api/imports/:id/apply', async (req) => svc.importer.apply(params(req, P).id));
  app.post('/api/imports/:id/discard', async (req) => svc.importer.discard(params(req, P).id));
  app.get('/api/projects/:id/documents', async (req) => svc.importer.sources(params(req, P).id));
  app.get('/api/sources/:id', async (req) => svc.importer.source(params(req, P).id));

  // ----- export: choose, see what a format cannot keep, then a checked file (R-B-076 to R-B-081) -----
  const exportReq = z.object({
    format: z.enum(['docx', 'rtf', 'txt', 'md', 'pdf', 'epub', 'odt', 'html', 'json']),
    draftId: id.nullable().optional(),
    manuscript: z.boolean(),
    chapterIds: z.array(id).max(2000).nullable().optional(),
    sections: z.array(z.enum(['characters', 'beats', 'places', 'set_pieces', 'open_decisions', 'setups_payoffs', 'timeline', 'all_records'])).max(8),
    includePrivate: z.boolean().default(false),
    includeExamples: z.boolean().default(true),
    chapterHeading: z.enum(['number_title', 'number', 'title']).default('number_title'),
    options: z.object({ sceneBreak: z.string().min(1).max(20).optional(), sceneTitles: z.boolean().optional(), titlePage: z.boolean().optional(), manuscriptFormat: z.boolean().optional(), chapterOnNewPage: z.boolean().optional() }).default({}),
  });
  app.get('/api/projects/:id/export/presets', async (req) => svc.exporter.presets(params(req, P).id));
  app.post('/api/projects/:id/export/presets', async (req) => { const b = body(req, z.object({ name: z.string().min(1).max(80), description: z.string().max(300).optional(), request: exportReq.partial() })); return svc.exporter.savePreset(params(req, P).id, b); });
  app.delete('/api/projects/:id/export/presets/:key', async (req) => { const q = z.object({ id: id, key: z.string().max(60) }).parse(req.params); return svc.exporter.deletePreset(q.id, q.key); });
  app.post('/api/projects/:id/export/preview', async (req) => {
    const pid = params(req, P).id;
    const r = body(req, exportReq);
    const book = svc.exporter.book(pid, r);
    const { lossesFor, FORMAT_INFO } = await import('../core/io/writers.js');
    return { losses: r.format === 'json' ? [] : lossesFor(book, r.format), label: r.format === 'json' ? 'Data (.json)' : FORMAT_INFO[r.format].label, chapters: book.chapters.map((c) => ({ number: c.number, heading: c.heading, scenes: c.scenes.length })), sections: book.extras.map((e) => e.heading) };
  });
  app.post('/api/projects/:id/export', async (req) => {
    const r = await svc.exporter.export(params(req, P).id, body(req, exportReq));
    return { filename: r.filename, mime: r.mime, data: r.data.toString('base64'), bytes: r.data.length, losses: r.losses, verification: r.verification };
  });
  app.post('/api/projects/:id/export/beat-sheet', async (req) => {
    const b = body(req, z.object({ profile: z.string().max(60).default('brody') }));
    const r = await svc.exporter.beatSheet(params(req, P).id, b.profile);
    return { filename: r.filename, mime: r.mime, data: r.data.toString('base64'), bytes: r.data.length, losses: r.losses, verification: r.verification };
  });

  // ----- backups and archives -----
  app.get('/api/projects/:id/archive', async (req) => exportArchive(store, params(req, P).id));
  app.post('/api/archive/plan', async (req) => {
    const b = body(req, z.object({ archive: z.unknown(), asCopy: z.boolean().optional() }));
    return planImport(store, b.archive, { asCopy: b.asCopy });
  });
  app.post('/api/archive/import', async (req) => {
    const b = body(req, z.object({ archive: z.unknown(), asCopy: z.boolean().optional() }));
    return importArchive(store, b.archive, { asCopy: b.asCopy });
  });
  // ----- starting novels that ship with the program (her own planning, already built) -----
  const seedFiles = () => {
    const dir = svc.opts.seedDir;
    if (!dir || !existsSync(dir)) return [] as string[];
    return readdirSync(dir).filter((f) => f.endsWith('.storycanon.json'));
  };
  const readSeed = (file: string) => {
    if (!seedFiles().includes(file)) throw new NotFoundError('starting novel');
    return JSON.parse(readFileSync(join(svc.opts.seedDir!, file), 'utf8')) as { project_id: string; title: string; counts: Record<string, number> };
  };
  const dismissedSeeds = () => { const r = store.db.prepare("SELECT value_json FROM settings WHERE key='seeds_dismissed'").get() as { value_json: string } | undefined; return r ? JSON.parse(r.value_json) as string[] : []; };
  app.get('/api/seeds', async () => seedFiles().filter((f) => !dismissedSeeds().includes(f)).map((file) => {
    const a = readSeed(file);
    const present = !!store.db.prepare('SELECT 1 FROM projects WHERE id=?').get(a.project_id);
    return { file, title: a.title, present, counts: { records: a.counts.elements ?? 0, statements: a.counts.statements ?? 0, turns: a.counts.turns ?? 0, passages: a.counts.excerpts ?? 0 } };
  }).filter((x) => !x.present));
  app.post('/api/seeds/open', async (req) => {
    const b = body(req, z.object({ file: z.string().min(1).max(200) }));
    return importArchive(store, readSeed(b.file));
  });
  app.post('/api/seeds/dismiss', async (req) => {
    const b = body(req, z.object({ file: z.string().min(1).max(200) }));
    store.db.prepare("INSERT INTO settings(key,value_json) VALUES ('seeds_dismissed',?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json").run(JSON.stringify([...new Set([...dismissedSeeds(), b.file])]));
    return { dismissed: true };
  });
  app.post('/api/backups/snapshot', async () => snapshot(store, svc.opts.backupDir, 'manual', 50));
  app.get('/api/backups', async () => listSnapshots(svc.opts.backupDir));

  app.all('/api/*', async () => { throw new NotFoundError('endpoint'); });
}
