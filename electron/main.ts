// The desktop shell. It starts the local service inside the app, on 127.0.0.1 with a fresh token,
// and opens one window onto it. Her library lives in her user folder; her API key lives in the
// operating system's secure storage (Windows Data Protection), never in a plain file.

import { app, BrowserWindow, dialog, ipcMain, Menu, safeStorage, shell } from 'electron';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync, appendFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { buildApp } from '../src/server/app.js';
import { BRAND } from '../src/brand.js';

app.setName(BRAND.name);
if (!app.requestSingleInstanceLock()) app.quit();

const here = app.getAppPath();
const userData = app.getPath('userData');
const keyFile = join(userData, 'claude-key.bin');
const logFile = join(userData, 'story-canon.log');
const log = (m: string) => { try { appendFileSync(logFile, `${new Date().toISOString()} ${m}\n`); } catch { /* nowhere to write */ } };

// Tests on Linux machines with no keyring can opt in to plain-text storage; Windows always uses Data Protection.
if (process.platform === 'linux' && process.env.STORY_CANON_TEST_PLAIN_KEYS === '1') (safeStorage as unknown as { setUsePlainTextEncryption?: (v: boolean) => void }).setUsePlainTextEncryption?.(true);

function readKey(): string | null {
  try {
    if (!existsSync(keyFile) || !safeStorage.isEncryptionAvailable()) return null;
    return safeStorage.decryptString(readFileSync(keyFile));
  } catch (e) { log(`key: ${(e as Error).message}`); return null; }
}
/** Keeps the key in the operating system's secure storage. Returns false when it could not be kept. */
function writeKey(key: string | null): boolean {
  try {
    if (!key) { rmSync(keyFile, { force: true }); return true; }
    if (!safeStorage.isEncryptionAvailable()) throw new Error('Secure storage is not available on this computer.');
    writeFileSync(keyFile, safeStorage.encryptString(key));
    return true;
  } catch (e) { log(`key: ${(e as Error).message}`); return false; }
}

function tryPort(port: number): Promise<number | null> {
  return new Promise((resolve) => {
    const s = createServer();
    s.once('error', () => resolve(null));
    s.listen(port, '127.0.0.1', () => { const p = (s.address() as { port: number }).port; s.close(() => resolve(p)); });
  });
}
/** The same port every time, so the window's own memory (last open novel, view choices) carries over between launches. */
async function steadyPort(): Promise<number> {
  const file = join(userData, 'port.txt');
  const saved = existsSync(file) ? Number(readFileSync(file, 'utf8')) : 0;
  for (const p of [saved, 47321].filter((x) => x > 1024)) { const ok = await tryPort(p); if (ok) { writeFileSync(file, String(ok)); return ok; } }
  const any = (await tryPort(0))!;
  writeFileSync(file, String(any));
  return any;
}

let win: BrowserWindow | null = null;
let service: Awaited<ReturnType<typeof buildApp>>['app'] | null = null;

async function start() {
  mkdirSync(userData, { recursive: true });
  const port = await steadyPort();
  const token = randomBytes(24).toString('hex');
  const resources = app.isPackaged ? process.resourcesPath : here;
  const built = await buildApp({
    dataPath: join(userData, 'library.sqlite3'),
    backupDir: join(app.getPath('documents'), BRAND.name, 'Backups'),
    token, port,
    staticDir: join(here, 'dist', 'ui'),
    seedDir: join(resources, 'seed'),
    aiKey: readKey(),
    onKeyChange: writeKey,
    desktop: true,
  });
  service = built.app;
  await service.listen({ host: '127.0.0.1', port });
  log(`started on ${port}`);

  win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 1000, minHeight: 640, show: false,
    title: BRAND.name, backgroundColor: '#522875', autoHideMenuBar: true,
    icon: join(here, 'build', 'icon.png'),
    webPreferences: { preload: join(here, 'dist-electron', 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, spellcheck: true },
  });
  const origin = `http://127.0.0.1:${port}`;
  // Only her own pages load in this window. Links to the web open in her browser.
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) void shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(origin)) { e.preventDefault(); if (/^https?:/.test(url)) void shell.openExternal(url); } });
  win.once('ready-to-show', () => win?.show());
  await win.loadURL(`${origin}/#t=${token}`);
}

ipcMain.handle('choose-folder', async (_e, title?: string) => {
  const r = await dialog.showOpenDialog(win!, { title: typeof title === 'string' && title ? title : 'Where should backups go?', properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0] ?? null;
});

app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

Menu.setApplicationMenu(Menu.buildFromTemplate([
  { label: 'File', submenu: [{ role: 'quit', label: `Close ${BRAND.name}` }] },
  { label: 'Edit', submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }] },
  { label: 'View', submenu: [{ role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
]));

// Closing waits for the last verified backup and a clean shutdown of her library.
let closing = false;
app.on('before-quit', (e) => {
  if (closing || !service) return;
  e.preventDefault(); closing = true;
  void service.close().catch((err) => log(`close: ${(err as Error).message}`)).finally(() => app.exit(0));
});
app.on('window-all-closed', () => app.quit());

app.whenReady().then(start).catch((e) => {
  log(`start failed: ${(e as Error).stack ?? e}`);
  dialog.showErrorBox(BRAND.name, `${BRAND.name} could not start. Your work is safe. Details were written to ${logFile}.`);
  app.exit(1);
});
