import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/server/app.js';

const PORT = 47123;
const TOKEN = 'test-token-0123456789abcdef';
let app: FastifyInstance;
let dir: string;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), 'ns-api-'));
  ({ app } = await buildApp({ dataPath: join(dir, 'db.sqlite3'), backupDir: join(dir, 'backups'), token: TOKEN, port: PORT }));
});
afterEach(async () => { await app.close(); rmSync(dir, { recursive: true, force: true }); });

type Opts = { headers?: Record<string, string>; raw?: string };
async function call(method: string, url: string, payload?: unknown, o: Opts = {}) {
  const headers: Record<string, string> = { host: `127.0.0.1:${PORT}`, 'x-studio-token': TOKEN, ...(o.headers ?? {}) };
  if (payload !== undefined && !('content-type' in headers)) headers['content-type'] = 'application/json';
  const res = await app.inject({ method: method as never, url, headers, payload: o.raw ?? (payload === undefined ? undefined : JSON.stringify(payload)) });
  return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : null };
}

describe('security (S1, S2, S3)', () => {
  it('refuses requests without the app token', async () => {
    const r = await call('GET', '/api/projects', undefined, { headers: { 'x-studio-token': 'wrong' } });
    expect(r.status).toBe(401);
  });
  it('refuses a cross-site text/plain POST even with a guessed token-less request', async () => {
    const r = await app.inject({ method: 'POST', url: '/api/projects', headers: { host: `127.0.0.1:${PORT}`, origin: 'https://evil.example', 'content-type': 'text/plain' }, payload: '{"title":"x"}' });
    expect(r.statusCode).toBe(403);
  });
  it('refuses text/plain bodies even with the token', async () => {
    const r = await call('POST', '/api/projects', undefined, { headers: { 'content-type': 'text/plain' }, raw: '{"title":"x"}' });
    expect(r.status).toBe(415);
  });
  it('refuses a foreign Host header (DNS rebinding)', async () => {
    const r = await call('GET', '/api/projects', undefined, { headers: { host: 'attacker.example:47123' } });
    expect(r.status).toBe(403);
  });
  it('refuses a foreign Origin', async () => {
    const r = await call('POST', '/api/projects', { title: 'x' }, { headers: { origin: 'https://evil.example' } });
    expect(r.status).toBe(403);
  });
  it('never leaks internal error text', async () => {
    const r = await call('POST', '/api/projects', undefined, { headers: { 'content-type': 'application/json' }, raw: '{not json' });
    expect(r.status).toBe(400);
    expect(JSON.stringify(r.body)).not.toMatch(/at |stack|sqlite/i);
  });
});

describe('validation (D5, D15, AC17)', () => {
  it('rejects wrong types with a clean 400 instead of a crash', async () => {
    const p = (await call('POST', '/api/projects', { title: 'IDW' })).body;
    const e = (await call('POST', `/api/projects/${p.id}/elements`, { kind: 'note', title: 'n' })).body;
    expect((await call('PATCH', `/api/elements/${e.id}`, { body: { x: 1 } })).status).toBe(400);
    expect((await call('PATCH', `/api/elements/${e.id}`, { body: null })).status).toBe(400);
    expect((await call('POST', `/api/projects/${p.id}/elements`, { kind: 'subplot', title: 'x' })).status).toBe(400);
    expect((await call('GET', '/api/projects/nope')).status).toBe(404);
    expect((await call('GET', '/api/no-such-endpoint')).status).toBe(404);
  });
  it('very long prose round-trips without truncation', async () => {
    const p = (await call('POST', '/api/projects', { title: 'IDW' })).body;
    const ch = (await call('POST', `/api/projects/${p.id}/chapters`, {})).body;
    const long = 'word '.repeat(400_000).trim();
    const s = (await call('POST', `/api/chapters/${ch.id}/scenes`, { text: long })).body;
    const back = (await call('GET', `/api/scenes/${s.id}`)).body;
    expect(back.text.length).toBe(long.length);
    expect(back.word_count).toBe(400_000);
  });
});

describe('end-to-end author workflows over HTTP', () => {
  it('AC01: a second novel in another genre needs no I Declare War defaults', async () => {
    const p = (await call('POST', '/api/projects', { title: 'The Replacement', profile: { genres: [{ name: 'Psychological thriller', role: 'primary' }] } })).body;
    expect(p.profile.genres[0].name).toBe('Psychological thriller');
    expect((await call('GET', `/api/projects/${p.id}/elements`)).body).toEqual([]);
  });

  it('AC16 via HTTP: undo a title change, keep the newer prose', async () => {
    const p = (await call('POST', '/api/projects', { title: 'IDW' })).body;
    const ch = (await call('POST', `/api/projects/${p.id}/chapters`, {})).body;
    const s = (await call('POST', `/api/chapters/${ch.id}/scenes`, { title: 'Old', text: 'first draft' })).body;
    await call('PATCH', `/api/scenes/${s.id}`, { title: 'New' });
    const hist = (await call('GET', `/api/projects/${p.id}/history`)).body;
    const titleBatch = hist[0];
    const cur = (await call('GET', `/api/scenes/${s.id}`)).body;
    const saved = await call('PUT', `/api/scenes/${s.id}/prose`, { doc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'first draft plus new words' }] }] }, expectVersion: cur.version });
    expect(saved.status).toBe(200);
    expect((await call('POST', `/api/batches/${titleBatch.id}/undo`, {})).status).toBe(200);
    const after = (await call('GET', `/api/scenes/${s.id}`)).body;
    expect(after.title).toBe('Old');
    expect(after.text).toContain('new words');
  });

  it('D4 via HTTP: a stale save gets a 409 with both versions, nothing is lost', async () => {
    const p = (await call('POST', '/api/projects', { title: 'IDW' })).body;
    const ch = (await call('POST', `/api/projects/${p.id}/chapters`, {})).body;
    const s = (await call('POST', `/api/chapters/${ch.id}/scenes`, { text: 'base' })).body;
    const d = (t: string) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] });
    expect((await call('PUT', `/api/scenes/${s.id}/prose`, { doc: d('tab A'), expectVersion: s.version })).status).toBe(200);
    const stale = await call('PUT', `/api/scenes/${s.id}/prose`, { doc: d('tab B'), expectVersion: s.version });
    expect(stale.status).toBe(409);
    expect(stale.body.detail.current.text).toBe('tab A');
  });

  it('AC15 via HTTP: archive, plan, refuse duplicate, import as copy', async () => {
    const p = (await call('POST', '/api/projects', { title: 'IDW' })).body;
    await call('POST', `/api/projects/${p.id}/capture`, { text: 'The Voice of Reason' });
    const archive = (await call('GET', `/api/projects/${p.id}/archive`)).body;
    const plan = (await call('POST', '/api/archive/plan', { archive })).body;
    expect(plan.mode).toBe('already_present');
    const copy = (await call('POST', '/api/archive/import', { archive, asCopy: true })).body;
    expect(copy.imported).toBe(true);
    expect((await call('GET', '/api/projects')).body).toHaveLength(2);
    const hits = (await call('GET', `/api/search?q=${encodeURIComponent('Voice of Reason')}`)).body;
    expect(hits.filter((h: { hit: string }) => h.hit === 'element')).toHaveLength(2);
  });

  it('Return to Writing remembers the exact scene and cursor through a detour', async () => {
    const p = (await call('POST', '/api/projects', { title: 'IDW' })).body;
    const ch = (await call('POST', `/api/projects/${p.id}/chapters`, {})).body;
    const s = (await call('POST', `/api/chapters/${ch.id}/scenes`, { text: 'drafting here' })).body;
    await call('PUT', `/api/projects/${p.id}/writing-state`, { sceneId: s.id, cursor: { from: 7, to: 7 } });
    await call('POST', `/api/projects/${p.id}/trail`, { from: { sceneId: s.id }, to: { elementId: 'kevin' }, reason: 'Checking Kevin’s Lie' });
    const ws = (await call('GET', `/api/projects/${p.id}/writing-state`)).body;
    expect(ws.state.sceneId).toBe(s.id);
    expect(ws.state.cursor).toEqual({ from: 7, to: 7 });
    expect(ws.trail[0].reason).toBe('Checking Kevin’s Lie');
  });
});
