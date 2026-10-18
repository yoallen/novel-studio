// Sharing novels between her computers through a folder both can see (her OneDrive).
//
// Step one of two: whole-novel hand-off. Each computer keeps its own library and, when a novel has
// changed, adds a compressed, checksummed copy of that novel to the shared folder. It never writes
// into a file another computer made, so the folder service can never corrupt anything. When another
// computer's copy is newer, this computer takes it in, after a verified backup. If both computers
// changed the same novel before sharing, nothing is overwritten: the other version comes in beside
// hers as its own novel, named for where it came from.

import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { hostname } from 'node:os';
import { join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { Store, Row, ValidationError, nowIso } from './store.js';
import { Archive, exportArchive, importArchive, replaceProject } from './backup.js';

export interface SyncConfig { dir: string; device: { id: string; name: string } }
interface NovelState { based: string | null; basedHash: string | null; sharedAt: string | null; tookAt: string | null; conflictAt?: string | null }
export interface SharedCopy { file: string; projectId: string; deviceId: string; deviceName: string; title: string; sharedAt: string; basedOn: string | null; sha: string; bytes: number }
interface Presence { name: string; lastSeen: string; open: string | null; unshared: string[] }

const ROOT = 'Story Canon shared';
const KEEP = 5;                 // copies kept per computer per novel
const NOISE = new Set(['writing_state', 'trail', 'writing_sessions']); // where she is looking and when she sat down, not what she wrote

const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');

export class Sync {
  constructor(private store: Store, private backup: () => Promise<unknown>) {}

  // ---------- settings ----------
  private get<T>(key: string): T | null {
    const r = this.store.db.prepare('SELECT value_json FROM settings WHERE key=?').get(key) as { value_json: string } | undefined;
    return r ? (JSON.parse(r.value_json) as T) : null;
  }
  private put(key: string, v: unknown) {
    this.store.db.prepare('INSERT INTO settings(key,value_json) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value_json=excluded.value_json').run(key, JSON.stringify(v));
  }
  config(): SyncConfig | null { return this.get<SyncConfig>('sync'); }
  private states(): Record<string, NovelState> { return this.get<Record<string, NovelState>>('sync_state') ?? {}; }
  private state(pid: string): NovelState { return this.states()[pid] ?? { based: null, basedHash: null, sharedAt: null, tookAt: null }; }
  private setState(pid: string, patch: Partial<NovelState>) { const all = this.states(); all[pid] = { ...this.state(pid), ...patch }; this.put('sync_state', all); }

  /** Turn sharing on with a folder, and name this computer. */
  configure(input: { dir: string; name?: string }) {
    const dir = input.dir.trim();
    if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) throw new ValidationError('That folder could not be found on this computer.');
    const prev = this.config();
    const name = (input.name ?? prev?.device.name ?? hostname()).trim().slice(0, 60) || 'This computer';
    const cfg: SyncConfig = { dir, device: { id: prev?.device.id ?? randomUUID(), name } };
    mkdirSync(join(dir, ROOT, 'computers'), { recursive: true });
    this.put('sync', cfg);
    return cfg;
  }
  turnOff() { this.store.db.prepare("DELETE FROM settings WHERE key='sync'").run(); }

  private root() { const c = this.config(); return c ? join(c.dir, ROOT) : null; }
  private novelDir(pid: string) { return join(this.root()!, pid); }

  // ---------- what has changed ----------
  /** A fingerprint of everything she made in a novel, ignoring only where she was looking. */
  fingerprint(pid: string): string {
    const a = exportArchive(this.store, pid);
    return sha(Object.entries(a.checksums).filter(([t]) => !NOISE.has(t)).sort().map(([t, h]) => `${t}:${h}`).join('|'));
  }
  changedSinceShared(pid: string) { return this.fingerprint(pid) !== this.state(pid).basedHash; }

  // ---------- the shared folder ----------
  copies(pid: string): SharedCopy[] {
    const dir = this.novelDir(pid);
    if (!existsSync(dir)) return [];
    const out: SharedCopy[] = [];
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.meta.json')) continue;
      try {
        const m = JSON.parse(readFileSync(join(dir, f), 'utf8')) as SharedCopy;
        if (m.projectId === pid && existsSync(join(dir, m.file))) out.push(m);
      } catch { /* a copy still arriving: try again next time */ }
    }
    return out.sort((a, b) => a.sharedAt.localeCompare(b.sharedAt) || a.file.localeCompare(b.file));
  }
  private read(c: SharedCopy): Archive {
    const buf = readFileSync(join(this.novelDir(c.projectId), c.file));
    if (sha(buf) !== c.sha) throw new ValidationError('A shared copy is incomplete. It may still be arriving; Story Canon will try again.');
    return JSON.parse(gunzipSync(buf).toString('utf8')) as Archive;
  }

  /** Add this computer's version of a novel to the shared folder, if it changed. */
  share(pid: string, force = false): { shared: boolean; copy?: SharedCopy } {
    const cfg = this.config(); if (!cfg) return { shared: false };
    const fp = this.fingerprint(pid);
    const st = this.state(pid);
    if (!force && fp === st.basedHash) return { shared: false };
    const archive = exportArchive(this.store, pid);
    const gz = gzipSync(Buffer.from(JSON.stringify(archive), 'utf8'));
    const sharedAt = nowIso();
    const base = `${sharedAt.replace(/[:.]/g, '-')}--${cfg.device.id}`;
    const dir = this.novelDir(pid); mkdirSync(dir, { recursive: true });
    const meta: SharedCopy = { file: `${base}.novel.gz`, projectId: pid, deviceId: cfg.device.id, deviceName: cfg.device.name, title: archive.title, sharedAt, basedOn: st.based, sha: sha(gz), bytes: gz.length };
    // Written under a temporary name first, so another computer never sees half a file.
    writeFileSync(join(dir, `${meta.file}.part`), gz); renameSync(join(dir, `${meta.file}.part`), join(dir, meta.file));
    writeFileSync(join(dir, `${base}.meta.part`), JSON.stringify(meta)); renameSync(join(dir, `${base}.meta.part`), join(dir, `${base}.meta.json`));
    this.setState(pid, { based: meta.file, basedHash: fp, sharedAt });
    this.prune(pid, cfg.device.id);
    return { shared: true, copy: meta };
  }
  private prune(pid: string, deviceId: string) {
    const mine = this.copies(pid).filter((c) => c.deviceId === deviceId);
    for (const c of mine.slice(0, Math.max(0, mine.length - KEEP))) {
      for (const f of [c.file, c.file.replace(/\.novel\.gz$/, '.meta.json')]) { try { unlinkSync(join(this.novelDir(pid), f)); } catch { /* already gone */ } }
    }
  }

  /** The newest copy another computer shared that this one has not taken in yet. */
  incoming(pid: string): SharedCopy | null {
    const cfg = this.config(); if (!cfg) return null;
    const st = this.state(pid);
    const all = this.copies(pid);
    const newest = all[all.length - 1];
    if (!newest || newest.deviceId === cfg.device.id || newest.file === st.based) return null;
    // Already in hand: something newer that this computer shared builds on it.
    const basedAt = all.find((c) => c.file === st.based)?.sharedAt ?? '';
    if (basedAt && newest.sharedAt <= basedAt) return null;
    return newest;
  }

  /** Take another computer's newer copy. Safe in every case: a backup comes first, and if this
   *  computer has changes of its own, the other version is kept beside it instead of over it. */
  async takeIncoming(pid: string): Promise<{ result: 'nothing' | 'took' | 'kept_both'; from?: string; copyId?: string; copyTitle?: string }> {
    const inc = this.incoming(pid);
    if (!inc) return { result: 'nothing' };
    const archive = this.read(inc);
    const exists = !!this.store.get('projects', pid);
    const mineChanged = exists && this.changedSinceShared(pid);
    await this.backup();
    if (!mineChanged) {
      if (exists) replaceProject(this.store, archive); else importArchive(this.store, archive);
      this.setState(pid, { based: inc.file, basedHash: this.fingerprint(pid), tookAt: nowIso() });
      return { result: 'took', from: inc.deviceName };
    }
    const when = new Date(inc.sharedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    const copyTitle = `${inc.title} (from ${inc.deviceName}, ${when})`;
    const r = importArchive(this.store, archive, { asCopy: true, copyTitle });
    // Hers stays as it is and is shared next, building on what it has now seen.
    this.setState(pid, { based: inc.file, basedHash: null, conflictAt: nowIso() });
    return { result: 'kept_both', from: inc.deviceName, copyId: r.projectId, copyTitle };
  }

  /** Bring a novel shared from another computer into this library for the first time. */
  async bring(pid: string) {
    if (this.store.get('projects', pid)) throw new ValidationError('That novel is already on this computer.');
    return this.takeIncoming(pid);
  }

  /** Novels shared from another computer that are not in this library yet. */
  elsewhere(): { projectId: string; title: string; deviceName: string; sharedAt: string; removed: boolean }[] {
    const root = this.root(); if (!root || !existsSync(root)) return [];
    const out: ReturnType<Sync['elsewhere']> = [];
    for (const d of readdirSync(root)) {
      if (d === 'computers' || this.store.get('projects', d)) continue;
      const all = this.copies(d); const newest = all[all.length - 1];
      if (!newest) continue;
      let removed = false;
      try { removed = !!(this.read(newest).tables.projects?.[0] as Row | undefined)?.deleted_at; } catch { continue; }
      out.push({ projectId: d, title: newest.title, deviceName: newest.deviceName, sharedAt: newest.sharedAt, removed });
    }
    return out.filter((x) => !x.removed).sort((a, b) => b.sharedAt.localeCompare(a.sharedAt));
  }

  // ---------- which computer is where ----------
  /** Say this computer is here, what it has open, and which novels have changes not yet shared. */
  presence(open: string | null) {
    const cfg = this.config(); const root = this.root(); if (!cfg || !root) return;
    mkdirSync(join(root, 'computers'), { recursive: true });
    const ids = (this.store.db.prepare('SELECT id FROM projects').all() as { id: string }[]).map((r) => r.id);
    const p: Presence = { name: cfg.device.name, lastSeen: nowIso(), open, unshared: ids.filter((id) => this.changedSinceShared(id)) };
    const f = join(root, 'computers', `${cfg.device.id}.json`);
    writeFileSync(`${f}.part`, JSON.stringify(p)); renameSync(`${f}.part`, f);
  }
  others(): (Presence & { id: string })[] {
    const cfg = this.config(); const root = this.root(); if (!cfg || !root) return [];
    const dir = join(root, 'computers'); if (!existsSync(dir)) return [];
    return readdirSync(dir).filter((f) => f.endsWith('.json') && f !== `${cfg.device.id}.json`).flatMap((f) => {
      try { return [{ ...(JSON.parse(readFileSync(join(dir, f), 'utf8')) as Presence), id: f.slice(0, -5) }]; } catch { return []; }
    });
  }

  /** Everything the window needs to know about one novel. */
  status(pid: string | null) {
    const cfg = this.config();
    if (!cfg) return { on: false as const };
    const st = pid ? this.state(pid) : null;
    const inc = pid ? this.incoming(pid) : null;
    const RECENT = 15 * 60_000;
    const busyElsewhere = pid ? this.others().filter((o) => o.unshared.includes(pid) && Date.now() - Date.parse(o.lastSeen) < RECENT).map((o) => ({ name: o.name, lastSeen: o.lastSeen })) : [];
    return {
      on: true as const, folder: cfg.dir, device: cfg.device.name,
      sharedAt: st?.sharedAt ?? null, tookAt: st?.tookAt ?? null,
      unshared: pid ? this.changedSinceShared(pid) : false,
      incoming: inc ? { deviceName: inc.deviceName, sharedAt: inc.sharedAt } : null,
      busyElsewhere,
      others: this.others().map((o) => ({ name: o.name, lastSeen: o.lastSeen })),
    };
  }

  /** One pass: share what changed, take in what is newer for novels not open in front of her. */
  async pass(opts: { open: string | null; shareChanged: boolean; take?: boolean }) {
    if (!this.config()) return { shared: [] as string[], took: [] as string[], keptBoth: [] as string[] };
    const shared: string[] = [], took: string[] = [], keptBoth: string[] = [];
    const ids = (this.store.db.prepare('SELECT id FROM projects').all() as { id: string }[]).map((r) => r.id);
    const remote = existsSync(this.root()!) ? readdirSync(this.root()!).filter((d) => d !== 'computers') : [];
    for (const pid of [...new Set([...ids, ...remote])]) {
      try {
        if (opts.take !== false && pid !== opts.open && this.store.get('projects', pid)) {
          const r = await this.takeIncoming(pid);
          if (r.result === 'took') took.push(pid); else if (r.result === 'kept_both') keptBoth.push(pid);
        }
        if (opts.shareChanged && this.store.get('projects', pid) && this.share(pid).shared) shared.push(pid);
      } catch { /* one novel's trouble never stops the others; it is tried again next pass */ }
    }
    try { this.presence(opts.open); } catch { /* the folder may be offline */ }
    return { shared, took, keptBoth };
  }
}
