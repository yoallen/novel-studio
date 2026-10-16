// HTTP routes for the core services. Each handler validates input with zod before touching data.

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import type { Services } from './app.js';
import { STATUSES, RELATIONS, ELEMENT_KINDS } from '../core/brain.js';
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
  const { brain, ms, store, desk } = svc;

  app.get('/api/health', async () => ({ ok: true, schema: store.schemaVersion() }));

  // ----- projects -----
  app.get('/api/projects', async () => brain.listProjects());
  app.post('/api/projects', async (req) => {
    const b = body(req, z.object({ title: z.string().min(1).max(300), profile: json.optional() }));
    return brain.createProject(b.title, b.profile ?? {});
  });
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
      statusLabels: z.record(z.enum(['established', 'developing', 'unanswered', 'illustrative', 'proposed', 'set_aside']), z.string().max(80)).optional(),
      ownedLabel: z.string().max(120).optional(),
      reservedMarkers: z.array(z.string().max(60)).max(30).optional(),
      nextWritingAction: z.string().max(500).optional(),
    }).strict());
    return brain.updateSettings(params(req, P).id, b);
  });
  app.delete('/api/projects/:id', async (req) => { brain.archiveProject(params(req, P).id); return { archived: true }; });

  // ----- elements -----
  app.get('/api/projects/:id/elements', async (req) => {
    const q = query(req, z.object({ kind: z.enum(ELEMENT_KINDS).optional() }));
    return brain.elements(params(req, P).id, q);
  });
  app.post('/api/projects/:id/elements', async (req) => {
    const b = body(req, z.object({ kind: z.string(), title: z.string().max(500), body: z.string().max(2_000_000).optional(), state: z.string().optional(), parentId: id.nullable().optional(), sortKey: z.number().optional() }));
    return brain.createElement(params(req, P).id, b);
  });
  app.get('/api/projects/:id/deleted', async (req) => {
    const pid = params(req, P).id; brain.project(pid);
    return { elements: brain.deletedElements(pid), scenes: ms.deletedScenes(pid) };
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
  app.post('/api/backups/snapshot', async () => snapshot(store, svc.opts.backupDir, 'manual', 50));
  app.get('/api/backups', async () => listSnapshots(svc.opts.backupDir));

  app.all('/api/*', async () => { throw new NotFoundError('endpoint'); });
}
