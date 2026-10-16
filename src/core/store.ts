// The store: one SQLite database, every write journaled in batches so any change can be
// inspected and reverted at field level. Nothing is hard-deleted by normal operations.

import Database from 'better-sqlite3';
import { randomBytes } from 'node:crypto';
import { MIGRATIONS } from './schema.js';

export type Row = Record<string, unknown>;
/** A row known to have an id, with any other columns. */
export type IdRow = Row & { id: string };
/** Attach extra typed fields to a row without losing its columns. */
export function withFields<T extends object>(row: Row, extra: T): IdRow & T { return Object.assign({}, row, extra) as IdRow & T; }

export class AppError extends Error {
  constructor(public code: string, message: string, public detail?: unknown) {
    super(message);
  }
}
export class NotFoundError extends AppError {
  constructor(what: string) { super('not_found', `${what} not found`); }
}
export class ValidationError extends AppError {
  constructor(message: string, detail?: unknown) { super('invalid', message, detail); }
}
export class ConflictError extends AppError {
  constructor(message: string, detail?: unknown) { super('conflict', message, detail); }
}

let lastTime = 0;
let counter = 0;
/** Time-sortable unique id: 9 chars of millisecond time + 3 chars counter + 8 random. */
export function newId(): string {
  const t = Date.now();
  if (t === lastTime) counter++; else { lastTime = t; counter = 0; }
  return t.toString(36).padStart(9, '0') + counter.toString(36).padStart(3, '0') + randomBytes(5).toString('hex').slice(0, 8);
}

export function nowIso(): string { return new Date().toISOString(); }

/** Tables that support soft delete and therefore restore. */
const SOFT_DELETE = new Set(['projects', 'elements', 'statements', 'links', 'chapters', 'scenes', 'conversations', 'marks', 'arrangements']);
/** Tables whose rows carry an optimistic-concurrency version. */
const VERSIONED = new Set(['projects', 'elements', 'chapters', 'scenes', 'arrangements']);
/** Tables that have an updated_at column. */
const UPDATED_AT = new Set(['projects', 'elements', 'chapters', 'scenes', 'arrangements']);
/** Fields whose history is kept in scene_revisions instead of the journal. */
/** Prose has its own version (prose_version) so editing a scene's title or status never collides with typing. */
const UNJOURNALED: Record<string, Set<string>> = { scenes: new Set(['doc_json', 'text', 'word_count', 'prose_version']) };

const ALLOWED_TABLES = new Set([
  'projects', 'sources', 'excerpts', 'elements', 'statements', 'links', 'chapters', 'scenes',
  'conversations', 'turns', 'marks', 'proposals', 'writing_sessions', 'arrangements',
]);

function assertTable(table: string) {
  if (!ALLOWED_TABLES.has(table)) throw new AppError('internal', `table not writable: ${table}`);
}
function assertColumn(name: string) {
  if (!/^[a-z_]+$/.test(name)) throw new AppError('internal', `bad column ${name}`);
}

export interface BatchMeta { projectId?: string | null; actor: string; reason?: string }

export class Writer {
  constructor(private store: Store, public readonly batchId: string) {}

  private journal(table: string, id: string, op: string, field: string | null, before: unknown, after: unknown) {
    this.store.db.prepare(
      'INSERT INTO journal(batch_id,table_name,record_id,op,field,before_json,after_json) VALUES (?,?,?,?,?,?,?)',
    ).run(this.batchId, table, id, op, field, before === undefined ? null : JSON.stringify(before), after === undefined ? null : JSON.stringify(after));
  }

  insert<T extends Row>(table: string, row: T): T & { id: string } {
    assertTable(table);
    const ts = nowIso();
    const full: Row = { id: newId(), ...row };
    if (UPDATED_AT.has(table)) { full.created_at ??= ts; full.updated_at ??= ts; }
    else if (!('created_at' in full) && table !== 'turns') full.created_at = ts;
    const cols = Object.keys(full);
    cols.forEach(assertColumn);
    this.store.db.prepare(`INSERT INTO ${table}(${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
      .run(...cols.map((c) => full[c] as never));
    this.journal(table, full.id as string, 'insert', null, null, full);
    return full as T & { id: string };
  }

  /** Update fields. If expectVersion is given and differs from the stored version, refuse with a conflict. */
  update(table: string, id: string, patch: Row, opts: { expectVersion?: number } = {}): Row {
    assertTable(table);
    const current = this.store.get(table, id);
    if (!current || current.deleted_at) throw new NotFoundError(table.replace(/s$/, ''));
    if (VERSIONED.has(table) && opts.expectVersion !== undefined && current.version !== opts.expectVersion) {
      throw new ConflictError('This was changed elsewhere since you opened it.', { current });
    }
    const changes: [string, unknown, unknown][] = [];
    for (const [k, v] of Object.entries(patch)) {
      assertColumn(k);
      if (['id', 'created_at', 'version', 'deleted_at'].includes(k)) continue;
      if (current[k] !== v) changes.push([k, current[k], v]);
    }
    if (changes.length === 0) return current;
    const sets: string[] = changes.map(([k]) => `${k}=?`);
    const vals: unknown[] = changes.map(([, , v]) => v);
    if (UPDATED_AT.has(table)) { sets.push('updated_at=?'); vals.push(nowIso()); }
    if (VERSIONED.has(table)) sets.push('version=version+1');
    this.store.db.prepare(`UPDATE ${table} SET ${sets.join(',')} WHERE id=?`).run(...(vals as never[]), id);
    const skip = UNJOURNALED[table];
    for (const [k, b, a] of changes) if (!skip?.has(k)) this.journal(table, id, 'update', k, b, a);
    return this.store.get(table, id)!;
  }

  /** Record a custom journal entry (used for scene revisions). */
  note(table: string, id: string, field: string, before: unknown, after: unknown) {
    this.journal(table, id, 'update', field, before, after);
  }

  remove(table: string, id: string) {
    assertTable(table);
    if (!SOFT_DELETE.has(table)) throw new AppError('internal', `cannot delete from ${table}`);
    const current = this.store.get(table, id);
    if (!current || current.deleted_at) throw new NotFoundError(table.replace(/s$/, ''));
    const ts = nowIso();
    this.store.db.prepare(`UPDATE ${table} SET deleted_at=? WHERE id=?`).run(ts, id);
    if (VERSIONED.has(table)) this.store.db.prepare(`UPDATE ${table} SET version=version+1 WHERE id=?`).run(id);
    this.journal(table, id, 'delete', 'deleted_at', null, ts);
  }

  restore(table: string, id: string) {
    assertTable(table);
    const current = this.store.get(table, id);
    if (!current) throw new NotFoundError(table.replace(/s$/, ''));
    if (!current.deleted_at) return;
    this.store.db.prepare(`UPDATE ${table} SET deleted_at=NULL WHERE id=?`).run(id);
    if (VERSIONED.has(table)) this.store.db.prepare(`UPDATE ${table} SET version=version+1 WHERE id=?`).run(id);
    this.journal(table, id, 'restore', 'deleted_at', current.deleted_at, null);
  }
}

export class Store {
  readonly db: Database.Database;

  constructor(public readonly path: string) {
    this.db = new Database(path);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = FULL');
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('busy_timeout = 5000');
    this.migrate();
  }

  migrate() {
    this.db.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
    const row = this.db.prepare("SELECT value FROM meta WHERE key='schema_version'").get() as { value: string } | undefined;
    const current = row ? Number(row.value) : 0;
    const latest = MIGRATIONS[MIGRATIONS.length - 1]!.version;
    if (current > latest) {
      throw new AppError('schema_newer', `This data was created by a newer version of the app (schema ${current}). Please update the app.`);
    }
    for (const m of MIGRATIONS) {
      if (m.version <= current) continue;
      // Table rebuilds need foreign keys off for the swap; integrity is checked before commit.
      if (m.rebuild) this.db.pragma('foreign_keys = OFF');
      try {
        this.db.transaction(() => {
          this.db.exec(m.sql);
          if (m.rebuild) {
            const bad = this.db.pragma('foreign_key_check') as unknown[];
            if (bad.length) throw new AppError('migration_failed', `Upgrade ${m.version} found broken references; nothing was changed.`);
          }
          this.db.prepare("INSERT INTO meta(key,value) VALUES('schema_version',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(String(m.version));
        })();
      } finally {
        if (m.rebuild) this.db.pragma('foreign_keys = ON');
      }
    }
  }

  schemaVersion(): number {
    const row = this.db.prepare("SELECT value FROM meta WHERE key='schema_version'").get() as { value: string };
    return Number(row.value);
  }

  get(table: string, id: string): Row | undefined {
    assertTable(table);
    return this.db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id) as Row | undefined;
  }

  /** Run fn in one transaction as one journaled batch. */
  batch<T>(meta: BatchMeta, fn: (w: Writer) => T): T {
    return this.db.transaction(() => {
      const id = newId();
      this.db.prepare('INSERT INTO batches(id,project_id,actor,reason,created_at) VALUES (?,?,?,?,?)')
        .run(id, meta.projectId ?? null, meta.actor, meta.reason ?? '', nowIso());
      return fn(new Writer(this, id));
    })();
  }

  history(projectId: string, limit = 200) {
    const batches = this.db.prepare('SELECT * FROM batches WHERE project_id=? ORDER BY created_at DESC, id DESC LIMIT ?').all(projectId, limit) as Row[];
    const entries = this.db.prepare('SELECT * FROM journal WHERE batch_id=? ORDER BY seq');
    return batches.map((b) => withFields(b, { entries: (entries.all(b.id) as Row[]).map(parseJournal) }));
  }

  recordHistory(table: string, id: string) {
    assertTable(table);
    const rows = this.db.prepare(
      'SELECT j.*, b.actor, b.reason, b.created_at FROM journal j JOIN batches b ON b.id=j.batch_id WHERE j.table_name=? AND j.record_id=? ORDER BY j.seq DESC',
    ).all(table, id) as Row[];
    return rows.map(parseJournal);
  }

  /**
   * Revert one batch at field level. If a later batch changed the same field, refuse unless force.
   * The revert itself is a new, journaled batch.
   */
  revert(batchId: string, actor: string, opts: { force?: boolean } = {}) {
    const batch = this.db.prepare('SELECT * FROM batches WHERE id=?').get(batchId) as Row | undefined;
    if (!batch) throw new NotFoundError('change');
    if (batch.reverted_by) throw new ConflictError('This change was already undone.');
    const entries = (this.db.prepare('SELECT * FROM journal WHERE batch_id=? ORDER BY seq DESC').all(batchId) as Row[]).map(parseJournal);
    const later = this.db.prepare(
      'SELECT j.field FROM journal j JOIN batches b ON b.id=j.batch_id WHERE j.table_name=? AND j.record_id=? AND j.field IS ? AND j.op=\'update\' AND j.seq > ? AND b.reverted_by IS NULL AND j.batch_id <> ?',
    );
    const laterAny = this.db.prepare(
      'SELECT j.field FROM journal j JOIN batches b ON b.id=j.batch_id WHERE j.table_name=? AND j.record_id=? AND j.seq > ? AND b.reverted_by IS NULL AND j.batch_id <> ?',
    );
    const conflicts: { table: string; id: string; field: string | null }[] = [];
    for (const e of entries) {
      // A later delete-then-restore does not block undoing a field edit; editing a record that is
      // deleted right now does (restore it first).
      const nowDeleted = e.op === 'update' && !!(this.db.prepare(`SELECT deleted_at FROM ${e.table_name as string} WHERE id=?`).get(e.record_id) as Row | undefined)?.deleted_at;
      const hit = e.op === 'insert'
        ? laterAny.get(e.table_name, e.record_id, e.seq, batchId)
        : nowDeleted || later.get(e.table_name, e.record_id, e.field, e.seq, batchId);
      if (hit) conflicts.push({ table: e.table_name as string, id: e.record_id as string, field: e.field as string | null });
    }
    if (conflicts.length && !opts.force) {
      throw new ConflictError('Newer changes touched the same fields. Undoing this would overwrite them.', { conflicts });
    }
    return this.batch({ projectId: batch.project_id as string | null, actor, reason: `Undo: ${batch.reason}` }, (w) => {
      for (const e of entries) {
        const table = e.table_name as string, id = e.record_id as string;
        if (e.op === 'insert') {
          if (SOFT_DELETE.has(table)) { const cur = this.get(table, id); if (cur && !cur.deleted_at) w.remove(table, id); }
        } else if (e.op === 'delete') {
          w.restore(table, id);
        } else if (e.op === 'restore') {
          const cur = this.get(table, id); if (cur && !cur.deleted_at) w.remove(table, id);
        } else if (e.op === 'update') {
          if (table === 'scenes' && e.field === 'revision') {
            restoreSceneRevision(this, w, id, e.before as string | null);
          } else {
            w.update(table, id, { [e.field as string]: e.before });
          }
        }
      }
      this.db.prepare('UPDATE batches SET reverted_by=? WHERE id=?').run(w.batchId, batchId);
      return { undoBatchId: w.batchId };
    });
  }

  close() { this.db.close(); }
}

function parseJournal(r: Row) {
  return withFields(r, {
    before: r.before_json == null ? null : JSON.parse(r.before_json as string) as unknown,
    after: r.after_json == null ? null : JSON.parse(r.after_json as string) as unknown,
  });
}

/** Restore a scene's prose to a given revision (or empty if null), recording a new revision. */
export function restoreSceneRevision(store: Store, w: Writer, sceneId: string, revisionId: string | null) {
  const scene = store.get('scenes', sceneId);
  if (!scene) throw new NotFoundError('scene');
  let doc = '{"type":"doc","content":[]}', text = '', words = 0;
  if (revisionId) {
    const rev = store.db.prepare('SELECT * FROM scene_revisions WHERE id=?').get(revisionId) as Row | undefined;
    if (!rev) throw new NotFoundError('revision');
    doc = rev.doc_json as string; text = rev.text as string; words = rev.word_count as number;
  }
  const prevRev = latestRevisionId(store, sceneId);
  w.update('scenes', sceneId, { doc_json: doc, text, word_count: words, prose_version: (scene.prose_version as number) + 1 });
  const updated = store.get('scenes', sceneId)!;
  const revId = newId();
  store.db.prepare('INSERT INTO scene_revisions(id,scene_id,version,doc_json,text,word_count,reason,created_at) VALUES (?,?,?,?,?,?,?,?)')
    .run(revId, sceneId, updated.prose_version, doc, text, words, 'restore', nowIso());
  w.note('scenes', sceneId, 'revision', prevRev, revId);
}

export function latestRevisionId(store: Store, sceneId: string): string | null {
  const r = store.db.prepare('SELECT id FROM scene_revisions WHERE scene_id=? ORDER BY created_at DESC, id DESC LIMIT 1').get(sceneId) as { id: string } | undefined;
  return r?.id ?? null;
}
