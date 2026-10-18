// Sharing novels between her computers through a folder both can see (her OneDrive).
//
// Step one of two: whole-novel hand-off. Each computer keeps its own library and, when a novel has
// changed, adds a compressed, checksummed copy of that novel to the shared folder. It never writes
// into a file another computer made, so the folder service can never corrupt anything.
//
// Who has what is kept as a count per computer (how many times each computer has shared this novel
// that this copy includes), never as clock times. Story Canon acts on its own only when there is no
// choice to make: another computer's copy includes everything this one has and this one has nothing
// new. When both computers changed the novel since they last agreed, it stops and asks her which
// version stays the main one; the other is kept beside it, on both computers, either way.

import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { hostname } from 'node:os';
import { join } from 'node:path';
import { gunzipSync, gzipSync } from 'node:zlib';
import { Store, Row, ValidationError, nowIso } from './store.js';
import { Archive, ARCHIVE_TABLES, exportArchive, importArchive, replaceProject } from './backup.js';

export interface SyncConfig { dir: string; device: { id: string; name: string; host?: string }; ask?: boolean }
type Vector = Record<string, number>;
interface NovelState {
  vector: Vector;            // what this computer's novel includes, counted per computer
  basedHash: string | null;  // the content fingerprint when this computer last shared or took it
  sharedAt: string | null; tookAt: string | null;
  keptBeside?: { from: string } | null; // this novel is a version kept beside another; it travels to every computer
}
export interface SharedCopy { file: string; projectId: string; deviceId: string; deviceName: string; title: string; sharedAt: string; vector: Vector; contentHash: string; sha: string; bytes: number; keptBeside?: boolean; removed?: boolean }
interface Presence { name: string; lastSeen: string; open: string | null; unshared: string[] }
export type TakeResult = { result: 'nothing' | 'took' | 'same' | 'diverged' | 'retry' | 'kept_both' | 'changed'; from?: string; copyId?: string; copyTitle?: string };

const ROOT = 'Story Canon shared';
const KEEP = 10;            // copies kept per computer per novel
// Not part of what she wrote: where she is looking, and typing kept for crash recovery on this computer only.
const NOISE = new Set(['writing_state', 'trail', 'autosave_journal']);
const ID = /^[A-Za-z0-9_-]{6,64}$/;

const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');
const empty = (): NovelState => ({ vector: {}, basedHash: null, sharedAt: null, tookAt: null });
/** a includes nothing that b lacks */
export const within = (a: Vector, b: Vector) => Object.entries(a).every(([k, n]) => (b[k] ?? 0) >= n);
const merge = (a: Vector, b: Vector) => { const o = { ...a }; for (const [k, n] of Object.entries(b)) o[k] = Math.max(o[k] ?? 0, n); return o; };
const when = (iso: string) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

/** A fingerprint of what she made in a novel, the same on every computer for the same content. */
export function contentHash(a: Archive): string {
  const parts: string[] = [];
  for (const { table } of ARCHIVE_TABLES) {
    if (NOISE.has(table)) continue;
    // A writing session counts once something was written in it or a note was left.
    const kept = table === 'writing_sessions' ? (a.tables[table] ?? []).filter((r) => r.scenes_json !== '[]' || String(r.note ?? '').trim()) : (a.tables[table] ?? []);
    const rows = kept.map((r) => {
      const o = { ...r } as Row;
      if (table === 'journal') delete o.seq; // numbering differs between libraries; order does not
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
    if (c.device.host !== hostname()) { c.device = { ...c.device, id: c.device.host ? randomUUID() : c.device.id, host: hostname() }; this.put('sync', c); }
    return c;
  }
  private states(): Record<string, NovelState> { return this.get<Record<string, NovelState>>('sync_state') ?? {}; }
  private state(pid: string): NovelState { return { ...empty(), ...(this.states()[pid] ?? {}) }; }
  private setState(pid: string, patch: Partial<NovelState>) { const all = this.states(); all[pid] = { ...this.state(pid), ...patch }; this.put('sync_state', all); }

  /** Turn sharing on with a folder, and name this computer. Its identity stays the same if turned off and on. */
  configure(input: { dir: string; name?: string }) {
    const dir = input.dir.trim();
    if (!dir || !existsSync(dir) || !statSync(dir).isDirectory()) throw new ValidationError('That folder could not be found on this computer.');
    const prev = this.get<SyncConfig>('sync');
    const name = (input.name ?? prev?.device.name ?? hostname()).trim().slice(0, 60) || 'This computer';
    const cfg: SyncConfig = { dir, device: { id: prev?.device.id ?? randomUUID(), name, host: hostname() }, ask: prev?.ask ?? true };
    mkdirSync(join(dir, ROOT, 'computers'), { recursive: true });
    this.put('sync', cfg);
    return cfg;
  }
  /** Ask before bringing in another computer's work (the default), or bring it in on its own when there is no choice to make. */
  asking() { return this.get<SyncConfig>('sync')?.ask !== false; }
  setAsking(ask: boolean) { const c = this.get<SyncConfig>('sync'); if (c) this.put('sync', { ...c, ask }); }
  turnOff() { const c = this.get<SyncConfig>('sync'); if (c) this.put('sync', { ...c, dir: '' }); }

  private root() { const c = this.config(); return c ? join(c.dir, ROOT) : null; }
  private novelDir(pid: string) { return join(this.root()!, pid); }
  /** Novel folders in the shared folder; anything else there (desktop.ini, stray files) is ignored. */
  private remoteIds(): string[] {
    const root = this.root(); if (!root || !existsSync(root)) return [];
    try { return readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'computers' && ID.test(d.name)).map((d) => d.name); } catch { return []; }
  }

  // ---------- what has changed ----------
  fingerprint(pid: string): string { return contentHash(exportArchive(this.store, pid)); }
  changedSinceShared(pid: string) { return this.fingerprint(pid) !== this.state(pid).basedHash; }

  // ---------- the shared folder ----------
  copies(pid: string): SharedCopy[] {
    const dir = this.novelDir(pid);
    let names: string[] = [];
    try { names = readdirSync(dir); } catch { return []; }
    const out: SharedCopy[] = [];
    for (const f of names) {
      if (!f.endsWith('.meta.json')) continue;
      try {
        const m = JSON.parse(readFileSync(join(dir, f), 'utf8')) as SharedCopy;
        if (m.projectId === pid && m.vector && typeof m.vector === 'object' && names.includes(m.file)) out.push(m);
      } catch { /* a copy still arriving: try again next time */ }
    }
    return out.sort((a, b) => a.file.localeCompare(b.file));
  }
  private async read(c: SharedCopy): Promise<Archive> {
    const buf = await readFile(join(this.novelDir(c.projectId), c.file));
    if (sha(buf) !== c.sha) throw new ValidationError('A shared copy is incomplete. It may still be arriving; Story Canon will try again.');
    return JSON.parse(gunzipSync(buf).toString('utf8')) as Archive;
  }

  private shareNow(pid: string, force = false): { shared: boolean; copy?: SharedCopy } {
    const cfg = this.config(); if (!cfg) return { shared: false };
    const archive = exportArchive(this.store, pid);
    const fp = contentHash(archive);
    const st = this.state(pid);
    if (!force && fp === st.basedHash) return { shared: false };
    const me = cfg.device.id;
    // Never reuse a count, even after her library was restored from a backup or a share was interrupted.
    const highest = Math.max(st.vector[me] ?? 0, ...this.copies(pid).filter((c) => c.deviceId === me).map((c) => c.vector[me] ?? 0));
    const vector = { ...st.vector, [me]: highest + 1 };
    const gz = gzipSync(Buffer.from(JSON.stringify(archive), 'utf8'));
    const sharedAt = nowIso();
    const base = `${sharedAt.replace(/[:.]/g, '-')}--${me}`;
    const dir = this.novelDir(pid); mkdirSync(dir, { recursive: true });
    const meta: SharedCopy = { file: `${base}.novel.gz`, projectId: pid, deviceId: me, deviceName: cfg.device.name, title: archive.title, sharedAt, vector, contentHash: fp, sha: sha(gz), bytes: gz.length, keptBeside: !!st.keptBeside, removed: !!(archive.tables.projects?.[0] as Row | undefined)?.deleted_at };
    // Written under a temporary name first, so another computer never sees half a file.
    writeFileSync(join(dir, `${meta.file}.part`), gz); renameSync(join(dir, `${meta.file}.part`), join(dir, meta.file));
    writeFileSync(join(dir, `${base}.meta.part`), JSON.stringify(meta)); renameSync(join(dir, `${base}.meta.part`), join(dir, `${base}.meta.json`));
    this.setState(pid, { vector, basedHash: fp, sharedAt });
    this.prune(pid, me);
    return { shared: true, copy: meta };
  }
  private prune(pid: string, deviceId: string) {
    const dir = this.novelDir(pid);
    const mine = this.copies(pid).filter((c) => c.deviceId === deviceId).sort((a, b) => (a.vector[deviceId] ?? 0) - (b.vector[deviceId] ?? 0));
    for (const c of mine.slice(0, Math.max(0, mine.length - KEEP))) {
      for (const f of [c.file, c.file.replace(/\.novel\.gz$/, '.meta.json')]) { try { unlinkSync(join(dir, f)); } catch { /* already gone */ } }
    }
    // Leftovers from a share interrupted by a file lock: tidied after a day.
    try {
      const names = readdirSync(dir);
      for (const f of names) {
        const old = () => Date.now() - statSync(join(dir, f)).mtimeMs > 86_400_000;
        const orphan = f.endsWith('.novel.gz') && !names.includes(f.replace(/\.novel\.gz$/, '.meta.json'));
        if ((f.endsWith('.part') || orphan) && old()) unlinkSync(join(dir, f));
      }
    } catch { /* keep going */ }
  }

  /** Other computers' copies that include something this computer does not have: the newest of each separate line. */
  private heads(pid: string): SharedCopy[] {
    const cfg = this.config(); if (!cfg) return [];
    const mine = this.state(pid).vector;
    const fresh = this.copies(pid).filter((c) => c.deviceId !== cfg.device.id && !within(c.vector, mine));
    return fresh.filter((c) => !fresh.some((d) => d !== c && within(c.vector, d.vector) && !within(d.vector, c.vector)))
      .sort((a, b) => a.sharedAt.localeCompare(b.sharedAt));
  }

  /** What another computer's newest copy means for this computer's novel. */
  private judge(pid: string, h: SharedCopy, fp?: string): 'take' | 'same' | 'diverged' {
    if (!this.store.get('projects', pid)) return 'take';
    const st = this.state(pid);
    const now = fp ?? this.fingerprint(pid);
    if (now === h.contentHash) return 'same';
    const unchanged = now === st.basedHash;
    return unchanged && within(st.vector, h.vector) ? 'take' : 'diverged';
  }

  /** Replace this computer's novel with a copy, keeping this computer's own crash-recovery typing. */
  private replaceWith(pid: string, h: SharedCopy, archive: Archive) {
    this.store.db.transaction(() => {
      const here = !!this.store.get('projects', pid);
      const recovery = here ? this.store.db.prepare('SELECT a.* FROM autosave_journal a JOIN scenes s ON s.id=a.scene_id WHERE s.project_id=?').all(pid) as Row[] : [];
      if (here) replaceProject(this.store, archive); else importArchive(this.store, archive);
      this.store.db.prepare('DELETE FROM autosave_journal WHERE scene_id IN (SELECT id FROM scenes WHERE project_id=?)').run(pid);
      for (const r of recovery) {
        if (!this.store.get('scenes', r.scene_id as string)) continue;
        const cols = Object.keys(r);
        this.store.db.prepare(`INSERT INTO autosave_journal(${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`).run(...cols.map((c) => r[c] as never));
      }
      this.setState(pid, { vector: merge(this.state(pid).vector, h.vector), basedHash: this.fingerprint(pid), tookAt: nowIso(), keptBeside: h.keptBeside ? { from: h.deviceName } : this.state(pid).keptBeside ?? null });
    })();
  }

  /** Take in another computer's newer copy when there is no choice to make. Divergence is left for her to decide. */
  private async takeNow(pid: string, opts: { backedUp?: boolean } = {}): Promise<TakeResult> {
    const heads = this.heads(pid);
    if (!heads.length) return { result: 'nothing' };
    const before = this.store.get('projects', pid) ? this.fingerprint(pid) : null;
    if (!opts.backedUp) await this.backup();
    // Nothing may change between the decision and the change: if she typed during the backup, wait for next time.
    if (before !== null && this.fingerprint(pid) !== before) return { result: 'retry' };
    let last: TakeResult = { result: 'nothing' };
    for (const h of heads) {
      const verdict = this.judge(pid, h);
      if (verdict === 'diverged') { last = { result: 'diverged', from: h.deviceName }; continue; }
      if (verdict === 'same') { this.setState(pid, { vector: merge(this.state(pid).vector, h.vector), basedHash: this.fingerprint(pid) }); last = { result: 'same' }; continue; }
      const archive = await this.read(h);
      if (before !== null && this.store.get('projects', pid) && this.fingerprint(pid) !== before) return { result: 'retry' };
      this.replaceWith(pid, h, archive);
      last = { result: 'took', from: h.deviceName };
    }
    return last;
  }

  /** Her choice when both computers changed a novel. Both versions are kept either way; she picks the main one. */
  private async resolveNow(pid: string, keep: 'mine' | 'theirs', file?: string): Promise<TakeResult> {
    const fp = this.fingerprint(pid);
    const h = this.heads(pid).filter((x) => this.judge(pid, x, fp) === 'diverged').pop();
    if (!h) return { result: 'nothing' };
    if (file && h.file !== file) return { result: 'changed' }; // something newer arrived: show her the choice again
    const archive = await this.read(h);
    await this.backup();
    const cfg = this.config()!;
    if (keep === 'mine') {
      const copyTitle = `${h.title} (from ${h.deviceName}, ${when(h.sharedAt)})`;
      let copyId = '';
      this.store.db.transaction(() => {
        copyId = importArchive(this.store, archive, { asCopy: true, copyTitle }).projectId;
        this.store.db.prepare('UPDATE projects SET deleted_at=NULL WHERE id=?').run(copyId);
        this.setState(copyId, { keptBeside: { from: h.deviceName } });
        // Hers is the main version and now supersedes the other computer's: shared next, it is taken there.
        this.setState(pid, { vector: merge(this.state(pid).vector, h.vector), basedHash: null });
      })();
      this.shareNow(copyId, true); this.shareNow(pid, true);
      return { result: 'kept_both', from: h.deviceName, copyId, copyTitle };
    }
    const mine = exportArchive(this.store, pid);
    const copyTitle = `${mine.title} (${cfg.device.name} version, ${when(nowIso())})`;
    let copyId = '';
    this.store.db.transaction(() => {
      copyId = importArchive(this.store, mine, { asCopy: true, copyTitle }).projectId;
      this.store.db.prepare('UPDATE projects SET deleted_at=NULL WHERE id=?').run(copyId);
      this.setState(copyId, { keptBeside: { from: cfg.device.name } });
      this.replaceWith(pid, h, archive);
    })();
    // Her decision is shared too, so the other computer is not asked again.
    this.shareNow(copyId, true); this.shareNow(pid, true);
    return { result: 'kept_both', from: h.deviceName, copyId, copyTitle };
  }

  // ---------- the public operations, one at a time ----------
  share(pid: string, force = false) { return this.exclusive(() => this.shareNow(pid, force)); }
  takeIncoming(pid: string) { return this.exclusive(() => this.takeNow(pid)); }
  resolve(pid: string, keep: 'mine' | 'theirs', file?: string) { return this.exclusive(() => this.resolveNow(pid, keep, file)); }
  bring(pid: string) {
    return this.exclusive(async () => {
      if (this.store.get('projects', pid)) throw new ValidationError('That novel is already on this computer.');
      return this.takeNow(pid);
    });
  }

  /** One pass: take in newer work for novels she has not opened this session, bring versions kept beside, share what changed. */
  pass(opts: { protect?: Set<string> | string | null; shareChanged: boolean; take?: boolean; open?: string | null }) {
    return this.exclusive(async () => {
      const out = { shared: [] as string[], took: [] as string[], diverged: [] as string[] };
      if (!this.config()) return out;
      const protect = opts.protect instanceof Set ? opts.protect : new Set(opts.protect ? [opts.protect] : []);
      const local = (this.store.db.prepare('SELECT id FROM projects').all() as { id: string }[]).map((r) => r.id);
      let backedUp = false;
      if (opts.take !== false) {
        const ask = this.asking();
        // Versions kept beside another are new novels, never changes to hers: they arrive on every computer.
        const arriving = this.remoteIds().filter((id) => !local.includes(id) && this.copies(id).some((c) => c.keptBeside));
        for (const pid of [...local, ...arriving]) {
          try {
            if (protect.has(pid)) continue;
            const heads = this.heads(pid);
            if (!heads.length) continue;
            const here = !!this.store.get('projects', pid);
            if (here) {
              // The same content shared from elsewhere changes nothing: record it, so it never looks like a disagreement.
              const fp = this.fingerprint(pid);
              for (const h of heads) if (this.judge(pid, h, fp) === 'same') this.setState(pid, { vector: merge(this.state(pid).vector, h.vector), basedHash: fp });
              // When she asks to approve, real changes wait for her click.
              if (ask || !this.heads(pid).length) continue;
            }
            if (!backedUp) { await this.backup(); backedUp = true; }
            if (protect.has(pid)) continue; // opened while the backup ran
            const r = await this.takeNow(pid, { backedUp: true });
            if (r.result === 'took') out.took.push(pid); else if (r.result === 'diverged') out.diverged.push(pid);
          } catch { /* one novel's trouble never stops the others; it is tried again next pass */ }
        }
      }
      if (opts.shareChanged) {
        for (const pid of (this.store.db.prepare('SELECT id FROM projects').all() as { id: string }[]).map((r) => r.id)) {
          try { if (this.shareNow(pid).shared) out.shared.push(pid); } catch { /* tried again next pass */ }
        }
        try { this.presenceNow(opts.open !== undefined ? opts.open : protect.size ? [...protect][protect.size - 1]! : null); } catch { /* the folder may be offline */ }
      }
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
  private lastPresence = { at: 0, open: null as string | null };
  /** From the window's heartbeat: say which novel is open now, at most once a minute unless it changed. */
  presenceFromWindow(open: string | null) {
    if (open === this.lastPresence.open && Date.now() - this.lastPresence.at < 60_000) return Promise.resolve();
    this.lastPresence = { at: Date.now(), open };
    return this.presence(open).catch(() => {});
  }
  others(): (Presence & { id: string })[] {
    const cfg = this.config(); const root = this.root(); if (!cfg || !root) return [];
    const dir = join(root, 'computers');
    let names: string[] = [];
    try { names = readdirSync(dir); } catch { return []; }
    return names.filter((f) => f.endsWith('.json') && f !== `${cfg.device.id}.json`).flatMap((f) => {
      try { return [{ ...(JSON.parse(readFileSync(join(dir, f), 'utf8')) as Presence), id: f.slice(0, -5) }]; } catch { return []; }
    });
  }

  /** Notes from the road are brought in by one computer only: when two have the novel open, the one
   *  with the lower id takes the turn, so the same note can never come in on both. */
  notesTurn(pid: string): boolean {
    const cfg = this.config(); if (!cfg) return false;
    const recent = (o: Presence) => Date.now() - Date.parse(o.lastSeen) < 4 * 60_000; // presence is written at least once a minute while the window is open
    return !this.others().some((o) => o.open === pid && recent(o) && o.id < cfg.device.id);
  }

  /** Novels shared from another computer that are not in this library yet. */
  elsewhere(): { projectId: string; title: string; deviceName: string; sharedAt: string }[] {
    const out: ReturnType<Sync['elsewhere']> = [];
    for (const d of this.remoteIds()) {
      try {
        if (this.store.get('projects', d)) continue;
        const all = this.copies(d); const newest = all[all.length - 1];
        if (!newest || newest.removed) continue;
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
    const here = !!(pid && this.store.get('projects', pid));
    const heads = pid && here ? this.heads(pid) : [];
    const fp = here ? this.fingerprint(pid!) : undefined;
    const judged = pid ? heads.map((h) => ({ h, v: this.judge(pid, h, fp) })) : [];
    const take = judged.filter((x) => x.v === 'take').pop()?.h ?? null;
    const div = judged.filter((x) => x.v === 'diverged').pop()?.h ?? null;
    const RECENT = 15 * 60_000;
    const others = this.others();
    const busyElsewhere = pid ? others.filter((o) => o.unshared.includes(pid) && Date.now() - Date.parse(o.lastSeen) < RECENT).map((o) => ({ name: o.name, lastSeen: o.lastSeen })) : [];
    return {
      on: true as const, folder: cfg.dir, device: cfg.device.name, ask: this.asking(),
      sharedAt: st?.sharedAt ?? null, tookAt: st?.tookAt ?? null,
      unshared: here ? fp !== st!.basedHash : false,
      incoming: take ? { deviceName: take.deviceName, sharedAt: take.sharedAt } : null,
      diverged: div ? { deviceName: div.deviceName, sharedAt: div.sharedAt, file: div.file } : null,
      busyElsewhere,
      others: others.map((o) => ({ name: o.name, lastSeen: o.lastSeen })),
    };
  }
}
