// Backups and portable archives.
// - Snapshot: a consistent copy of the whole database file, verified, with rotation.
// - Archive: one novel as documented JSON, including history, with checksums. Import never
//   overwrites: it restores with the original IDs when the novel is absent, or as a copy
//   with new IDs, and always reports exactly what it will do first.

import { BRAND } from '../brand.js';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';
import { Store, Row, AppError, ValidationError, newId, nowIso } from './store.js';
import { MIGRATIONS } from './schema.js';

export const ARCHIVE_FORMAT = 'novel-studio-archive';
export const ARCHIVE_VERSION = 1;

/** Tables in dependency order, with the column that ties each row to a project. */
export const ARCHIVE_TABLES: { table: string; scope: string }[] = [
  { table: 'projects', scope: 'id = :p' },
  { table: 'sources', scope: 'project_id = :p' },
  { table: 'kinds', scope: 'project_id = :p' },
  { table: 'field_defs', scope: 'project_id = :p' },
  { table: 'excerpts', scope: 'source_id IN (SELECT id FROM sources WHERE project_id = :p)' },
  { table: 'elements', scope: 'project_id = :p' },
  { table: 'conversations', scope: 'project_id = :p' },
  { table: 'turns', scope: 'conversation_id IN (SELECT id FROM conversations WHERE project_id = :p)' },
  { table: 'statements', scope: 'project_id = :p' },
  { table: 'links', scope: 'project_id = :p' },
  { table: 'chapters', scope: 'project_id = :p' },
  { table: 'scenes', scope: 'project_id = :p' },
  { table: 'scene_revisions', scope: 'scene_id IN (SELECT id FROM scenes WHERE project_id = :p)' },
  { table: 'autosave_journal', scope: 'scene_id IN (SELECT id FROM scenes WHERE project_id = :p)' },
  { table: 'marks', scope: 'conversation_id IN (SELECT id FROM conversations WHERE project_id = :p)' },
  { table: 'proposals', scope: 'project_id = :p' },
  { table: 'batches', scope: 'project_id = :p' },
  { table: 'journal', scope: 'batch_id IN (SELECT id FROM batches WHERE project_id = :p)' },
  { table: 'writing_state', scope: 'project_id = :p' },
  { table: 'trail', scope: 'project_id = :p' },
  { table: 'writing_sessions', scope: 'project_id = :p' },
  { table: 'arrangements', scope: 'project_id = :p' },
  { table: 'finding_notes', scope: 'project_id = :p' },
  { table: 'imports', scope: 'project_id = :p' },
  { table: 'drafts', scope: 'project_id = :p' },
  { table: 'draft_scenes', scope: 'draft_id IN (SELECT id FROM drafts WHERE project_id = :p)' },
];

/** Columns holding ids of other rows, remapped when importing as a copy. */
const REF_COLUMNS = new Set([
  'id', 'project_id', 'source_id', 'excerpt_id', 'element_id', 'parent_id', 'from_id', 'to_id', 'chapter_id',
  'scene_id', 'pov_element_id', 'plan_element_id', 'conversation_id', 'turn_id', 'statement_id', 'supersedes_id',
  'superseded_by_id', 'focus_element_id', 'batch_id', 'record_id', 'reverted_by', 'result_batch_id', 'draft_id',
]);

function canonical(rows: Row[]): string {
  return JSON.stringify(rows.map((r) => Object.keys(r).sort().reduce((o, k) => { o[k] = r[k]; return o; }, {} as Row)));
}
function sha(s: string) { return createHash('sha256').update(s).digest('hex'); }

export interface Archive {
  format: string;
  format_version: number;
  schema_version: number;
  exported_at: string;
  project_id: string;
  title: string;
  tables: Record<string, Row[]>;
  checksums: Record<string, string>;
  counts: Record<string, number>;
}

export function exportArchive(store: Store, projectId: string): Archive {
  const p = store.get('projects', projectId);
  if (!p) throw new AppError('not_found', 'novel not found');
  const tables: Record<string, Row[]> = {};
  for (const { table, scope } of ARCHIVE_TABLES) {
    const order = table === 'journal' ? 'seq' : 'rowid';
    tables[table] = store.db.prepare(`SELECT * FROM ${table} WHERE ${scope.replace(/:p/g, '@p')} ORDER BY ${order}`).all({ p: projectId }) as Row[];
  }
  const checksums: Record<string, string> = {}, counts: Record<string, number> = {};
  for (const [t, rows] of Object.entries(tables)) { checksums[t] = sha(canonical(rows)); counts[t] = rows.length; }
  return {
    format: ARCHIVE_FORMAT, format_version: ARCHIVE_VERSION, schema_version: store.schemaVersion(),
    exported_at: nowIso(), project_id: projectId, title: p.title as string, tables, checksums, counts,
  };
}

export interface ImportPlan {
  ok: boolean;
  mode: 'restore' | 'copy' | 'already_present';
  title: string;
  counts: Record<string, number>;
  problems: string[];
  warnings: string[];
}

function validateArchive(store: Store, a: unknown): { archive: Archive; problems: string[] } {
  const problems: string[] = [];
  if (!a || typeof a !== 'object') throw new ValidationError('This file is not a Novel Studio archive.');
  const archive = a as Archive;
  if (archive.format !== ARCHIVE_FORMAT) throw new ValidationError('This file is not a Novel Studio archive.');
  if (typeof archive.format_version !== 'number' || archive.format_version > ARCHIVE_VERSION) {
    throw new ValidationError('This archive was made by a newer version of the app. Update the app to open it.');
  }
  const latestSchema = MIGRATIONS[MIGRATIONS.length - 1]!.version;
  if (archive.schema_version > latestSchema) throw new ValidationError('This archive was made by a newer version of the app. Update the app to open it.');
  if (!archive.tables || typeof archive.tables !== 'object') throw new ValidationError('The archive is missing its contents.');
  for (const { table } of ARCHIVE_TABLES) {
    const rows = archive.tables[table];
    if (!Array.isArray(rows)) { problems.push(`Missing section: ${table}`); continue; }
    if (archive.checksums?.[table] !== sha(canonical(rows))) problems.push(`The ${table} section does not match its checksum. The file may be damaged or edited.`);
    const known = new Set((store.db.prepare(`PRAGMA table_info(${table})`).all() as Row[]).map((c) => c.name as string));
    for (const r of rows) for (const k of Object.keys(r)) if (!known.has(k)) { problems.push(`Unknown column ${table}.${k}`); break; }
  }
  for (const t of Object.keys(archive.tables)) if (!ARCHIVE_TABLES.some((x) => x.table === t)) problems.push(`Unknown section skipped: ${t}`);
  const proj = archive.tables.projects?.[0];
  if (!proj || proj.id !== archive.project_id) problems.push('The archive does not contain its novel record.');
  return { archive, problems };
}

/** Describe exactly what an import would do, without writing anything. */
export function planImport(store: Store, raw: unknown, opts: { asCopy?: boolean } = {}): ImportPlan {
  const { archive, problems } = validateArchive(store, raw);
  const counts: Record<string, number> = {};
  for (const { table } of ARCHIVE_TABLES) counts[table] = archive.tables[table]?.length ?? 0;
  const existing = store.get('projects', archive.project_id);
  const warnings: string[] = [];
  let mode: ImportPlan['mode'] = 'restore';
  if (existing) {
    const same = sha(canonical([existing])) === sha(canonical(archive.tables.projects ?? []));
    if (opts.asCopy) mode = 'copy';
    else if (same) { mode = 'already_present'; warnings.push('This exact novel is already in your library. Nothing will be imported unless you import it as a copy.'); }
    else { mode = 'copy'; warnings.push('A version of this novel already exists. It will be imported as a separate copy; your current novel is not changed.'); }
  }
  return { ok: problems.length === 0, mode, title: archive.title, counts, problems, warnings };
}

export function importArchive(store: Store, raw: unknown, opts: { asCopy?: boolean; copyTitle?: string } = {}) {
  const plan = planImport(store, raw, opts);
  if (!plan.ok) throw new ValidationError('The archive cannot be imported safely.', { problems: plan.problems });
  if (plan.mode === 'already_present') return { plan, projectId: (raw as Archive).project_id, imported: false };
  const archive = raw as Archive;
  const map = new Map<string, string>();
  const remap = (v: unknown) => {
    if (plan.mode !== 'copy' || typeof v !== 'string') return v;
    if (!map.has(v)) map.set(v, newId());
    return map.get(v);
  };
  store.db.transaction(() => {
    store.db.pragma('defer_foreign_keys = ON');
    for (const { table } of ARCHIVE_TABLES) {
      for (const row of archive.tables[table] ?? []) {
        const r: Row = { ...row };
        if (plan.mode === 'copy') {
          for (const k of Object.keys(r)) if (REF_COLUMNS.has(k) && r[k] != null && !(table === 'journal' && k === 'id')) r[k] = remap(r[k]);
          if (table === 'projects') r.title = opts.copyTitle ?? `${r.title} (copy)`;
          if (table === 'arrangements' && typeof r.order_json === 'string') {
            r.order_json = JSON.stringify(JSON.parse(r.order_json), (_k, v) => (typeof v === 'string' && map.has(v) ? map.get(v) : v));
          }
        }
        // Journal numbers only order the changes; numbering them afresh keeps that order and never collides
        // with numbers another novel in this library already uses.
        if (table === 'journal') delete r.seq;
        const cols = Object.keys(r);
        store.db.prepare(`INSERT INTO ${table}(${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...cols.map((c) => r[c] as never));
      }
    }
  })();
  const projectId = plan.mode === 'copy' ? map.get(archive.project_id)! : archive.project_id;
  // Verify by re-exporting and comparing counts.
  const check = exportArchive(store, projectId);
  for (const { table } of ARCHIVE_TABLES) {
    if (check.counts[table] !== plan.counts[table]) throw new AppError('verify_failed', `Import verification failed for ${table}.`);
  }
  return { plan, projectId, imported: true };
}

/** Replace one novel with an archive of it, keeping its ids: the hand-off between her computers.
 *  Everything happens in one transaction, so a failure leaves the novel exactly as it was. */
export function replaceProject(store: Store, raw: unknown) {
  const archive = raw as Archive;
  const { problems } = validateArchive(store, raw);
  if (problems.length) throw new ValidationError('The shared copy cannot be used safely.', { problems });
  let result: ReturnType<typeof importArchive> | null = null;
  store.db.transaction(() => {
    store.db.pragma('defer_foreign_keys = ON');
    for (const { table, scope } of [...ARCHIVE_TABLES].reverse()) {
      store.db.prepare(`DELETE FROM ${table} WHERE ${scope.replace(/:p/g, '@p')}`).run({ p: archive.project_id });
    }
    result = importArchive(store, raw);
  })();
  return result!;
}

// ---------- whole-database snapshots ----------

export async function snapshot(store: Store, dir: string, label = 'auto', keep = 20) {
  mkdirSync(dir, { recursive: true });
  const stamp = nowIso().replace(/[:.]/g, '-');
  const file = join(dir, `${BRAND.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${stamp}-${newId().slice(-6)}-${label}.sqlite3`);
  await store.db.backup(file);
  // A backup is one self-contained file: switch the copy out of write-ahead mode before checking it,
  // so no -wal or -shm companion files are left beside it.
  const check = new Database(file);
  check.pragma('journal_mode = DELETE');
  const ok = (check.pragma('integrity_check', { simple: true }) as string) === 'ok';
  check.close();
  if (!ok) { unlinkSync(file); throw new AppError('backup_failed', 'The backup did not pass its integrity check.'); }
  rotate(dir, label, keep);
  return { file, bytes: statSync(file).size };
}

function rotate(dir: string, label: string, keep: number) {
  const names = readdirSync(dir);
  const files = names.filter((f) => f.endsWith(`-${label}.sqlite3`)).sort();
  while (files.length > keep) { const f = files.shift()!; for (const x of [f, `${f}-wal`, `${f}-shm`]) { try { unlinkSync(join(dir, x)); } catch { /* keep going */ } } }
  // Earlier versions left empty -wal and -shm companions beside each backup. They hold nothing; tidy them away.
  for (const n of names) {
    const m = /^(.+-(?:auto|manual)\.sqlite3)-(wal|shm)$/.exec(n);
    if (!m) continue;
    const wal = join(dir, `${m[1]}-wal`);
    try { if (!existsSync(wal) || statSync(wal).size === 0) unlinkSync(join(dir, n)); } catch { /* keep going */ }
  }
}

export function listSnapshots(dir: string) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.sqlite3')).sort().reverse().map((f) => ({ file: join(dir, f), name: f, bytes: statSync(join(dir, f)).size, modified: statSync(join(dir, f)).mtime.toISOString() }));
}
