// The local service. Bound to 127.0.0.1, guarded by a per-launch token, Host and Origin checks.
// Every route validates its input; errors never expose internals.

import { Progress } from '../core/progress.js';
import { StoryTime } from '../core/storytime.js';
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { z, ZodError } from 'zod';
import { Store, AppError } from '../core/store.js';
import { Brain } from '../core/brain.js';
import { Manuscript } from '../core/manuscript.js';
import { WritingDesk } from '../core/writing.js';
import { Conversations } from '../core/conversations.js';
import { Structure } from '../core/structure.js';
import { Ripple } from '../core/ripple.js';
import { Zoom } from '../core/zoom.js';
import { Continuity } from '../core/continuity.js';
import { Collaborator, AiClient, anthropicClientFactory } from '../core/ai.js';
import { Importer } from '../core/io/importer.js';
import { Exporter } from '../core/io/exporter.js';
import { Setup } from '../core/setup.js';
import { Lenses } from '../core/lenses.js';
import { Books } from '../core/books.js';
import { Cast } from '../core/cast.js';
import { registerRoutes } from './routes.js';
import { snapshot } from '../core/backup.js';
import { Sync } from '../core/sync.js';
import { RoadNotes } from '../core/roadnotes.js';

export interface AppOptions {
  dataPath: string;          // SQLite file
  backupDir: string;
  token: string;
  port: number;              // the port the server will listen on (needed for Host/Origin checks)
  staticDir?: string;        // built UI
  logger?: boolean;
  /** Automatic verified backups: after this much time with changes since the last one (default 30 min). 0 turns them off. */
  autoBackupMs?: number;
  /** The collaborator's API client; tests inject a fake. Defaults to the Claude API. */
  aiClientFactory?: (key: string) => AiClient;
  /** Folder of starting novels that ship with the program (*.storycanon.json). The Library offers each until it is in or set aside. */
  seedDir?: string;
  /** The API key, handed over by the desktop shell from the operating system's secure storage. */
  aiKey?: string | null;
  /** Called when she saves or removes her API key, so the desktop shell can keep it in the operating system's secure storage. */
  onKeyChange?: (key: string | null) => boolean;
  /** Present only in the desktop app: the window can show the system's folder picker. */
  desktop?: boolean;
  /** Sharing between computers: how often to look (default 60 s) and how long changes wait before sharing (default 5 min). */
  syncTickMs?: number;
  /** Notes from the road: how long a file must sit still, and the wait after waking. Tests shorten them. */
  notesTiming?: { quietMs: number; wakeHoldMs: number };
  syncShareAfterMs?: number;
}

export interface Services {
  store: Store;
  brain: Brain;
  ms: Manuscript;
  desk: WritingDesk;
  convs: Conversations;
  structure: Structure;
  ripple: Ripple;
  zoom: Zoom;
  continuity: Continuity;
  ai: Collaborator;
  importer: Importer;
  exporter: Exporter;
  setup: Setup;
  lenses: Lenses;
  books: Books;
  cast: Cast;
  progress: Progress;
  storytime: StoryTime;
  sync: Sync;
  roadNotes: RoadNotes;
  /** The novel open in her window right now, as last reported, so it is never replaced under her. */
  openNovel: () => string | null;
  hereNow: (pid: string | null) => void;
  opts: AppOptions;
  /** Where backups go: the folder she chose, or the default beside her library. */
  backupDir: () => string;
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.json': 'application/json', '.ico': 'image/x-icon',
};

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function buildApp(opts: AppOptions): Promise<{ app: FastifyInstance; services: Services }> {
  const store = new Store(opts.dataPath);
  const brain = new Brain(store), ms = new Manuscript(store);
  const structure = new Structure(store, brain, ms), ripple = new Ripple(store, brain, ms, structure);
  const services: Services = { store, brain, ms, desk: new WritingDesk(store, brain, ms), convs: new Conversations(store, brain), structure, ripple, zoom: new Zoom(store, brain, ms, structure, ripple), continuity: new Continuity(store, brain, ms, structure, ripple), ai: null as unknown as Collaborator, importer: null as unknown as Importer, exporter: null as unknown as Exporter, setup: null as unknown as Setup, lenses: null as unknown as Lenses, books: null as unknown as Books, cast: null as unknown as Cast, progress: new Progress(store, ms), storytime: new StoryTime(store, brain, ms), sync: null as unknown as Sync, roadNotes: null as unknown as RoadNotes, openNovel: () => null, hereNow: () => {}, opts, backupDir: () => opts.backupDir };
  services.backupDir = () => {
    const r = store.db.prepare("SELECT value_json FROM settings WHERE key='backup_dir'").get() as { value_json: string } | undefined;
    const chosen = r ? (JSON.parse(r.value_json) as string) : '';
    return chosen || opts.backupDir;
  };
  services.cast = new Cast(store, brain, ms, structure, ripple, services.desk);
  services.books = new Books(store, brain, ms, services.desk);
  services.lenses = new Lenses(store, brain, ms, structure, services.continuity);
  services.setup = new Setup(store, brain, structure, services.continuity);
  services.importer = new Importer(store, brain, ms, structure, services.desk);
  services.exporter = new Exporter(store, brain, ms, structure, services.continuity);
  services.ai = new Collaborator(store, brain, ms, services.convs, services.continuity, opts.aiClientFactory ?? anthropicClientFactory());
  services.ai.setKey(opts.aiKey ?? null);
  const app = Fastify({ logger: opts.logger ?? false, bodyLimit: 60 * 1024 * 1024 });

  const allowedHosts = new Set([`127.0.0.1:${opts.port}`, `localhost:${opts.port}`]);
  const allowedOrigins = new Set([`http://127.0.0.1:${opts.port}`, `http://localhost:${opts.port}`]);

  // Only accept JSON bodies; a text/plain "simple" request from another site is refused.
  app.removeAllContentTypeParsers();
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    try { done(null, body === '' ? {} : JSON.parse(body as string)); }
    catch { done(new AppError('invalid', 'The request was not valid JSON.'), undefined); }
  });

  app.addHook('onRequest', async (req: FastifyRequest, reply: FastifyReply) => {
    const host = req.headers.host ?? '';
    if (!allowedHosts.has(host)) return reply.code(403).send({ error: 'forbidden', message: 'Refused: unexpected host.' });
    if (!req.url.startsWith('/api/')) return;
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.has(origin)) return reply.code(403).send({ error: 'forbidden', message: 'Refused: request came from another site.' });
    const token = req.headers['x-studio-token'];
    if (typeof token !== 'string' || !safeEqual(token, opts.token)) return reply.code(401).send({ error: 'unauthorized', message: 'Missing or wrong app token.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const ct = (req.headers['content-type'] ?? '').split(';')[0]!.trim().toLowerCase();
      const hasBody = Number(req.headers['content-length'] ?? 0) > 0 || req.headers['transfer-encoding'];
      if (hasBody && ct !== 'application/json') return reply.code(415).send({ error: 'unsupported', message: 'Requests must be JSON.' });
    }
  });

  app.setErrorHandler((err: unknown, _req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: 'invalid', message: 'Some fields are missing or the wrong type.', detail: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })) });
    }
    if (err instanceof AppError) {
      const code = err.code === 'invalid' ? 400 : err.code === 'not_found' ? 404 : err.code === 'conflict' ? 409 : err.code === 'schema_newer' ? 409 : 500;
      if (code === 500) { app.log.error(err); return reply.code(500).send({ error: 'internal', message: 'Something went wrong. Your saved work is safe.' }); }
      return reply.code(code).send({ error: err.code, message: err.message, detail: err.detail });
    }
    const e = err as { statusCode?: number; code?: string };
    if (e.statusCode === 413) return reply.code(413).send({ error: 'too_large', message: 'That is too large to send in one piece.' });
    if (e.statusCode && e.statusCode < 500) return reply.code(e.statusCode).send({ error: 'invalid', message: 'The request could not be read.' });
    app.log.error(err);
    return reply.code(500).send({ error: 'internal', message: 'Something went wrong. Your saved work is safe.' });
  });

  registerRoutes(app, services);

  // Static UI (built files). No directory listing, no path traversal.
  if (opts.staticDir) {
    const root = normalize(opts.staticDir);
    app.get('/*', async (req, reply) => {
      const urlPath = decodeURIComponent((req.url.split('?')[0] ?? '/'));
      let file = normalize(join(root, urlPath));
      if (!file.startsWith(root)) return reply.code(404).send();
      if (!existsSync(file) || !statSync(file).isFile()) file = join(root, 'index.html');
      if (!existsSync(file)) return reply.code(404).send();
      reply.header('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
      reply.header('Cache-Control', 'no-store');
      reply.header('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'");
      reply.header('X-Content-Type-Options', 'nosniff');
      return reply.send(readFileSync(file));
    });
  }

  // Automatic backups: while there are changes, a verified snapshot every autoBackupMs, and one on close.
  let changedSince = false, lastBackup = Date.now();
  app.addHook('onResponse', async (req, reply) => { if (req.method !== 'GET' && reply.statusCode < 400 && req.url.startsWith('/api/')) changedSince = true; });
  const every = opts.autoBackupMs ?? 30 * 60_000;
  const backupNow = async () => {
    if (!changedSince) return;
    changedSince = false; lastBackup = Date.now();
    try { await snapshot(store, services.backupDir(), 'auto', 20); } catch (e) { changedSince = true; app.log.error(e); }
  };
  const timer = every > 0 ? setInterval(() => { if (Date.now() - lastBackup >= every) void backupNow(); }, Math.min(every, 60_000)) : null;
  timer?.unref?.();
  (services as Services & { backupNow?: () => Promise<void> }).backupNow = backupNow;

  // Sharing between her computers: look every minute; share a changed novel after a few quiet minutes, and on close.
  // A novel she has opened in this session is never replaced in the background: the notice above the page asks first.
  const sync = new Sync(store, () => snapshot(store, services.backupDir(), 'sync', 30));
  services.sync = sync;
  services.roadNotes = new RoadNotes(store, brain, () => sync.config()?.dir ?? null, Date.now, opts.notesTiming);
  const opened = new Set<string>();
  let open: string | null = null;
  services.hereNow = (pid) => { open = pid; if (pid) opened.add(pid); };
  services.openNovel = () => open;
  let lastShare = Date.now();
  const shareAfter = opts.syncShareAfterMs ?? 5 * 60_000;
  const syncPass = async (o: { take: boolean; share: boolean }) => {
    if (!sync.config()) return;
    try { await sync.pass({ protect: opened, shareChanged: o.share, take: o.take, open }); if (o.share) lastShare = Date.now(); }
    catch (e) { app.log.error(e); }
  };
  const syncTimer = setInterval(() => void syncPass({ take: true, share: Date.now() - lastShare >= shareAfter }), opts.syncTickMs ?? 60_000);
  syncTimer.unref?.();
  // On opening, before the window can show anything: take in what the other computer shared while this one was closed.
  // Bounded, so an unreachable folder never keeps the window from opening; the pass carries on in the background.
  if (sync.config()) await Promise.race([syncPass({ take: true, share: false }), new Promise((r) => setTimeout(r, 15_000))]);
  // Once: recount text that already held [[brackets]]. A novel with newer work waiting on the other
  // computer is left for a later start, so the recount can never look like a change made here.
  try { ms.recountLater((pid) => { const st = sync.config() ? sync.status(pid) as { incoming?: unknown; diverged?: unknown } : null; return !!(st?.incoming || st?.diverged); }); } catch { /* counts stay as they were; nothing is lost */ }

  app.addHook('onClose', async () => {
    clearInterval(syncTimer);
    open = null; // closing: tell the other computer nothing is open here any more
    if (sync.config()) await syncPass({ take: false, share: true });
    if (timer) clearInterval(timer); if (every > 0) await backupNow(); store.close();
  });
  return { app, services };
}

export { z };
