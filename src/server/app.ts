// The local service. Bound to 127.0.0.1, guarded by a per-launch token, Host and Origin checks.
// Every route validates its input; errors never expose internals.

import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { z, ZodError } from 'zod';
import { Store, AppError } from '../core/store.js';
import { Brain } from '../core/brain.js';
import { Manuscript } from '../core/manuscript.js';
import { WritingDesk } from '../core/writing.js';
import { registerRoutes } from './routes.js';

export interface AppOptions {
  dataPath: string;          // SQLite file
  backupDir: string;
  token: string;
  port: number;              // the port the server will listen on (needed for Host/Origin checks)
  staticDir?: string;        // built UI
  logger?: boolean;
}

export interface Services {
  store: Store;
  brain: Brain;
  ms: Manuscript;
  desk: WritingDesk;
  opts: AppOptions;
}

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon',
};

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function buildApp(opts: AppOptions): Promise<{ app: FastifyInstance; services: Services }> {
  const store = new Store(opts.dataPath);
  const brain = new Brain(store), ms = new Manuscript(store);
  const services: Services = { store, brain, ms, desk: new WritingDesk(store, brain, ms), opts };
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
      if (!existsSync(file) || urlPath.endsWith('/')) file = join(root, 'index.html');
      if (!existsSync(file)) return reply.code(404).send();
      reply.header('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
      reply.header('Cache-Control', 'no-store');
      reply.header('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'");
      reply.header('X-Content-Type-Options', 'nosniff');
      return reply.send(readFileSync(file));
    });
  }

  app.addHook('onClose', async () => { store.close(); });
  return { app, services };
}

export { z };
