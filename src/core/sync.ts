// Sharing novels between her computers through a folder both can see (her OneDrive).
//
// Step one of two: whole-novel hand-off. Each computer keeps its own library and, when a novel has
// changed, adds a compressed, checksummed copy of that novel to the shared folder. It never writes
// into a file another computer made, so the folder service can never corrupt anything.
//
// Decisions never depend on clocks. Every copy carries its lineage: the copies it was built on.
// Another computer's copy is taken in only when it builds on what this computer already has and
// this computer has nothing new of its own. In every other case (both changed, or the histories
// went separate ways) the other version comes in beside hers as its own novel, named for where it
// came from, and nothing is overwritten.

import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { Store, Row, ValidationError, nowIso } from './store.js';
import { Archive, ARCHIVE_TABLES, exportArchive, importArchive, replaceProject } from './backup.js';

export interface SyncConfig { dir: string; device: { id: string; name: string; host?: string } }
interface NovelState {
  based: string | null;      // the copy this computer's novel was last shared as, or taken from
  lineage: string[];         // every copy this computer's novel already contains (based first)
  basedHash: string | null;  // the novel's content fingerprint at that moment
  seen: string[];            // other computers' copies already dealt with (taken, or kept beside)
  sharedAt: string | null; tookAt: string | null;
}
export interface SharedCopy { file: string; projectId: string; deviceId: string; deviceName: string; title: string; sharedAt: string; basedOn: string | null; lineage: string[]; contentHash: string; sha: string; bytes: number }
interface Presence { name: string; lastSeen: string; open: string | null; unshared: string[] }
export type TakeResult = { result: 'nothing' | 'took' | 'kept_both' | 'retry'; from?: string; copyId?: string; copyTitle?: string };

const ROOT = 'Story Canon shared';
const KEEP = 10;            // copies kept per computer per novel
const LINEAGE = 200;        // how far back each copy remembers its ancestry
// Where she is looking, not what she wrote. Excluded from "has this novel changed?".
const NOISE = new Set(['writing_state', 'trail']);
const ID = /^[A-Za-z0-9_-]{6,64}$/;

const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');
const empty = (): NovelState => ({ based: null, lineage: [], basedHash: null, seen: [], sharedAt: null, tookAt: null });

/** A fingerprint of what she made in a novel, the same on every computer for the same content
 *  (journal numbering, which differs between libraries, is left out). */
export function contentHash(a: Archive): string {
  const parts: string[] = [];
  for (const { table } of ARCHIVE_TABLES) {
    if (NOISE.has(table)) continue;
    // A writing session counts once something was written in it or a note was left.
    const kept = table === 'writing_sessions' ? (a.tables[table] ?? []).filter((r) => r.scenes_json !== '[]' || String(r.note ?? '').trim()) : (a.tables[table] ?? []);
    const rows = kept.map((r) => {
      const o = { ...r } as Row;
      if (table === 'journal') delete o.seq;
      return Object.keys(o).sort().reduce((x, k) => { x[k] = o[k]; return x; }, {} as Row);
    });
    parts.push(`${table}:${sha(JSON.stringify(rows))}`);
  }
  return sha(parts.join('|'));
}

export class Sync {
  /** Every operation that reads or changes novels runs one at a time. */
  private queue: Promise<unknown> = Promise.resolve();
  private exclusive<T>(f: () => Promise<T> | T): Promise<T> {
    const run = this.queue.then(f, f);
    this.queue = run.catch(() => {});
    return run;
  }

  constructor(private store: Store, private backup: () => Promise<unknown>) {}

  // ---------- settings ----------
  private get<T>(key: string): T | null {
    const r = this.store.db.prepare('SELECT value_json FROM settings WHERE key=?').get(key) as { value_json: string } | undefined;
    return r ? (JSON.parse(r.value_json) as T) : null;
  }
  private put(key: string, v: unknown) {
    this.store.db.prepare('INSERT INTO settings(key,value_json) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json').run(key, JSON.stringify(v));
  }
  /** Sharing as configured, or null when off. A library copied to another computer gets its own identity. */
  config(): SyncConfig | null {
    const c = this.get<SyncConfig>('sync');
    if (!c?.dir) return null;
    if (c.device.host && c.device.host !== hostname()) { c.device = { ...c.device, id: randomUUID(), host: hostname() }; this.put('sync', c); }
    return c;
  }
  private states(): Record<string, NovelState> { return this.get<Record<string, NovelState>>('sync_state') ?? {}; }
  private state(pid: string): NovelState { return { ...empty(), ...(this.states()[pid] ?? {}) }; }
  private setState(pid: string, patch: Partial<NovelState>) {
    const all = this.states(); const next = { ...this.state(pid), ...patch };
    next.seen = next.seen.slice(-500); next.lineage = [...new Set(next.lineage)].slice(0, LINEAGE);
    all[pid] = next; this.put('sync_state', all);
  }

  /** Turn sharing on with a folder, and name this computer. Its identity stays the same if turned off and on. */
  configure(input: { dir: string; name?: string }) {
    const dir = input.dir.trim();
    if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) throw new ValidationError('That folder could not be found on this computer.');
    const prev = this.get<SyncConfig>('sync');
    const name = (input.name ?? prev?.device.name ?? hostname()).trim().slice(0, 60) || 'This computer';
    const cfg: SyncConfig = { dir, device: { id: prev?.device.id ?? randomUUID(), name, host: hostname() } };
    mkdirSync(join(dir, ROOT, 'computers'), { recursive: true });
    this.put('sync', cfg);
    return cfg;
  }
  turnOff() { const c = this.get<SyncConfig>('sync'); if (c) this.put('sync', { ...c, dir: '' }); }

  private root() { const c = this.config(); return c ? join(c.dir, ROOT) : null; }
  private novelDir(pid: string) { return join(this.root()!, pid); }
  /** Novel folders in the shared folder; anything else there (desktop.ini, stray files) is ignored. */
  private remoteIds(): string[] {
    const root = this.root(); if (!root || !existsSync(root)) return [];
    return readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'computers' && ID.test(d.name)).map((d) => d.name);
  }

  // ---------- what has changed ----------
  fingerprint(pid: string): string { return contentHash(exportArchive(this.store, pid)); }
  changedSinceShared(pid: string) { return this.fingerprint(pid) !== this.state(pid).basedHash; }

  // ---------- the shared folder ----------
  copies(pid: string): SharedCopy[] {
    const dir = this.novelDir(pid);
    if (!existsSync(dir)) return [];
    const out: SharedCopy[] = [];
    let names: string[] = [];
    try { names = readdirSync(dir); } catch { return []; }
    for (const f of names) {
      if (!f.endsWith('.meta.json')) continue;
      try {
        const m = JSON.parse(readFileSync(join(dir, f), 'utf8')) as SharedCopy;
        if (m.projectId === pid && Array.isArray(m.lineage) && existsSync(join(dir, m.file))) out.push(m);
      } catch { /* a copy still arriving: try again next time */ }
    }
    return out.sort((a, b) => a.sharedAt.localeCompare(b.sharedAt) || a.file.localeCompare(b.file));
  }
  private read(c: SharedCopy): Archive {
    const buf = readFileSync(join(this.novelDir(c.projectId), c.file));
    if (sha(buf) !== c.sha) throw new ValidationError('A shared copy is incomplete. It may still be arriving; Story Canon will try again.');
    return JSON.parse(gunzipSync(buf).toString('utf8')) as Archive;
  }

  private shareNow(pid: string, force = false): { shared: boolean; copy?: SharedCopy } {
    const cfg = this.config(); if (!cfg) return { shared: false };
    const archive = exportArchive(this.store, pid);
    const fp = contentHash(archive);
    const st = this.state(pid);
    if (!force && fp === st.basedHash) return { shared: false };
    const gz = gzipSync(Buffer.from(JSON.stringify(archive), 'utf8'));
    const sharedAt = nowIso();
    const base = `${sharedAt.replace(/[:.]/g, '-')}--${cfg.device.id}`;
    const dir = this.novelDir(pid); mkdirSync(dir, { recursive: true });
    const lineage = [...new Set(st.based ? [st.based, ...st.lineage] : st.lineage)].slice(0, LINEAGE);
    const meta: SharedCopy = { file: `${base}.novel.gz`, projectId: pid, deviceId: cfg.device.id, deviceName: cfg.device.name, title: archive.title, sharedAt, basedOn: st.based, lineage, contentHash: fp, sha: sha(gz), bytes: gz.length };
    // Written under a temporary name first, so another computer never sees half a file.
    writeFileSync(join(dir, `${meta.file}.part`), gz); renameSync(join(dir, `${meta.file}.part`), join(dir, meta.file));
    writeFileSync(join(dir, `${base}.meta.part`), JSON.stringify(meta)); renameSync(join(dir, `${base}.meta.part`), join(dir, `${base}.meta.json`));
    this.setState(pid, { based: meta.file, lineage, basedHash: fp, sharedAt });
    this.prune(pid, cfg.device.id);
    return { shared: true, copy: meta };
  }
  private prune(pid: string, deviceId: string) {
    const dir = this.novelDir(pid);
    const mine = this.copies(pid).filter((c) => c.deviceId === deviceId);
    for (const c of mine.slice(0, Math.max(0, mine.length - KEEP))) {
      for (const f of [c.file, c.file.replace(/\.novel\.gz$/, '.meta.json')]) { try { unlinkSync(join(dir, f)); } catch { /* already gone */ } }
    }
    // Leftovers from a share interrupted by a file lock: tidied after a day.
    try { for (const f of readdirSync(dir)) if (f.endsWith('.part') && Date.now() - statSync(join(dir, f)).mtimeMs > 86_400_000) unlinkSync(join(dir, f)); } catch { /* keep going */ }
  }

  /** Other computers' copies this computer has not dealt with: the newest of each separate line. */
  private heads(pid: string): SharedCopy[] {
    const cfg = this.config(); if (!cfg) return [];
    const st = this.state(pid);
    const all = this.copies(pid);
    const ancestors = new Set(all.flatMap((c) => c.lineage));
    const have = new Set([...(st.based ? [st.based] : []), ...st.lineage, ...st.seen]);
    return all.filter((c) => c.deviceId !== cfg.device.id && !ancestors.has(c.file) && !have.has(c.file));
  }
  /** The copy waiting for her, if any (what the notice above the page offers). */
  incoming(pid: string): SharedCopy | null { const h = this.heads(pid); return h[h.length - 1] ?? null; }

  /** Take in what other computers shared. A copy that builds on what this computer has, with nothing
   *  new here, replaces the novel (a backup comes first). Anything else comes in beside it. */
  private async takeNow(pid: string, opts: { backedUp?: boolean } = {}): Promise<TakeResult> {
    const heads = this.heads(pid);
    if (!heads.length) return { result: 'nothing' };
    const exists = !!this.store.get('projects', pid);
    const before = exists ? this.fingerprint(pid) : null;
    if (!opts.backedUp) await this.backup();
    // Nothing may change between the decision and the change: if she typed during the backup, wait for next time.
    if (exists && this.fingerprint(pid) !== before) return { result: 'retry' };
    let last: TakeResult = { result: 'nothing' };
    for (const h of heads) {
      const st = this.state(pid);
      const here = !!this.store.get('projects', pid);
      const now = here ? this.fingerprint(pid) : null;
      const archive = this.read(h);
      const builds = !st.based || h.lineage.includes(st.based);
      const mineUnchanged = !here || now === st.basedHash;
      if (!here || (builds && mineUnchanged) || (st.based === null && now === h.contentHash)) {
        // Take it: replace the novel and record what this computer now holds, in one transaction.
        this.store.db.transaction(() => {
          if (here) replaceProject(this.store, archive); else importArchive(this.store, archive);
          // Typing the other computer never saved is not offered for recovery here.
          this.store.db.prepare('DELETE FROM autosave_journal WHERE scene_id IN (SELECT id FROM scenes WHERE project_id=?)').run(pid);
          this.setState(pid, { based: h.file, lineage: [h.file, ...h.lineage], basedHash: this.fingerprint(pid), seen: [...st.seen, h.file], tookAt: nowIso() });
        })();
        last = { result: 'took', from: h.deviceName };
        continue;
      }
      // Keep both: the other version becomes its own novel; hers stays and is shared next, now including it.
      const when = new Date(h.sharedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
      const copyTitle = `${h.title} (from ${h.deviceName}, ${when})`;
      let copyId = '';
      this.store.db.transaction(() => {
        copyId = importArchive(this.store, archive, { asCopy: true, copyTitle }).projectId;
        this.store.db.prepare('UPDATE projects SET deleted_at=NULL WHERE id=?').run(copyId); // always where she can see it
        this.setState(pid, { based: h.file, lineage: [h.file, ...h.lineage, ...st.lineage], basedHash: null, seen: [...st.seen, h.file] });
      })();
      last = { result: 'kept_both', from: h.deviceName, copyId, copyTitle };
    }
    return last;
  }

  // ---------- the public operations, one at a time ----------
  share(pid: string, force = false) { return this.exclusive(() => this.shareNow(pid, force)); }
  takeIncoming(pid: string) { return this.exclusive(() => this.takeNow(pid)); }
  bring(pid: string) {
    return this.exclusive(async () => {
      if (this.store.get('projects', pid)) throw new ValidationError('That novel is already on this computer.');
      return this.takeNow(pid);
    });
  }

  /** One pass: take in what is newer for novels she has not opened in this session, then share what changed. */
  pass(opts: { protect?: Set<string> | string | null; shareChanged: boolean; take?: boolean }) {
    return this.exclusive(async () => {
      const out = { shared: [] as string[], took: [] as string[], keptBoth: [] as string[] };
      if (!this.config()) return out;
      const protect = opts.protect instanceof Set ? opts.protect : new Set(opts.protect ? [opts.protect] : []);
      const local = (this.store.db.prepare('SELECT id FROM projects').all() as { id: string }[]).map((r) => r.id);
      let backedUp = false;
      for (const pid of local) {
        try {
          if (opts.take !== false && !protect.has(pid) && this.heads(pid).length) {
            if (!backedUp) { await this.backup(); backedUp = true; }
            const r = await this.takeNow(pid, { backedUp: true });
            if (r.result === 'took') out.took.push(pid); else if (r.result === 'kept_both') out.keptBoth.push(pid);
          }
          if (opts.shareChanged && this.shareNow(pid).shared) out.shared.push(pid);
        } catch { /* one novel's trouble never stops the others; it is tried again next pass */ }
      }
      try { this.presenceNow(protect.size ? [...protect][protect.size - 1]! : null); } catch { /* the folder may be offline */ }
      return out;
    });
  }

  // ---------- which computer is where ----------
  private presenceNow(open: string | null) {
    const cfg = this.config(); const root = this.root(); if (!cfg || !root) return;
    mkdirSync(join(root, 'computers'), { recursive: true });
    const ids = (this.store.db.prepare('SELECT id FROM projects').all() as { id: string }[]).map((r) => r.id);
    const p: Presence = { name: cfg.device.name, lastSeen: nowIso(), open, unshared: ids.filter((id) => this.changedSinceShared(id)) };
    const f = join(root, 'computers', `${cfg.device.id}.json`);
    writeFileSync(`${f}.part`, JSON.stringify(p)); renameSync(`${f}.part`, f);
  }
  presence(open: string | null) { return this.exclusive(() => this.presenceNow(open)); }
  others(): (Presence & { id: string })[] {
    const cfg = this.config(); const root = this.root(); if (!cfg || !root) return [];
    const dir = join(root, 'computers'); if (!existsSync(dir)) return [];
    return readdirSync(dir).filter((f) => f.endsWith('.json') && f !== `${cfg.device.id}.json`).flatMap((f) => {
      try { return [{ ...(JSON.parse(readFileSync(join(dir, f), 'utf8')) as Presence), id: f.slice(0, -5) }]; } catch { return []; }
    });
  }

  /** Novels shared from another computer that are not in this library yet. */
  elsewhere(): { projectId: string; title: string; deviceName: string; sharedAt: string }[] {
    const out: ReturnType<Sync['elsewhere']> = [];
    for (const d of this.remoteIds()) {
      try {
        if (this.store.get('projects', d)) continue;
        const all = this.copies(d); const newest = all[all.length - 1];
        if (!newest) continue;
        if ((this.read(newest).tables.projects?.[0] as Row | undefined)?.deleted_at) continue;
        out.push({ projectId: d, title: newest.title, deviceName: newest.deviceName, sharedAt: newest.sharedAt });
      } catch { /* skip anything unreadable */ }
    }
    return out.sort((a, b) => b.sharedAt.localeCompare(a.sharedAt));
  }

  /** Everything the window needs to know about one novel. */
  status(pid: string | null) {
    const cfg = this.config();
    if (!cfg) return { on: false as const };
    const st = pid ? this.state(pid) : null;
    const inc = pid ? this.incoming(pid) : null;
    const RECENT = 15 * 60_000;
    const others = this.others();
    const busyElsewhere = pid ? others.filter((o) => o.unshared.includes(pid) && Date.now() - Date.parse(o.lastSeen) < RECENT).map((o) => ({ name: o.name, lastSeen: o.lastSeen })) : [];
    return {
      on: true as const, folder: cfg.dir, device: cfg.device.name,
      sharedAt: st?.sharedAt ?? null, tookAt: st?.tookAt ?? null,
      unshared: pid && this.store.get('projects', pid) ? this.changedSinceShared(pid) : false,
      incoming: inc ? { deviceName: inc.deviceName, sharedAt: inc.sharedAt } : null,
      busyElsewhere,
      others: others.map((o) => ({ name: o.name, lastSeen: o.lastSeen })),
    };
  }
}
