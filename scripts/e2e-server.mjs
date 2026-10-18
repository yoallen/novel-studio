// Starts the service for end-to-end tests with a throwaway library and a known token.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
const port = process.argv[2] ?? '47391';
const data = mkdtempSync(join(tmpdir(), 'ns-e2e-'));
const child = spawn(process.execPath, ['--import', 'tsx', 'src/server/dev.ts'], {
  stdio: 'inherit',
  env: { ...process.env, STUDIO_PORT: port, STUDIO_DATA: data, STUDIO_UI: 'dist/ui', STUDIO_TOKEN: 'e2etoken0123456789', STUDIO_AI_FAKE: '1', STUDIO_NOTES_QUICK: '1' },
});
const stop = () => child.kill();
process.on('SIGTERM', stop); process.on('SIGINT', stop); process.on('exit', stop);
