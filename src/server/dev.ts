// Development launcher: binds to 127.0.0.1 only, with a fresh random token each launch.
import { randomBytes } from 'node:crypto';
import { BRAND } from '../brand.js';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildApp } from './app.js';
import { fakeAi } from './fake-ai.js';

const port = Number(process.env.STUDIO_PORT ?? 47321);
const dataDir = resolve(process.env.STUDIO_DATA ?? '.studio-data');
mkdirSync(dataDir, { recursive: true });
const token = process.env.STUDIO_TOKEN ?? randomBytes(24).toString('hex');

const { app } = await buildApp({
  dataPath: join(dataDir, 'novel-studio.sqlite3'),
  backupDir: join(dataDir, 'backups'),
  token,
  port,
  aiKey: process.env.STUDIO_AI_KEY ?? null,
  ...(process.env.STUDIO_NOTES_QUICK === '1' ? { notesTiming: { quietMs: 0, wakeHoldMs: 0 } } : {}),
  ...(process.env.STUDIO_AI_FAKE === '1' ? { aiClientFactory: fakeAi } : {}),
  staticDir: process.env.STUDIO_UI ? resolve(process.env.STUDIO_UI) : undefined,
  seedDir: resolve(process.env.STUDIO_SEEDS ?? 'seed'),
  logger: true,
});
await app.listen({ host: '127.0.0.1', port });
console.log(`${BRAND.name} service on http://127.0.0.1:${port}  token=${token}`);
